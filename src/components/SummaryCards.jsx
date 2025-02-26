import React from "react";

/**
 * A component to display summary cards showing total expenses and current balance.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.transactions - An array of transaction objects.
 * @param {boolean} props.darkMode - Whether dark mode is enabled.
 * @returns {JSX.Element} The rendered SummaryCards component.
 */
const SummaryCards = ({ transactions = [], darkMode = false }) => {
  // Calculate total expenses.  Filters for transactions with positive amounts (CBE debits).
  const totalExpenses = transactions
    .filter((t) => t.amount && t.amount > 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  // Get the most recent currentBalance from the first transaction in the sorted array.
  // Assumes transactions are sorted newest to oldest.  Provides a default value of 0
  // if there are no transactions.
  const currentBalance =
    transactions.length > 0 ? transactions[0].currentBalance : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Total Expenses Card */}
      <div
        className={`flex flex-col p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${
          darkMode
            ? "bg-red-900/20 border border-red-700 text-red-300"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold">Total Expenses</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <p className="text-3xl font-bold">ETB {totalExpenses.toFixed(2)}</p>
      </div>

      {/* Current Balance Card */}
      <div
        className={`flex flex-col p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${
          darkMode
            ? "bg-green-900/20 border border-green-700 text-green-300"
            : "bg-green-50 border border-green-200 text-green-700"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold">Current Balance</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <p className="text-3xl font-bold">
          ETB {currentBalance !== null ? currentBalance.toFixed(2) : "N/A"}
        </p>
      </div>
    </div>
  );
};

export default SummaryCards;
