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
  const [darkMode, setDarkMode] = useState(() => {
    // Load dark mode preference from localStorage, default to false if not found
    const savedMode = localStorage.getItem("darkMode");
    return savedMode === "true"; // Convert string to boolean
  });

  // Apply dark mode class to body AND save to localStorage
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("darkMode", "true"); // Store as string
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("darkMode", "false"); // Store as string
    }
  }, [darkMode]);

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
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <header
        className={`bg-gradient-to-r from-[#6b21a8] to-[#4c1d95] text-white py-6 shadow-lg relative overflow-hidden`}
      >
        {/* Abstract background shapes for visual interest */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

        <div className="container mx-auto px-6 flex items-center justify-between relative z-10">
          <h1 className="text-3xl font-bold flex items-center">
            <span className="mr-3 text-4xl">💰</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 font-extrabold">
              CBE Transaction Dashboard
            </span>
          </h1>

          <div className="flex items-center space-x-4">
            <div className="text-sm opacity-80 hidden md:block">
              Commercial Bank of Ethiopia
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-[#4c1d95] hover:bg-[#6b21a8] transition-colors duration-200"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div
          className={`rounded-xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl ${
            darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-4 ${
              darkMode ? "text-purple-300" : "text-[#4c1d95]"
            }`}
          >
            Upload Transaction Data
          </h2>
          <FileInput setTransactions={setTransactions} darkMode={darkMode} />
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-8">
            <SummaryCards transactions={transactions} darkMode={darkMode} />

            <div
              className={`rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl ${
                darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
              }`}
            >
              <h2
                className={`text-2xl font-semibold mb-6 ${
                  darkMode ? "text-purple-300" : "text-[#4c1d95]"
                }`}
              >
                Monthly Expenses and Income
              </h2>
              <div className="h-96">
                <MonthlyExpensesChart
                  data={aggregatedChartData}
                  darkMode={darkMode}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TopRecipientsTable
                transactions={transactions}
                darkMode={darkMode}
              />
              <TopReasonsTable
                transactions={transactions}
                darkMode={darkMode}
              />
            </div>

            <div
              className={`rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl ${
                darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
              }`}
            >
              <h2
                className={`text-2xl font-semibold mb-6 ${
                  darkMode ? "text-purple-300" : "text-[#4c1d95]"
                }`}
              >
                Transaction Distribution
              </h2>
              <TransactionDistributionPieChart
                transactions={transactions}
                darkMode={darkMode}
              />
            </div>

            <TransactionTable transactions={transactions} darkMode={darkMode} />
          </div>
        ) : (
          <div
            className={`rounded-xl shadow-lg p-10 text-center ${
              darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
            }`}
          >
            <div className="text-6xl mb-6 animate-bounce">📊</div>
            <p
              className={`text-lg mb-4 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Please upload your CBE SMS data file (JSON format) to view your
              transactions.
            </p>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              The dashboard will show expense analysis, transaction details, and
              more after file upload.
            </p>
            <div className="mt-8 flex justify-center">
              <div
                className={`inline-flex items-center px-4 py-2 rounded-md ${
                  darkMode
                    ? "bg-gray-700 text-purple-300"
                    : "bg-purple-50 text-purple-800"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Privacy Notice: All data is processed locally in your browser
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className={`py-6 mt-12 border-t ${
          darkMode
            ? "bg-gray-900 border-gray-800 text-gray-400"
            : "bg-[#4c1d95] text-white"
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>© {new Date().getFullYear()} CBE Transaction Dashboard</p>
            </div>
            <div className="flex space-x-4">
              <a
                href="#"
                className="hover:text-white transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors duration-200"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors duration-200"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
