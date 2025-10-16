// export const generateQuoteHtml = (data: any): string => {
//     const { customerInfo, selectedProduct, calculations } = data;
//     const { basePrice, wirePrice, heightPrice, outOfVnsPrice, subtotal, gstAmount, total } = calculations;
//     const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
//     return `<!DOCTYPE html><html><head><style>body{font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#333;}.container{max-width:800px;margin:auto;padding:20px;border:1px solid #eee;}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;}.header img{max-width:150px;}.company-details{text-align:right;font-size:11px;}.customer-details{margin-bottom:30px;}.quote-title{text-align:center;font-size:24px;margin-bottom:20px;text-decoration:underline;}table{width:100%;border-collapse:collapse;margin-bottom:20px;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background-color:#f2f2f2;}.total-row{background-color:#f2f2f2;font-weight:bold;}.footer{text-align:center;font-size:10px;color:#777;margin-top:30px;}</style></head><body><div class="container"><div class="header"><img src="https://vqusgnzkxkzidjsohips.supabase.co/storage/v1/object/public/quotes/logo.png" alt="Company Logo"><div class="company-details"><strong>Arpit Solar</strong><br>Sh16/114-25-K-2, Sharvodayanagar<br>Varanasi 221003 (UP)<br><strong>GSTIN:</strong> 09APKPM6299L1ZW<br><strong>Contact:</strong> 9044555572 | info@arpitsolar.com</div></div><h1 class="quote-title">Quotation</h1><div class="customer-details"><strong>To:</strong> ${customerInfo.name}<br><strong>Address:</strong> ${customerInfo.address}<br><strong>Phone:</strong> ${customerInfo.phone}<br><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</div><table><tr><th>Description</th><th>Details</th></tr><tr><td>System Capacity</td><td>${selectedProduct.kWp} kWp</td></tr><tr><td>Phase</td><td>${selectedProduct.phase}</td></tr><tr><td>Module Type</td><td>${selectedProduct.module} W</td></tr><tr><td>Module Quantity</td><td>${selectedProduct.qty}</td></tr></table><table><tr><th>Pricing</th><th style="text-align:right;">Amount</th></tr><tr><td>Base System Price</td><td style="text-align:right;">${formatCurrency(basePrice)}</td></tr>${wirePrice > 0 ? `<tr><td>Extra Wire Cost</td><td style="text-align:right;">${formatCurrency(wirePrice)}</td></tr>` : ''}${heightPrice > 0 ? `<tr><td>Extra Height Cost</td><td style="text-align:right;">${formatCurrency(heightPrice)}</td></tr>` : ''}${outOfVnsPrice > 0 ? `<tr><td>Out of Varanasi Charge</td><td style="text-align:right;">${formatCurrency(outOfVnsPrice)}</td></tr>` : ''}<tr style="font-weight: bold;"><td>Subtotal</td><td style="text-align:right;">${formatCurrency(subtotal)}</td></tr><tr><td>GST @ 8.9%</td><td style="text-align:right;">${formatCurrency(gstAmount)}</td></tr><tr class="total-row"><td style="font-size: 16px;">Total Amount</td><td style="text-align:right; font-size: 16px;">${formatCurrency(total)}</td></tr></table><div class="footer">This is a computer-generated quotation.</div></div></body></html>`;
// };














// src/lib/quoteTemplate.ts

