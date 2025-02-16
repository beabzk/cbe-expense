import React, { useState } from 'react';
import { fetchContent, extractFromPdf, extractFromSms } from '../lib/utils.js';

/**
 * A component that handles file input, parsing of the uploaded JSON file,
 * extraction of transaction data from SMS messages and linked PDF receipts,
 * and provides progress updates to the user.
 *
 * @param {object} props - The component props.
 * @param {function} props.setTransactions - A function to update the main transaction state in the parent component.
 * @returns {JSX.Element} The rendered FileInput component.
 */
const FileInput = ({ setTransactions }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState(''); // NEW: Progress message

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setTransactions([]);
    setProgressMessage('Reading file...'); // Initial progress message

    try {
      const text = await file.text();
      setProgressMessage('Parsing JSON...');
      const parsedData = JSON.parse(text);

      if (!Array.isArray(parsedData)) {
        setError('Invalid JSON format: Expected an array of messages.');
        return;
      }

      const transactions = [];
      setProgressMessage('Processing SMS messages...'); // Update progress

      for (const [index, message] of parsedData.entries()) {
        if (message?.text) {
          let currentBalance = null;
          const balanceRegex = /Your Current Balance is ETB\s*([\d,\.]+)/;
          const balanceMatch = message.text.match(balanceRegex);
          if (balanceMatch) {
            currentBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
          }

          let transactionData = null;
          const link = extractFromSms(message.text);

          if (link && link.includes('cbe.com.et')) {
            setProgressMessage(`Fetching and parsing PDF ${index + 1} of ${parsedData.length}...`); // More specific progress
            const result = await fetchContent(link);
            if (result.type === 'pdf') {
              transactionData = extractFromPdf(result.text);
            } else {
              console.error("Error fetching or parsing PDF:", result.message);
              setError(`Error fetching or parsing PDF: ${result.message}`);
            }
          }

          if (transactionData) {
            transactions.push({
              ...transactionData,
              currentBalance: currentBalance !== null ? currentBalance : transactionData.currentBalance,
            });
          }
        }

          // Update progress indicator.  Do this *inside* the loop to show
          // progress as each SMS/PDF is processed.
          const percentage = Math.round(((index + 1) / parsedData.length) * 100);
          setProgressMessage(`Processing SMS messages... ${percentage}%`);
      }

      transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(transactions);
      if (transactions.length === 0) {
        setError("No transactions found in the file.");
      }

    } catch (error) {
      console.error("File processing error:", error);
      setError('Error processing file. Please ensure it is a valid JSON file.');
    } finally {
      setLoading(false);
      setProgressMessage(''); // Clear progress message when done
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mb-8">
      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="mb-4 p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cbe-purple focus:border-transparent"
      />

      {loading && (
        <div className="flex items-center justify-center text-cbe-purple">
          <svg
            className="animate-spin h-5 w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{progressMessage}</span> {/* Display the progress message */}
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
};

export default FileInput;