import React, { useState, useRef } from "react";
import { fetchContent, extractFromPdf, extractFromSms } from "../lib/utils.js";

/**
 * A component that handles file input, parsing of the uploaded JSON file,
 * extraction of transaction data from SMS messages and linked PDF receipts,
 * and provides progress updates to the user.
 *
 * @param {object} props - The component props.
 * @param {function} props.setTransactions - A function to update the main transaction state in the parent component.
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 * @returns {JSX.Element} The rendered FileInput component.
 */
const FileInput = ({ setTransactions, darkMode = false }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target?.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const processFile = async (file) => {
    if (!file.name.toLowerCase().endsWith(".json")) {
      setError("Please select a JSON file");
      return;
    }

    setLoading(true);
    setError("");
    setTransactions([]);
    setProgressMessage("Reading file...");
    setProgress(5);

    try {
      const text = await file.text();
      setProgressMessage("Parsing JSON...");
      setProgress(10);
      const parsedData = JSON.parse(text);

      if (!Array.isArray(parsedData)) {
        setError("Invalid JSON format: Expected an array of messages.");
        return;
      }

      const transactions = [];
      setProgressMessage("Processing SMS messages...");

      for (const [index, message] of parsedData.entries()) {
        if (message?.text) {
          let currentBalance = null;
          const balanceRegex = /Your Current Balance is ETB\s*([\d,\.]+)/;
          const balanceMatch = message.text.match(balanceRegex);
          if (balanceMatch) {
            currentBalance = parseFloat(balanceMatch[1].replace(/,/g, ""));
          }

          let transactionData = null;
          const link = extractFromSms(message.text);

          if (link && link.includes("cbe.com.et")) {
            setProgressMessage(
              `Fetching and parsing PDF ${index + 1} of ${parsedData.length}...`
            );
            const result = await fetchContent(link);
            if (result.type === "pdf") {
              transactionData = extractFromPdf(result.text);
            } else {
              console.error("Error fetching or parsing PDF:", result.message);
              setError(`Error fetching or parsing PDF: ${result.message}`);
            }
          }

          if (transactionData) {
            transactions.push({
              ...transactionData,
              currentBalance:
                currentBalance !== null
                  ? currentBalance
                  : transactionData.currentBalance,
            });
          }
        }

        const percentage =
          Math.round(((index + 1) / parsedData.length) * 90) + 10;
        setProgress(percentage);
        setProgressMessage(`Processing SMS messages... ${percentage}%`);
      }

      transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(transactions);

      if (transactions.length === 0) {
        setError("No transactions found in the file.");
      } else {
        setProgressMessage(
          `Successfully processed ${transactions.length} transactions!`
        );

        // Show success message briefly
        setTimeout(() => {
          setProgressMessage("");
        }, 3000);
      }
    } catch (error) {
      console.error("File processing error:", error);
      setError("Error processing file. Please ensure it is a valid JSON file.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const dropzoneClasses = `
    relative
    border-2
    border-dashed
    rounded-lg
    p-8
    text-center
    transition-all
    duration-200
    cursor-pointer
    flex
    flex-col
    items-center
    justify-center
    ${
      isDragging
        ? darkMode
          ? "border-[#8b5cf6] bg-purple-900/20"
          : "border-[#8b5cf6] bg-purple-50"
        : darkMode
        ? "border-gray-600 hover:border-[#8b5cf6] hover:bg-purple-900/20"
        : "border-gray-300 hover:border-[#8b5cf6] hover:bg-purple-50"
    }
    ${darkMode ? "text-gray-300" : "text-gray-500"}
  `;

  return (
    <div className="mb-6">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Custom dropzone */}
      <div
        className={dropzoneClasses}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileInput}
      >
        <div className="mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-12 w-12 mx-auto ${
              darkMode ? "text-[#8b5cf6]" : "text-[#6b21a8]"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v12"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <p className="font-medium">
            Drag and drop your file here or click to browse
          </p>
          <p className="text-sm">Accepts CBE SMS data in JSON format only</p>
        </div>
      </div>

      {/* Processing indicator */}
      {loading && (
        <div
          className={`mt-6 rounded-lg p-4 ${
            darkMode ? "bg-gray-800" : "bg-gray-50"
          }`}
        >
          <div className="flex items-center space-x-3 mb-2">
            <svg
              className={`animate-spin h-5 w-5 ${
                darkMode ? "text-[#8b5cf6]" : "text-[#6b21a8]"
              }`}
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
            <span className="font-medium">{progressMessage}</span>
          </div>

          {/* Progress bar */}
          <div
            className={`h-2 w-full rounded-full overflow-hidden ${
              darkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            <div
              className="h-full bg-gradient-to-r from-[#6b21a8] to-[#4c1d95] transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Success message when not loading but progress message exists */}
      {!loading && progressMessage && (
        <div
          className={`mt-6 rounded-lg p-4 ${
            darkMode
              ? "bg-green-900/20 text-green-300"
              : "bg-green-50 text-green-700"
          } flex items-center space-x-2`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>{progressMessage}</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          className={`mt-6 rounded-lg p-4 ${
            darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"
          } flex items-center space-x-2`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileInput;
