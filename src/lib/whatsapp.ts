import axios from 'axios';

export async function sendWhatsAppMessage(phone: string, pdfUrl: string) {
  try {
    const apiKey = process.env.DOUBLETICK_API_KEY;
    const senderPhone = process.env.DOUBLETICK_SENDER_PHONE;
    if (!apiKey || !senderPhone) throw new Error('Doubletick API Key or Sender Phone is not set');
    const cleanedPhone = phone.replace(/[^0-9]/g, '');
    if (cleanedPhone.length !== 10) throw new Error(`Invalid phone number: ${phone}`);
    const formattedPhone = `+91${cleanedPhone}`;
    const payload = {
      messages: [{ to: formattedPhone, from: senderPhone, content: { templateName: 'quotation_document', language: 'en', templateData: { header: { type: 'DOCUMENT' as const, mediaUrl: pdfUrl, filename: pdfUrl.split('/').pop() }, body: { placeholders: [] } } } }]
    };
    await axios.post('https://public.doubletick.io/whatsapp/message/template', payload, { headers: { 'accept': 'application/json', 'content-type': 'application/json', 'Authorization': apiKey } });
    console.log(`WhatsApp message sent to ${formattedPhone}`);
  } catch (error: any) {
    console.error('Doubletick API error:', error.response ? error.response.data : error.message);
    throw new Error('Failed to send WhatsApp message.');
  }
}