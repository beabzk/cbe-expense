import React from 'react';

/**
 * A component to display summary cards showing total expenses and current balance.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.transactions - An array of transaction objects.
 * @returns {JSX.Element} The rendered SummaryCards component.
 */
const SummaryCards = ({ transactions = [] }) => {

  // Calculate total expenses.  Filters for transactions with positive amounts (CBE debits).
  const totalExpenses = transactions
    .filter(t => t.amount && t.amount > 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);


  // Get the most recent currentBalance from the first transaction in the sorted array.
  // Assumes transactions are sorted newest to oldest.  Provides a default value of 0
  // if there are no transactions.
    const currentBalance = transactions.length > 0
    ? transactions[0].currentBalance
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Total Expenses Card */}
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-sm p-4 flex flex-col">
        <h3 className="text-xl font-semibold text-red-700">Total Expenses</h3>
        <p className="text-2xl font-bold text-red-800 mt-2">ETB {totalExpenses.toFixed(2)}</p>
      </div>

      {/* Current Balance Card */}
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-sm p-4 flex flex-col">
        <h3 className="text-xl font-semibold text-green-700">Current Balance</h3>
        <p className="text-2xl font-bold text-green-800 mt-2">ETB {currentBalance !== null ? currentBalance.toFixed(2) : 'N/A'}</p>
      </div>
    </div>
  );
};

export default SummaryCards;