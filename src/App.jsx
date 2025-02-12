import { useState } from 'react';
import FileInput from './components/FileInput';
import TransactionTable from './components/TransactionTable';
import SummaryCards from './components/SummaryCards';
import MonthlyExpensesBarChart from './components/MonthlyExpensesBarChart';

function App() {
  const [transactions, setTransactions] = useState([]);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">CBE Expense Analyzer</h1>
      <FileInput setTransactions={setTransactions} />
      <div>
        <SummaryCards transactions={transactions} />
      </div>
      <div className="mt-4">
        <MonthlyExpensesBarChart transactions={transactions} />
      </div>
      <div className="mt-4">
        <TransactionTable transactions={transactions} />
      </div>
    </div>
  );
}

export default App;
