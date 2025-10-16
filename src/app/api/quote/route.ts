import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
// Use dynamic imports to support serverless-compatible Chromium in production
import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppMessage } from '../../../lib/whatsapp';
import { generateQuoteHtml } from '../../../lib/quoteTemplate';
import { defaultComponents } from '../../../data/components';
import { GST_RATE } from '../../../data/priceList';

export const runtime = 'nodejs';

// Supabase client will be created lazily inside handlers after env validation

export async function POST(request: Request) {
  try {
    const quoteData = await request.json();

    // Basic input validation (minimal schema without external deps)
    if (!quoteData?.customerInfo?.name || !quoteData?.customerInfo?.phone) {
      return NextResponse.json({ message: 'Customer name and phone are required.' }, { status: 400 });
    }
    if (!quoteData?.selectedProduct) {
      return NextResponse.json({ message: 'Selected product is required.' }, { status: 400 });
    }

    // Env validation
    const missingEnv: string[] = [];
    if (!process.env.SUPABASE_URL) missingEnv.push('SUPABASE_URL');
    if (!process.env.SUPABASE_KEY) missingEnv.push('SUPABASE_KEY');
    if (!process.env.SUPABASE_BUCKET) missingEnv.push('SUPABASE_BUCKET');
    if (missingEnv.length) {
      return NextResponse.json({ message: `Missing environment variables: ${missingEnv.join(', ')}` }, { status: 500 });
    }

    // Server-side pricing recompute for integrity
    const calc = quoteData?.calculations || {};
    const n = (v: any) => (typeof v === 'number' && isFinite(v) ? v : 0);
    const basePrice = n(calc.basePrice);
    const marginPrice = n(calc.marginPrice);
    const wirePrice = n(calc.wirePrice);
    const heightPrice = n(calc.heightPrice);
    const outOfVnsPrice = n(calc.outOfVnsPrice);
    const subtotal = basePrice + marginPrice + wirePrice + heightPrice + outOfVnsPrice;
    const gstAmount = +(subtotal * (typeof quoteData?.taxRate === 'number' ? quoteData.taxRate : GST_RATE)).toFixed(2);
    const total = +(subtotal + gstAmount).toFixed(2);
    const discount = Math.max(0, n(calc.discount));
    const grandTotal = Math.max(0, +(total - discount).toFixed(2));

    // Attach components list to the PDF payload
    // Resolve absolute logo URL from public folder so Chromium can fetch it
    const origin = process.env.APP_ORIGIN || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    let logoUrl = `${origin}/logo.png`;
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logo.png');
      const logoBuffer = await fs.readFile(logoPath);
      logoUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch (logoError) {
      console.warn('Falling back to origin logo URL', logoError);
    }

    const htmlContent = generateQuoteHtml({
      ...quoteData,
      components: defaultComponents,
      logoUrl,
      calculations: { basePrice, marginPrice, wirePrice, heightPrice, outOfVnsPrice, subtotal, gstAmount, total, discount, grandTotal }
    });

    // Launch Chromium appropriately for the environment
    let browser: any;
    if (process.env.NODE_ENV === 'production') {
      const { default: chromium } = await import('@sparticuz/chromium');
      const { default: puppeteerCore } = await import('puppeteer-core');
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      const { default: puppeteer } = await import('puppeteer');
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    let pdfBuffer: Buffer | Uint8Array;
    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      await page.emulateMediaType('screen');
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', right: '10mm', bottom: '12mm', left: '10mm' }
      });
    } finally {
      try { await browser.close(); } catch {}
    }

    const fileName = `quotation-${quoteData.customerInfo.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    const bucketName = process.env.SUPABASE_BUCKET!;

    // Create Supabase client now that envs are validated
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

    const { error: uploadError } = await supabase.storage.from(bucketName).upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: false });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);

    // Ensure the PDF URL is reachable before attempting WhatsApp send
    let pdfUrl = urlData.publicUrl;
    try {
      const fetchWithTimeout = async (url: string, timeoutMs = 8000) => {
        const ctrl = new AbortController();
        const id = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
          const res = await fetch(url, { method: 'HEAD', signal: ctrl.signal });
          return res.ok;
        } finally {
          clearTimeout(id);
        }
      };
      let ok = await fetchWithTimeout(pdfUrl, 8000);
      if (!ok) {
        await new Promise(r => setTimeout(r, 1000));
        ok = await fetchWithTimeout(pdfUrl, 12000);
        if (!ok) {
          // Fallback to a signed URL if public URL is slow or blocked
          const { data: signed } = await supabase.storage.from(bucketName).createSignedUrl(fileName, 60 * 60); // 1 hour
          if (signed?.signedUrl) {
            pdfUrl = signed.signedUrl;
          }
        }
      }
    } catch {}

    await sendWhatsAppMessage(quoteData.customerInfo.phone, pdfUrl);

    return NextResponse.json({ message: 'Quotation sent successfully!', url: urlData.publicUrl, totals: { subtotal, gstAmount, total, discount, grandTotal } });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ message: error.message || 'Server error occurred.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const missingEnv: string[] = [];
    if (!process.env.SUPABASE_URL) missingEnv.push('SUPABASE_URL');
    if (!process.env.SUPABASE_KEY) missingEnv.push('SUPABASE_KEY');
    if (!process.env.SUPABASE_BUCKET) missingEnv.push('SUPABASE_BUCKET');
    if (!process.env.DOUBLETICK_API_KEY) missingEnv.push('DOUBLETICK_API_KEY');
    if (!process.env.DOUBLETICK_SENDER_PHONE) missingEnv.push('DOUBLETICK_SENDER_PHONE');
    const ok = missingEnv.length === 0;
    return NextResponse.json({ ok, missingEnv });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'Health check failed' }, { status: 500 });
  }
}