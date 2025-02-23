import { useState, useEffect, useMemo } from "react";
import FileInput from "./components/FileInput";
import TransactionTable from "./components/TransactionTable";
import SummaryCards from "./components/SummaryCards";
import MonthlyExpensesChart from "./components/MonthlyExpensesChart";
import TopRecipientsTable from "./components/TopRecipientsTable";
import TopReasonsTable from "./components/TopReasonsTable";
import TransactionDistributionPieChart from "./components/TransactionDistributionPieChart";

/**
 * The main application component.
 * Manages the overall state and renders child components based on the presence of transaction data.
 *
 * @returns {JSX.Element} The rendered App component.
 */
function App() {
  const [transactions, setTransactions] = useState([]);

  // Aggregate data for the chart
  const aggregatedChartData = useMemo(() => {
    if (!transactions.length) return [];

    const aggregated = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      if (isNaN(date)) {
        console.warn("Invalid date found:", transaction.date); // Keep for development warnings
        return acc;
      }
      const month = date.toISOString().slice(0, 7); // "YYYY-MM"

      if (!acc[month]) {
        acc[month] = { expenses: 0, balance: null };
      }

      if (transaction.amount > 0) {
        acc[month].expenses += transaction.amount;
      }
      acc[month].balance = transaction.currentBalance;
      return acc;
    }, {});

    // Transform into array for Recharts and sort by month chronologically
    return Object.entries(aggregated)
      .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
      .map(([month, { expenses, balance }]) => ({
        month,
        Expenses: expenses,
        Balance: balance,
      }));
  }, [transactions]);

  return (
    <div className="container mx-auto p-6 md:p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <h1 className="text-3xl font-bold text-[#6b21a8] mb-6">
        CBE Transaction Dashboard
      </h1>
      <FileInput setTransactions={setTransactions} />
      {transactions.length > 0 ? (
        <>
          <div className="mb-8">
            <SummaryCards transactions={transactions} />
          </div>

          <div className="rounded-lg border text-[#4c1d95] shadow-sm mb-8">
            <div className="p-6">
              <h2 className="text-2xl font-semibold">
                Monthly Expenses and Income
              </h2>
            </div>
            <div className="p-6 pt-0 h-96">
              <MonthlyExpensesChart data={aggregatedChartData} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <TopRecipientsTable transactions={transactions} />
            <TopReasonsTable transactions={transactions} />
          </div>
          <div className="mb-8">
            <TransactionDistributionPieChart transactions={transactions} />
          </div>

          <div className="mt-8">
            <TransactionTable transactions={transactions} />
          </div>
        </>
      ) : (
        <p className="text-gray-600">
          Please upload your CBE SMS data file (JSON format) to view your
          transactions.
        </p>
      )}
    </div>
  );
}

export default App;
