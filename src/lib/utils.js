import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(pdfjsWorkerUrl, import.meta.url).toString();

/**
 * Extracts a transaction link from SMS text messages.
 *
 * Uses a regular expression to find URLs within the SMS body,
 * specifically targeting CBE transaction links.
 *
 * @param {string} text - The SMS message body text.
 * @returns {string|null} The extracted URL string if found, otherwise null.
 */
export function extractFromSms(text) {
    // Regular expression to match URLs, more general for robustness against slight format changes
    const linkRegex = /(https?:\/\/\S+)/;
    const match = text.match(linkRegex);
    return match ? match[0] : null;
}

/**
 * Fetches content from a URL, with local storage caching for PDFs to improve performance and reduce server load during testing.
 *
 * For subsequent requests for the same URL, the cached PDF text is returned directly from localStorage,
 * avoiding redundant fetching and parsing.
 *
 * @param {string} url - The URL to fetch.
 * @returns {Promise<{ type: 'pdf' | 'error', text?: string, message?: string }>} - An object indicating success or error, and the PDF text content on success.
 */
export async function fetchContent(url) {
    const cacheKey = `pdfCache_${url}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
        return { type: 'pdf', text: cachedData }; // Directly return cached data
    }

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

            localStorage.setItem(cacheKey, pdfText); // Store fetched PDF in cache
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

/**
 * Helper function to extract a specific text field from the PDF content.
 *
 * It searches for text between a `startString` and an optional `endString`.
 * Designed to handle variations in whitespace and line breaks within the PDF text.
 *
 * @param {string} text - The PDF text content.
 * @param {string} startString - The string preceding the field to extract.
 * @param {string} [endString] - The string following the field to extract (optional).
 * @returns {string|null} - The extracted text field, or null if not found.
 */
function extractField(text, startString, endString) {
    const start = text.indexOf(startString);
    if (start === -1) {
        return null; // Indicate field not found
    }
    const startIndex = start + startString.length;
    const endIndex = endString ? text.indexOf(endString, startIndex) : text.length;
    if (endIndex === -1 && endString) {
        return null; // Indicate end string not found
    }
    return text.substring(startIndex, endIndex).trim(); // Extract and clean the text
}

/**
 * Helper function to extract Payer or Receiver names from the PDF content.
 *
 * Uses a more robust approach by looking for "Payer   " or "Receiver   " (note triple spaces)
 * followed by the name, and delimited by "  Account" or a newline character.
 *
 * @param {string} text - The PDF text content.
 * @param {string} type -  "Payer" or "Receiver" to specify which entity to extract.
 * @returns {string|null} - The extracted Payer or Receiver name, or null if not found.
 */
function extractPayerReceiver(text, type) {
    const startString = type + "   "; // Triple spaces for more specific delimiter
    const start = text.indexOf(startString);
    if (start === -1) {
        return null; // Indicate Payer/Receiver not found
    }
    let end = text.indexOf("  Account", start); // Delimiter: "  Account"
    if (end === -1) {
        end = text.indexOf("\n", start); // Fallback delimiter: newline
    }
    if (end === -1) {
        return null; // No reasonable end delimiter found
    }
    return text.substring(start + startString.length, end).trim(); // Extract and clean name
}


/**
 * Extracts transaction details from the text content of a CBE Customer Receipt PDF.
 *
 * This function relies on the consistent layout of the CBE PDF receipts to locate and extract
 * key transaction fields using string searching and helper functions. It is designed to be
 * fault-tolerant to minor variations in the PDF format but may fail if the layout changes significantly.
 *
 * @param {string} text - The text content extracted from the PDF.
 * @returns {object} - An object containing the extracted transaction details, or null if extraction fails.
 *                    The object includes: amount, date, time, receiver, payer, reason, and totalAmount.
 */
export function extractFromPdf(text) {

    const amountStr = extractField(text, "Transferred Amount   ", " ETB");
    const dateStr = extractField(text, "Payment Date & Time   ", "  Reference No.");
    //const referenceNo = extractField(text, "Reference No. (VAT Invoice No)   ", "\n"); // Not needed for current requirements, comment out extraction
    const reason = extractField(text, "Reason / Type of service   ", "Transferred Amount");
    const totalAmountStr = extractField(text, "Total amount debited from customers account   ", " ETB");
    const receiver = extractPayerReceiver(text, "Receiver");
    const payer = extractPayerReceiver(text, "Payer");


    let amount = amountStr ? parseFloat(amountStr.replace(/,/g, '').trim()) : null;
    let totalAmount = totalAmountStr ? parseFloat(totalAmountStr.replace(/,/g, '').trim()) : null;
    let formattedDate = null;
    let time = null;

    if (dateStr) {
        // Matches date and time format: MM/DD/YYYY, HH:MM:SS AM/PM or M/D/YYYY, HH:MM:SS AM/PM
        let dateMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}:\d{2}:\d{2}\s*[AP]M)/);
        if (!dateMatch) {
            dateMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}:\d{2}:\d{2}\s*[AP]M)/); // Redundant, but kept for robustness if month and day positions vary
        }

        if (dateMatch) {
            const [_, monthStr, dayStr, year, timeStr] = dateMatch;
            const month = parseInt(monthStr, 10);
            const day = parseInt(dayStr, 10);
            if (!isNaN(month) && !isNaN(day)) {
                formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                time = timeStr;
            } else {
                console.warn("extractFromPdf: Invalid month or day in date string:", dateStr); // Development warning for date parsing issues
            }
        } else {
            console.warn("extractFromPdf: Date format not recognized:", dateStr); // Development warning for unrecognised date format
        }
    }


    const extractedData = {
        amount: amount,
        date: formattedDate,
        time: time,
        receiver: receiver,
        payer: payer,
        reason: reason,
        //referenceNo: referenceNo, // Not needed
        totalAmount: totalAmount,
    };

    return extractedData;
}


/**
 * Sorts an array of data based on a specified column and direction.
 *
 * Uses localeCompare for string comparison and standard comparison for numbers and dates.
 *
 * @param {Array<object>} data - The array of data objects to sort.
 * @param {string} sortColumn - The key (property) to sort by.
 * @param {string} sortDirection - 'asc' for ascending, 'desc' for descending.
 * @returns {Array<object>} - The sorted array of data.
 */
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

/**
 * Aggregates transaction data to find top recipients based on transaction count and total amount.
 * @param {Array<object>} transactions - Array of transaction objects.
 * @param {number} [limit=25] - Maximum number of top recipients to return.
 * @returns {Array<object>} - Array of top recipients with recipient, amount, and count.
 */
export function getTopRecipients(transactions, limit = 25) {
     const recipientCounts = {};
    const recipientTotals = {};

    transactions.forEach((tx) => {
      if (tx.receiver) {
        recipientCounts[tx.receiver] = (recipientCounts[tx.receiver] || 0) + 1;
        recipientTotals[tx.receiver] = (recipientTotals[tx.receiver] || 0) + tx.amount;
      }
    });

    const sortedRecipients = Object.entries(recipientCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit);

    return sortedRecipients.map(([recipient, count]) => ({
      recipient,
      amount: recipientTotals[recipient],
      count,
    }));
}

/**
 * Aggregates transaction data to find top senders based on transaction count and total amount.
 * @param {Array<object>} transactions - Array of transaction objects.
 * @param {number} [limit=25] - Maximum number of top senders to return.
 * @returns {Array<object>} - Array of top senders with sender, amount, and count.
 */
export function getTopSenders(transactions, limit = 25) {
      const senderCounts = {};
      const senderTotals = {};

      transactions.forEach((tx) => {
        if (tx.payer) {
          senderCounts[tx.payer] = (senderCounts[tx.payer] || 0) + 1;
          senderTotals[tx.payer] = (senderTotals[tx.payer] || 0) + Math.abs(tx.amount);
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

/**
 * Aggregates transaction data to find top transaction reasons based on count and total amount.
 * @param {Array<object>} transactions - Array of transaction objects.
 * @param {number} [limit=25] - Maximum number of top reasons to return.
 * @returns {Array<object>} - Array of top reasons with reason, category, amount, and count.
 */
export function getTopReasons(transactions, limit = 25) {
    const reasonCounts = {};
    const reasonTotals = {};

    transactions.forEach((tx) => {
      if (tx.reason) {
        reasonCounts[tx.reason] = (reasonCounts[tx.reason] || 0) + 1;
        reasonTotals[tx.reason] = (reasonTotals[tx.reason] || 0) + Math.abs(tx.amount);
      }
    });

    const sortedReasons = Object.entries(reasonCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit);

      return sortedReasons.map(([reason, count]) => ({
        reason,
        category: "Unknown", // Placeholder, category mapping could be added later
        amount: reasonTotals[reason],
        count,
    }));
}

/**
 * Calculates the distribution of transactions across categories (currently based on 'reason').
 * @param {Array<object>} transactions - Array of transaction objects.
 * @returns {Array<object>} - Array of category distributions with name and value for chart data.
 */
export function getCategoryDistribution(transactions) {
    const categoryCounts = {};
    transactions.forEach(tx => {
        const category = tx.reason || "Uncategorized";
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return Object.entries(categoryCounts).map(([name, value]) => ({
        name,
        value
    }));
}