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

       <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
              <div className="text-2xl font-semibold leading-none tracking-tight">Transaction</div>
            </div>
            <div className="p-6 pt-0">
                <div className="h-96 overflow-auto">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-white">
                        <tr>
                            <th
                            onClick={() => handleSort('date')}
                            className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            >
                            Date {sortColumn === 'date' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th
                            onClick={() => handleSort('amount')}
                            className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            >
                            Amount {sortColumn === 'amount' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th  onClick={() => handleSort('reason')}
                             className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                            Reason {sortColumn === 'reason' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                             <th onClick={() => handleSort('receiver')}
                                className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                                Recipient {sortColumn === 'receiver' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {sortedTransactions.map((tx, index) => (
                            <tr key={index} className="border-t">
                            <td className="p-2 whitespace-nowrap">{tx.date}</td>
                            <td className="p-2 whitespace-nowrap">{tx.amount}</td>
                            <td className="p-2 whitespace-nowrap">{tx.reason}</td>
                            <td className="p-2 whitespace-nowrap">{tx.receiver}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
              </div>
            </div>
       </div>
    </div>
  );
};

export default TransactionTable;