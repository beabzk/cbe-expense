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
    <div className="flex flex-col md:flex-row gap-4 my-4">
      {/* Total Expenses Card */}
      <div className="bg-red-100 border border-red-300 rounded-lg shadow p-4 flex-1">
        <h3 className="text-xl font-semibold text-red-800">Total Expenses</h3>
        <p className="text-2xl font-bold">ETB {totalExpenses.toFixed(2)}</p>
      </div>

      {/* Current Balance Card */}
      <div className="bg-blue-100 border border-blue-300 rounded-lg shadow p-4 flex-1">
        <h3 className="text-xl font-semibold text-blue-800">Current Balance</h3>
        <p className="text-2xl font-bold">ETB {currentBalance !== null ? currentBalance.toFixed(2) : 'N/A'}</p>
      </div>
    </div>
  );
};

export default SummaryCards;