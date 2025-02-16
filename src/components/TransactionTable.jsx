import React, { useState, useMemo } from 'react';
import { sortData } from '../lib/utils';

/**
 * A component to display transaction data in a table format.
 * Supports sorting by date, amount, reason, and receiver, and date range filtering.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.transactions - An array of transaction objects.
 * @returns {JSX.Element} The rendered TransactionTable component.
 */
const TransactionTable = ({ transactions = [] }) => {
  const [sortColumn, setSortColumn] = useState(''); // The column to sort by.
  const [sortDirection, setSortDirection] = useState('asc'); // Sort direction ('asc' or 'desc').
  const [filterStart, setFilterStart] = useState('');  // Start date for filtering.
  const [filterEnd, setFilterEnd] = useState('');      // End date for filtering.


    /**
     * Handles sorting when a column header is clicked.  Toggles the sort direction
     * if the same column is clicked again; otherwise, sets the new sort column and
     * resets the direction to ascending.
     *
     * @param {string} column - The name of the column to sort by.
     */
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  /**
 * Filters the transactions based on the selected start and end dates.
 * useMemo ensures this is only recalculated when dependencies change.
 *
 * @returns {Array<object>} The filtered array of transactions.
 */
    const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterStart && new Date(tx.date) < new Date(filterStart)) return false;
      if (filterEnd && new Date(tx.date) > new Date(filterEnd)) return false;
      return true;
    });
  }, [transactions, filterStart, filterEnd]);

  /**
   * Sorts the filtered transactions based on the selected column and direction.
   * Uses the `sortData` utility function for efficient sorting.
   * useMemo ensures this is only recalculated when dependencies change.
   *
   * @returns {Array<object>} The sorted array of transactions.
   */
  const sortedTransactions = useMemo(() => {
    return sortData(filteredTransactions, sortColumn, sortDirection);
  }, [filteredTransactions, sortColumn, sortDirection]);

  return (
     <div className="p-4">
      {/* Date Filtering inputs */}
      <div className="mb-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
        <div className='flex flex-col'>
          <label htmlFor="filterStart" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            id="filterStart"
            type="date"
            value={filterStart}
            onChange={(e) => setFilterStart(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cbe-purple focus:border-transparent"
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor="filterEnd" className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            id="filterEnd"
            type="date"
            value={filterEnd}
            onChange={(e) => setFilterEnd(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cbe-purple focus:border-transparent"
          />
        </div>
      </div>

       <div className="rounded-lg border bg-white text-gray-800 shadow-sm">
          <div className="p-4 md:p-6">
              <h2 className="text-xl font-semibold text-cbe-purple">Transactions</h2>
            </div>
            <div className="p-4 md:p-6 pt-0">
                <div className="overflow-x-auto"> {/*  horizontal scrolling on small screens */}
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th
                            scope="col"
                            onClick={() => handleSort('date')}
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            >
                            Date {sortColumn === 'date' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th
                            scope="col"
                            onClick={() => handleSort('amount')}
                            className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            >
                            Amount (ETB) {sortColumn === 'amount' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th  scope="col" onClick={() => handleSort('reason')}
                             className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                            Reason {sortColumn === 'reason' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                             <th scope="col" onClick={() => handleSort('receiver')}
                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                                Recipient {sortColumn === 'receiver' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                         {sortedTransactions.length > 0 ? (
                            sortedTransactions.map((tx, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{tx.date}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-900">{tx.amount && tx.amount.toFixed(2)}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{tx.reason}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{tx.receiver}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="p-4 text-center text-gray-600">
                                    No transactions found matching the selected criteria.
                                </td>
                            </tr>
                         )}
                        </tbody>
                    </table>
              </div>
            </div>
       </div>
    </div>
  );
};

export default TransactionTable;