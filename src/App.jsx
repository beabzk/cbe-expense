import { useState } from 'react';
import FileInput from './components/FileInput';
import TransactionTable from './components/TransactionTable';
import SummaryCards from './components/SummaryCards';
import MonthlyExpensesChart from './components/MonthlyExpensesChart';
import TopRecipientsTable from './components/TopRecipientsTable';
import TopReasonsTable from './components/TopReasonsTable';
import TransactionDistributionPieChart from './components/TransactionDistributionPieChart';


/**
 * The main application component.
 * Manages the overall state and renders child components based on the presence of transaction data.
 *
 * @returns {JSX.Element} The rendered App component.
 */
function App() {
  const [transactions, setTransactions] = useState([]);

  return (
    <div className="container mx-auto p-6 md:p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-cbe-purple mb-6">CBE Transaction Dashboard</h1>
      {/* FileInput component to handle user file uploads. */}
      <FileInput setTransactions={setTransactions} />

      {/* Conditionally render dashboard components only if transactions exist. */}
      {transactions.length > 0 ? (
        <>
          {/* SummaryCards component to display overall financial metrics. */}
          <div className="mb-8">
            <SummaryCards transactions={transactions} />
          </div>

          {/* MonthlyExpensesChart to visualize expenses and balance over time. */}
          <div className="rounded-lg border bg-cbe-purple-light text-cbe-purple-dark shadow-sm mb-8">
            <div className="p-6">
              <h2 className="text-2xl font-semibold">Monthly Expenses and Income</h2>
            </div>
            <div className="p-6 pt-0 h-96">
              <MonthlyExpensesChart data={transactions} />
            </div>
          </div>

          {/* Container for Top Recipients and Top Senders tables, using a responsive grid layout. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <TopRecipientsTable transactions={transactions} />
             {/* TopSendersTable component is removed */}
            <TopReasonsTable transactions={transactions} />
          </div>
          {/* component to visualize transaction distribution by recipient as a pie chart.*/}
          <div className='mb-8'>
            <TransactionDistributionPieChart transactions={transactions}/>
          </div>

          {/* The main TransactionTable component to display detailed transaction records. */}
          <div className="mt-8">
            <TransactionTable transactions={transactions} />
          </div>
        </>
      ) : (
        <p className="text-gray-600">Please upload your CBE SMS data file (JSON format) to view your transactions.</p>
      )}
    </div>
  );
}

export default App;