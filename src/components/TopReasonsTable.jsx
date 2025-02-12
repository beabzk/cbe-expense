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
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
          <div className="text-2xl font-semibold leading-none tracking-tight">Top 25 Transaction Reasons</div>
        </div>
        <div className="p-6 pt-0">
            <div className="h-96 overflow-auto">
                <table className="w-full">
                    <thead className="sticky top-0 bg-white">
                    <tr>
                        <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('reason')}>
                          Reason {sortColumn === 'reason' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th className="p-2 text-right cursor-pointer" onClick={() => handleSort('amount')}>
                          Amount (ETB) {sortColumn === 'amount' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th className="p-2 text-right cursor-pointer" onClick={() => handleSort('count')}>
                          Count {sortColumn === 'count' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedReasons.map((item, index) => (
                        <tr key={index} className="border-t">
                        <td className="p-2">{item.reason}</td>
                        <td className="p-2 text-right">{item.amount.toFixed(2)}</td>
                        <td className="p-2 text-right">{item.count}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
      </div>
    </div>
  );
};

export default TopReasonsTable;