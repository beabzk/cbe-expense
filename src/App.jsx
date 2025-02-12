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
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Transaction Dashboard</h1>
      {/* FileInput component to handle user file uploads. */}
      <FileInput setTransactions={setTransactions}  />

      {/* Conditionally render dashboard components only if transactions exist. */}
      {transactions.length > 0 ? (
        <>
          {/* SummaryCards component to display overall financial metrics. */}
          <div>
            <SummaryCards transactions={transactions} />
          </div>

          {/* MonthlyExpensesChart to visualize expenses and balance over time. */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="text-2xl font-semibold leading-none tracking-tight">Monthly Expenses and Income</div>
            </div>
            <div className="p-6 pt-0 h-96">
                <MonthlyExpensesChart data={transactions} />
            </div>
          </div>

            {/* Container for Top Recipients and Top Senders tables, using a responsive grid layout. */}
          <div className="grid grid-cols-1 gap-4">
            <TopRecipientsTable transactions={transactions} />
            {/* TopSendersTable component removed as per the requirements. */}
          </div>

            {/* TopReasonsTable component. */}
          <TopReasonsTable transactions={transactions} />

            {/* component to visualize transaction distribution by recipient as a pie chart.*/}
          <TransactionDistributionPieChart transactions={transactions}/>
            {/* The main TransactionTable component to display detailed transaction records. */}
          <div className="mt-4">
              <TransactionTable transactions={transactions} />
          </div>
        </>
      ) : (
        <p>Please upload an SMS file to view transactions.</p>
      )}
    </div>
  );
}

export default App;