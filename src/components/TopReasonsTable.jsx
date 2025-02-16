import React, { useMemo, useState } from 'react'; // Import useState
import { sortData } from '../lib/utils';

/**
 *  A component to display the top 25 transaction reasons in a sortable table.
 *
 * @param {object} props The component props
 * @param {Array} props.transactions The transaction data
 * @returns {JSX.Element}
 */
const TopReasonsTable = ({ transactions }) => {
    const [sortColumn, setSortColumn] = useState('amount'); // Initialize
    const [sortDirection, setSortDirection] = useState('desc');

        /**
         * Handles sorting when a column header is clicked. Toggles the sort
         * direction if clicking the same column, otherwise sets the new sort column.
         * @param {string} column The column to sort by.
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
     * Aggregates transaction data to determine the top transaction reasons.
     * Calculates total amount and count for each reason.
     * useMemo ensures that this calculation only happens when `transactions` changes.
     */
  const topReasons = useMemo(() => {
    // ... (your existing aggregation logic)
    if (!transactions || transactions.length === 0) {
      return [];
    }

    const reasonCounts = {};
    const reasonTotals = {};

    transactions.forEach((tx) => {
      if (tx.reason) {
        reasonCounts[tx.reason] = (reasonCounts[tx.reason] || 0) + 1;
        reasonTotals[tx.reason] = (reasonTotals[tx.reason] || 0) + Math.abs(tx.amount);
      }
    });

     const reasonData = Object.entries(reasonTotals).map(([reason, amount]) => ({
            reason,
            amount,
            count: reasonCounts[reason] || 0,
        }));

        return reasonData;

  }, [transactions]);
    /**
     * Sorts the aggregated reasons data based on the selected column and direction.
     * Uses the `sortData` utility function for efficient sorting.
     * useMemo ensures that the sorting only happens when necessary.
     */
    const sortedReasons = useMemo(() => {
        return sortData(topReasons, sortColumn, sortDirection);
    }, [topReasons, sortColumn, sortDirection]);

  return (
    <div className="rounded-lg border bg-white text-gray-800 shadow-sm">
      <div className="p-4 md:p-6">
          <h2 className="text-xl font-semibold text-cbe-purple">Top 25 Transaction Reasons</h2>
        </div>
        <div className="p-4 md:p-6 pt-0">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('reason')}>
                          Reason {sortColumn === 'reason' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th
                        scope="col"
                        className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                         onClick={() => handleSort('amount')}>
                          Amount (ETB) {sortColumn === 'amount' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th
                        scope="col"
                        className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('count')}>
                          Count {sortColumn === 'count' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {sortedReasons.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.reason}</td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-900">{item.amount.toFixed(2)}</td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-900">{item.count}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {sortedReasons.length === 0 && (
                    <div className="p-4 text-gray-600">No transactions found.</div>
                )}
            </div>
      </div>
    </div>
  );
};

export default TopReasonsTable;