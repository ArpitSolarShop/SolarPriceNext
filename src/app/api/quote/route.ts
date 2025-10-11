import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppMessage } from '../../../lib/whatsapp';
import { generateQuoteHtml } from '../../../lib/quoteTemplate';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function POST(request: Request) {
  try {
    const quoteData = await request.json();
    const htmlContent = generateQuoteHtml(quoteData);

    // FIXED: Changed headless from "new" to true
    const browser = await puppeteer.launch({ 
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
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