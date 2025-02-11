import React, { useState } from 'react';

const FileInput = () => {
  const [jsonData, setJsonData] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const parsedData = JSON.parse(text);
          setJsonData(parsedData);
          setError('');
        } catch (error) {
          setError('Invalid JSON file.');
          setJsonData(null);
        }
      };

      reader.onerror = () => {
        setError('Error reading file.');
        setJsonData(null);
      }

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
      {jsonData && (
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
          {JSON.stringify(jsonData, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default FileInput;