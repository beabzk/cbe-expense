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


// Added sorting function
export function sortData(data, sortColumn, sortDirection) {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = sortColumn === 'date' ? new Date(a[sortColumn]) : a[sortColumn];
      const bValue = sortColumn === 'date' ? new Date(b[sortColumn]) : b[sortColumn];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // --- Functions for aggregating top recipients, senders, and reasons ---

export function getTopRecipients(transactions, limit = 25) {
  // ... (logic from TopRecipientsTable's useMemo) ...
   const recipientCounts = {};
    const recipientTotals = {};

    transactions.forEach((tx) => {
      if (tx.receiver) { // Only count if there's a receiver
        recipientCounts[tx.receiver] = (recipientCounts[tx.receiver] || 0) + 1;
        recipientTotals[tx.receiver] = (recipientTotals[tx.receiver] || 0) + tx.amount;
      }
    });

    const sortedRecipients = Object.entries(recipientCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit); // Top 25/limit

    return sortedRecipients.map(([recipient, count]) => ({
      recipient,
      amount: recipientTotals[recipient],
      count,
    }));
}

export function getTopSenders(transactions, limit = 25) {
    // ... (logic from TopSendersTable's useMemo )
      const senderCounts = {};
      const senderTotals = {};

      transactions.forEach((tx) => {
        if (tx.payer) { // Only count if there is a payer
          senderCounts[tx.payer] = (senderCounts[tx.payer] || 0) + 1;
          senderTotals[tx.payer] = (senderTotals[tx.payer] || 0) + Math.abs(tx.amount);  // Use absolute value for consistency
        }
      });

      const sortedSenders = Object.entries(senderCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, limit);

      return sortedSenders.map(([sender, count]) => ({
        sender,
        amount: senderTotals[sender],
        count
      }));
}

export function getTopReasons(transactions, limit = 25) {
  // ... (logic from TopReasonsTable's useMemo)
    const reasonCounts = {};
    const reasonTotals = {};

    transactions.forEach((tx) => {
      if (tx.reason) {
        reasonCounts[tx.reason] = (reasonCounts[tx.reason] || 0) + 1;
        reasonTotals[tx.reason] = (reasonTotals[tx.reason] || 0) + Math.abs(tx.amount); // Use absolute value for consistency
      }
    });

    const sortedReasons = Object.entries(reasonCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit); // Top 25

      return sortedReasons.map(([reason, count]) => ({
        reason,
        category: "Unknown", // Placeholder, you'll need a way to map reasons to categories
        amount: reasonTotals[reason],
        count,
    }));
}

//you can also add a similar function for category distribution in the pie chart

export function getCategoryDistribution(transactions) {
    const categoryCounts = {};
    transactions.forEach(tx => {
        const category = tx.reason || "Uncategorized"; // Use reason as category, or default
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return Object.entries(categoryCounts).map(([name, value]) => ({
        name,
        value
    }));
}