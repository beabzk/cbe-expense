import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(pdfjsWorkerUrl, import.meta.url).toString();

export function extractFromSms(text) {
    const linkRegex = /(https?:\/\/\S+)/;
    const match = text.match(linkRegex);
    return match ? match[0] : null;
}

export async function fetchContent(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return { type: 'error', message: `HTTP error: ${response.status}` };
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/pdf')) {
            return { type: 'error', message: `Unexpected content type: ${contentType}` };
        }

        const arrayBuffer = await response.arrayBuffer();
        try {
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            let pdfText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                pdfText += textContent.items.map(item => item.str).join(' ') + '\n';
            }
            return { type: 'pdf', text: pdfText };
        } catch (pdfError) {
            console.error("Error extracting text from PDF:", pdfError);
            return { type: 'error', message: `PDF parsing error: ${pdfError.message}` };
        }
    } catch (error) {
        console.error("Fetch error:", error);
        return { type: 'error', message: `Network error: ${error.message}` };
    }
}

export function extractFromPdf(text) {
    console.log("extractFromPdf - Raw PDF text:", text);

    function extractField(startString, endString, required = true) {
        const start = text.indexOf(startString);
        if (start === -1) {
            if (required) {
                console.warn(`extractFromPdf: Start string not found: "${startString}"`);
            }
            return null;
        }
        const startIndex = start + startString.length;
        const endIndex = endString ? text.indexOf(endString, startIndex) : text.length;

        if (endIndex === -1 && endString) {
            if (required) {
                console.warn(`extractFromPdf: End string not found: "${endString}"`);
            }
            return null;
        }
        if (endString)
            return text.substring(startIndex, endIndex).trim();

        return text.substring(startIndex).trim(); // if no end string return the rest.
    }

    function extractPayerReceiver(type) {
        const startString = type + " "; // "Payer " or "Receiver "
        const start = text.indexOf(startString);
        if (start === -1) {
            console.warn(`extractFromPdf: ${type} not found.`);
            return null;
        }

        const accountString = "  Account"; // Two spaces before "Account"
        const accountIndex = text.indexOf(accountString, start + startString.length);

        if (accountIndex === -1) {
            console.warn(`extractFromPdf: Could not find Account after ${type}.`);
            return null;
        }
        // Extract the name based on the found indices.
        const name = text.substring(start + startString.length, accountIndex).trim();

        return name;

    }
    const amountStr = extractField("Transferred Amount", "ETB");
    const dateStr = extractField("Payment Date & Time", "Reference No.");
    const receiver = extractPayerReceiver("Receiver"); // Use improved extraction
    const payer = extractPayerReceiver("Payer");       // Use improved extraction
    const reason = extractField("Reason / Type of service", "Transferred Amount");
    const totalAmountStr = extractField("Total amount debited from customers account", "ETB");

      let formattedDate = null;
        if (dateStr) {
           const dateMatch = dateStr.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
           if(dateMatch){
               const [day, month, year] = dateMatch[1].split('/');
               formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
           } else{
            console.warn("extractFromPdf:  date format can not be extracted", dateStr); // More specific warning
           }
        }

    const extractedData = {
        amount: amountStr ? parseFloat(amountStr.replace(/,/g, '').trim()) : null,
        date: formattedDate,
        time: dateStr ? dateStr.match(/\d{1,2}:\d{2}:\d{2}\s*[AP]M/)?.[0] : null, // Extract time separately
        receiver: receiver,
        payer: payer,
        reason: reason,
        totalAmount: totalAmountStr ? parseFloat(totalAmountStr.replace(/,/g, '').trim()) : null,
        // currentBalance: null,  // REMOVED:  Let FileInput handle this
    };

    console.log("extractFromPdf - Extracted data:", extractedData);
    return extractedData;
}