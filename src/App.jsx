import { useState } from 'react';
import FileInput from './components/FileInput';

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CBE Expense Analyzer</h1>
      <FileInput />
      <div className="mt-8">
        {/* Placeholder for the dashboard */}
        <p className="text-gray-500">Dashboard will go here...</p>
      </div>
    </div>
  );
}

export default App;
