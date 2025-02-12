import * as pdfjsLib from 'pdfjs-dist';

/**
 * Extracts transaction link from SMS text.
 * @param {string} text The SMS message text.
 * @returns {string|null} The extracted URL if found, else null.
 */
export function extractFromSms(text) {
  const linkRegex = /(https?:\/\/\S+)/;
  const match = text.match(linkRegex);
  return match ? match[0] : null;
}

/**
 * Fetches content from a URL. If PDF, parses it.
 * @param {string} url The URL to fetch.
 * @returns {Promise<{ type: 'pdf', text: string } | { type: 'error', message: string }>} The parsed content or error.
 */
export async function fetchContent(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return { type: 'error', message: `HTTP error: ${response.status}` };
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/pdf')) {
      const arrayBuffer = await response.arrayBuffer();
      // Load the PDF document using pdfjs-dist
      try {
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let pdfText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();

          // Extract the text from the textContent
          const pageText = textContent.items.map(item => item.str).join(' ');
          pdfText += pageText + '\n';
        }

        return { type: 'pdf', text: pdfText };
      } catch (pdfError) {
        console.error("Error extracting text from PDF:", pdfError);
        return { type: 'error', message: `Error extracting text from PDF: ${pdfError.message}` };
      }
    } else {
      return { type: 'error', message: `Unexpected content type: ${contentType}` };
    }
  } catch (error) {
    console.error(error);
    return { type: 'error', message: `Error fetching content: ${error.message}` };
  }
}

/**
 * Extracts transaction details from PDF text.
 * @param {string} text The PDF text content.
 * @returns {object} The extracted transaction data.
 */
export function extractFromPdf(text) {
  const amountRegex = /Transferred Amount\s*([\d,\.]+)\s*ETB/;
  const dateRegex = /Payment Date & Time\s*(\d{1,2}\/\d{1,2}\/\d{4})/;
  const timeRegex = /Payment Date & Time\s*\d{1,2}\/\d{1,2}\/\d{4},\s*(\d{1,2}:\d{2}:\d{2}\s*[AP]M)/;
  const receiverRegex = /Receiver\s*(.+)/;
  const payerRegex = /Payer\s*(.+)/;
  const reasonRegex = /Reason \/ Type of service\s*(.+)/;
  const totalAmountRegex = /Total amount debited from customers account\s*([\d,\.]+)\s*ETB/;

  const amountMatch = text.match(amountRegex);
  const dateMatch = text.match(dateRegex);
  const timeMatch = text.match(timeRegex);
  const receiverMatch = text.match(receiverRegex);
  const payerMatch = text.match(payerRegex);
  const reasonMatch = text.match(reasonRegex);
  const totalAmountMatch = text.match(totalAmountRegex);

  return {
    amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null,
    date: dateMatch ? dateMatch[1] : null,
    time: timeMatch ? timeMatch[1] : null,
    receiver: receiverMatch ? receiverMatch[1].trim() : null,
    payer: payerMatch ? payerMatch[1].trim() : null,
    reason: reasonMatch ? reasonMatch[1].trim() : null,
    totalAmount: totalAmountMatch ? parseFloat(totalAmountMatch[1].replace(/,/g, '')) : null,
    currentBalance: null, // Not available in the PDF
  };
}