export const generateQuoteHtml = (data: any): string => {
    const { customerInfo, selectedProduct, calculations, components = [], logoUrl } = data;
    // ✅ Ensure calculations shape is safe and compute discount/grand total on the server
    const { basePrice, marginPrice, wirePrice, heightPrice, outOfVnsPrice, subtotal, gstAmount, total, discount } = calculations || ({} as any);

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
    const t = typeof total === 'number' ? total : 0;
    const safeDiscount = typeof discount === 'number' && discount > 0 ? +discount : 0;
    const grandTotal = +(t - safeDiscount).toFixed(2);
    const includeMarginInBase = data?.channel === 'whatsapp';

    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset=\"utf-8\" />
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
        <style>
            body { font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #333; }
            .container { max-width: 800px; margin: auto; padding: 20px; border: 1px solid #eee; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
            .header img { max-width: 150px; }
            .company-details { text-align: right; font-size: 11px; }
            .customer-details { margin-bottom: 30px; }
            .quote-title { text-align: center; font-size: 24px; margin-bottom: 20px; text-decoration: underline; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total-row { background-color: #f2f2f2; font-weight: bold; }
            .footer { text-align: center; font-size: 10px; color: #777; margin-top: 30px; }
            @page { size: A4; margin: 10mm; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${logoUrl || '/logo.png'}" alt="Company Logo" style="height:auto;width:150px;">
                <div class="company-details">
                    <strong>Arpit Solar Shop</strong><br>
                    SH16/114-25-K-2, Sharvodayanagar,<br>
                    Varanasi – 221003, Uttar Pradesh<br>
                    GSTIN: 09APKPM6299L1ZW<br>
                    Contact: 9044555572<br>
                    Email: info@arpitsolar.com
                </div>
            </div>
            <h1 class="quote-title">Quotation</h1>
            <div class="customer-details">
                <strong>To:</strong> ${customerInfo.name}<br>
                <strong>Address:</strong> ${customerInfo.address}<br>
                <strong>Phone:</strong> ${customerInfo.phone}<br>
                <strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}
            </div>
            <table>
                <tr><th>Description</th><th>Details</th></tr>
                <tr><td>System Capacity</td><td>${selectedProduct.kWp} kWp</td></tr>
                <tr><td>Phase</td><td>${selectedProduct.phase}</td></tr>
                <tr><td>Module Type</td><td>${selectedProduct.module} W</td></tr>
                <tr><td>Module Quantity</td><td>${selectedProduct.qty}</td></tr>
            </table>
            <table>
                <tr><th>Component</th><th>Brand/Spec</th><th style="text-align:right;">Quantity</th></tr>
                ${Array.isArray(components) && components.length > 0
                    ? components.map((c: any) => `
                        <tr>
                            <td>${c.name ?? ''}</td>
                            <td>${[c.brand, c.spec].filter(Boolean).join(' ')}</td>
                            <td style=\"text-align:right;\">${c.quantity ?? ''}</td>
                        </tr>
                    `).join('')
                    : ''}
            </table>
            <table>
                <tr><th>Pricing</th><th style="text-align:right;">Amount</th></tr>
                <tr><td>Base System Price</td><td style="text-align:right;">${formatCurrency(basePrice + (includeMarginInBase ? (typeof marginPrice === 'number' ? marginPrice : 0) : 0))}</td></tr>
                ${wirePrice > 0 ? `<tr><td>Extra Wire Cost</td><td style="text-align:right;">${formatCurrency(wirePrice)}</td></tr>` : ''}
                ${heightPrice > 0 ? `<tr><td>Extra Height Cost</td><td style="text-align:right;">${formatCurrency(heightPrice)}</td></tr>` : ''}
                ${outOfVnsPrice > 0 ? `<tr><td>Logistics & Delivery Fee</td><td style="text-align:right;">${formatCurrency(outOfVnsPrice)}</td></tr>` : ''}
                <tr style="font-weight: bold;"><td>Subtotal</td><td style="text-align:right;">${formatCurrency(subtotal)}</td></tr>
                <tr><td>GST @ 8.9%</td><td style="text-align:right;">${formatCurrency(gstAmount)}</td></tr>
                <tr><td style="font-weight: bold;">Total Amount</td><td style="text-align:right; font-weight: bold;">${formatCurrency(total)}</td></tr>
                
                ${safeDiscount > 0 ? `<tr style=\"color: green;\"><td style=\"font-weight: bold;\">Discount</td><td style=\"text-align:right; font-weight: bold;\">-${formatCurrency(safeDiscount)}</td></tr>` : ''}

                <tr class="total-row">
                    <td style="font-size: 16px;">Grand Total</td>
                    <td style=\"text-align:right; font-size: 16px;\">${formatCurrency(grandTotal)}</td>
                </tr>
            </table>
            <div class="footer">This is a computer-generated quotation.</div>
        </div>
    </body>
    </html>`;
};








