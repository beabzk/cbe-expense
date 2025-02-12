import React, { useState } from 'react';
import { fetchContent, extractFromPdf, extractFromSms } from '../lib/utils.js';

const FileInput = () => {
  const [extractedData, setExtractedData] = useState([]);
  const [error, setError] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const text = e.target.result;
          const parsedData = JSON.parse(text);
          const transactions = [];

          if (Array.isArray(parsedData)) {
            for (const message of parsedData) {
              if (message?.text) {
                let transactionData = null;
                const link = extractFromSms(message.text);

                if (link && link.includes('cbe.com.et')) {
                  const result = await fetchContent(link);
                  if (result.type === 'pdf') {
                    transactionData = extractFromPdf(result.text);
                  } else {
                    console.error(result.message);
                  }
                }

                if (transactionData) {
                  transactions.push(transactionData);
                }
              }
            }
            setExtractedData(transactions);
          } else {
            setError('Invalid JSON format: Expected an array of messages.');
          }
        } catch (error) {
          setError('Invalid JSON file.');
          setExtractedData([]);
        }
      };

      reader.onerror = () => {
        setError('Error reading file.');
        setExtractedData([]);
      };

      reader.readAsText(file);
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
      {error && <p className="text-red-500">{error}</p>}
      {extractedData.length > 0 && (
        <div className="bg-gray-100 p-4 rounded-md overflow-auto">
          <p className="font-bold mb-2">Extracted Transactions:</p>
          <ul>
            {extractedData.map((transaction, index) => (
              <li key={index}>
                {/* Display basic transaction details for now */}
                <p>Amount: {transaction.amount}</p>
                <p>Date: {transaction.date}</p>
                {/* Add other fields as needed */}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileInput;