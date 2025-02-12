import React, { useState, useMemo } from 'react';
import { sortData } from '../lib/utils';

/**
 * A component to display a table of the top 25 recipients, sortable by recipient name,
 * amount, and count.
 *
 * @param {object} props The component props.
 * @param {Array<object>} props.transactions An array of transaction objects.
 * @returns {JSX.Element}
 */
const TopRecipientsTable = ({ transactions }) => {
  const [sortColumn, setSortColumn] = useState('amount'); // Initial sort column
  const [sortDirection, setSortDirection] = useState('desc'); // Initial sort direction

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
     * Aggregates transaction data to determine the top recipients.
     * Calculates total amounts and counts for each recipient.
     * useMemo ensures that the data is only re-aggregated when `transactions` changes.
     */
  const topRecipients = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    const recipientCounts = {};
    const recipientTotals = {};

    transactions.forEach((tx) => {
      if (tx.receiver) {
        recipientCounts[tx.receiver] = (recipientCounts[tx.receiver] || 0) + 1;
        recipientTotals[tx.receiver] = (recipientTotals[tx.receiver] || 0) + tx.amount;
      }
    });
      // Prepare the data in an array format suitable for sorting
     const recipientData = Object.entries(recipientTotals).map(([recipient, amount]) => ({
        recipient,
        amount,
        count: recipientCounts[recipient] || 0, // Ensure count exists
    }));

    return recipientData;

  }, [transactions]);

    /**
     * Sorts the aggregated recipient data based on the selected column and direction.
     * Uses the `sortData` utility function for efficient sorting.
     * useMemo ensures sorting is only recalculated when necessary.
    */
  const sortedRecipients = useMemo(() => {
    return sortData(topRecipients, sortColumn, sortDirection);
  }, [topRecipients, sortColumn, sortDirection]);



  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
          <div className="text-2xl font-semibold leading-none tracking-tight">Top 25 Recipients</div>
      </div>
       <div className="p-6 pt-0">
        <div className="h-96 overflow-auto">
            <table className="w-full">
            <thead className="sticky top-0 bg-white">
              <tr>
                <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('recipient')}>
                  Recipient {sortColumn === 'recipient' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
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
                {sortedRecipients.map((item, index) => (
                <tr key={index} className="border-t">
                    <td className="p-2">{item.recipient}</td>
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

export default TopRecipientsTable;