import React, { useState } from 'react';
import { fetchContent, extractFromPdf, extractFromSms } from '../lib/utils.js';

/**
 * A component that handles file input, parsing of the uploaded JSON file,
 * extraction of transaction data from SMS messages and linked PDF receipts.
 *
 * @param {object} props - The component props.
 * @param {function} props.setTransactions - A function to update the main transaction state in the parent component.
 * @returns {JSX.Element} The rendered FileInput component.
 */
const FileInput = ({ setTransactions }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

    /**
     * Handles the file change event. Reads and parses the file, extracts transaction data.
     * @param {Event} event - The file input change event.
     */
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setTransactions([]);

    try {
      const text = await file.text();
      const parsedData = JSON.parse(text);

      if (!Array.isArray(parsedData)) {
        setError('Invalid JSON format: Expected an array of messages.');
        return;
      }

      const transactions = [];
      for (const message of parsedData) {
        if (message?.text) {
           // Extract the current balance from the SMS text *before* fetching the PDF.
          let currentBalance = null;
          const balanceRegex = /Your Current Balance is ETB\s*([\d,\.]+)/;
          const balanceMatch = message.text.match(balanceRegex);
          if (balanceMatch) {
            currentBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
          }

          let transactionData = null;
          const link = extractFromSms(message.text);

          // If a CBE link exists, fetch and parse the PDF.
          if (link && link.includes('cbe.com.et')) {
            const result = await fetchContent(link);
            if (result.type === 'pdf') {
              transactionData = extractFromPdf(result.text);
            } else {
              console.error("Error fetching or parsing PDF:", result.message);
              setError(`Error fetching or parsing PDF: ${result.message}`);
            }
          }

           // Combine data extracted from PDF (if any) with the balance from the SMS.
            // Prioritize the balance extracted from the SMS.
          if (transactionData) {
            transactions.push({
              ...transactionData,
              currentBalance: currentBalance !== null ? currentBalance : transactionData.currentBalance,
            });
          }
        }
      }
        // Sort transactions by date in descending order (newest first). This is crucial
        // for correct balance calculation in SummaryCards.
      transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(transactions); // Update the main transaction state.
      if (transactions.length === 0) {
        setError("No transactions found in the file.");
      }

    } catch (error) {
      console.error("File processing error:", error);
      setError('Error processing file. Please ensure it is a valid JSON file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="mb-4 p-2 border border-gray-300 rounded-md"
      />
      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default FileInput;