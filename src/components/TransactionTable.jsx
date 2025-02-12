import React, { useState, useMemo } from 'react';

const TransactionTable = ({ transactions = [] }) => {
  console.log("TransactionTable.jsx - transactions prop:", transactions); // Log the transactions prop

  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterStart && new Date(tx.date) < new Date(filterStart)) return false;
      if (filterEnd && new Date(tx.date) > new Date(filterEnd)) return false;
      return true;
    });
  }, [transactions, filterStart, filterEnd]);

  const sortedTransactions = useMemo(() => {
    if (!sortColumn) return filteredTransactions;

    return [...filteredTransactions].sort((a, b) => {
      const aValue = sortColumn === 'date' ? new Date(a[sortColumn]) : a[sortColumn];
      const bValue = sortColumn === 'date' ? new Date(b[sortColumn]) : b[sortColumn];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTransactions, sortColumn, sortDirection]);

  return (
    <div className="p-4">
      {/* Filtering inputs */}
      <div className="mb-4 flex space-x-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            value={filterStart}
            onChange={(e) => setFilterStart(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            value={filterEnd}
            onChange={(e) => setFilterEnd(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
      </div>

      {/* Table */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              onClick={() => handleSort('date')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            >
              Date {sortColumn === 'date' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th
              onClick={() => handleSort('amount')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            >
              Amount {sortColumn === 'amount' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reason
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Party
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedTransactions.map((tx, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">{tx.date}</td>
              <td className="px-6 py-4 whitespace-nowrap">{tx.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap">{tx.reason}</td>
              <td className="px-6 py-4 whitespace-nowrap">{tx.payer || tx.receiver}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;