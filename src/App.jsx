import { useState } from 'react';
import FileInput from './components/FileInput';
import TransactionTable from './components/TransactionTable';
import SummaryCards from './components/SummaryCards';
import MonthlyExpensesBarChart from './components/MonthlyExpensesBarChart';

function App() {
  const [transactions, setTransactions] = useState([]);

  // Log transactions whenever they change
  console.log("App.jsx - transactions:", transactions);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">CBE Expense Analyzer</h1>
      <FileInput setTransactions={setTransactions}  />
      {/* Conditional rendering based on transactions */}
        {transactions.length > 0 ? (
        <>
        <div>
          <SummaryCards transactions={transactions} />
        </div>
        <div className="mt-4">
          <MonthlyExpensesBarChart data={transactions} />
        </div>
        <div className="mt-4">
            <TransactionTable transactions={transactions} />
        </div>

        </>
      ) : (
        //  Don't show "No transactions" *before* a file is uploaded
        <p>Please upload an SMS file to view transactions.</p>
      )}
    </div>
  );
}

export default App;