import React, { useState } from 'react';
import { fetchContent, extractFromPdf, extractFromSms } from '../lib/utils.js';

const FileInput = ({ setTransactions }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
          // Extract Balance *BEFORE* fetching the PDF
          let currentBalance = null;
          const balanceRegex = /Your Current Balance is ETB\s*([\d,\.]+)/; // Regex to extract balance
          const balanceMatch = message.text.match(balanceRegex);
          if (balanceMatch) {
            currentBalance = parseFloat(balanceMatch[1].replace(/,/g, '')); // Remove commas and parse
          }
          console.log("FileInput.jsx - Extracted balance from SMS:", currentBalance);


          let transactionData = null;
          const link = extractFromSms(message.text);

          if (link && link.includes('cbe.com.et')) {
            const result = await fetchContent(link);
            if (result.type === 'pdf') {
              transactionData = extractFromPdf(result.text);
            } else {
              console.error("Error fetching or parsing PDF:", result.message);
              setError(`Error fetching or parsing PDF: ${result.message}`);
            }
          }

            // Combine PDF data with extracted balance
          if (transactionData) {
            transactions.push({
              ...transactionData,  // Spread the PDF data
              currentBalance: currentBalance !== null ? currentBalance : transactionData.currentBalance, // Use SMS balance if available
              //the following fields are already handled by spread operator(...transactioData)
              // amount: transactionData.amount,
              // date: transactionData.date,
              // time: transactionData.time,
              // receiver: transactionData.receiver,
              // payer: transactionData.payer,
              // reason: transactionData.reason,
              // totalAmount: transactionData.totalAmount
            });
          }
        }
      }
      setTransactions(transactions);
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