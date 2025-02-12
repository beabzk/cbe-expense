import React from 'react';

const SummaryCards = ({ transactions = [] }) => {
  // Calculate total income, total expenses, and current balance
  const totalIncome = transactions
    .filter(t => t.amount && t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.amount && t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const currentBalance = totalIncome - totalExpenses;

  return (
    <div className="flex flex-col md:flex-row gap-4 my-4">
      <div className="bg-green-100 border border-green-300 rounded-lg shadow p-4 flex-1">
        <h3 className="text-xl font-semibold text-green-800">Total Income</h3>
        <p className="text-2xl font-bold">${totalIncome.toFixed(2)}</p>
      </div>
      <div className="bg-red-100 border border-red-300 rounded-lg shadow p-4 flex-1">
        <h3 className="text-xl font-semibold text-red-800">Total Expenses</h3>
        <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
      </div>
      <div className="bg-blue-100 border border-blue-300 rounded-lg shadow p-4 flex-1">
        <h3 className="text-xl font-semibold text-blue-800">Current Balance</h3>
        <p className="text-2xl font-bold">${currentBalance.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default SummaryCards;