import { NextResponse } from 'next/server';
// Use dynamic imports to support serverless-compatible Chromium in production
import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppMessage } from '../../../lib/whatsapp';
import { generateQuoteHtml } from '../../../lib/quoteTemplate';

export const runtime = 'nodejs';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function POST(request: Request) {
  try {
    const quoteData = await request.json();
    const htmlContent = generateQuoteHtml(quoteData);

    // Launch Chromium appropriately for the environment
    let browser: any;
    if (process.env.NODE_ENV === 'production') {
      const chromium = await import('@sparticuz/chromium');
      const puppeteerCore = await import('puppeteer-core');
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      const puppeteer = await import('puppeteer');
      browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    const fileName = `quotation-${quoteData.customerInfo.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    const bucketName = process.env.SUPABASE_BUCKET!;

    const { error: uploadError } = await supabase.storage.from(bucketName).upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: false });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);

    await sendWhatsAppMessage(quoteData.customerInfo.phone, urlData.publicUrl);

    return NextResponse.json({ message: 'Quotation sent successfully!' });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ message: error.message || 'Server error occurred.' }, { status: 500 });
  }
}