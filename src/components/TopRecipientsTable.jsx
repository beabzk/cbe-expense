import React, { useState, useMemo } from "react";
import { sortData } from "../lib/utils";

/**
 * A component to display a table of the top 25 recipients, sortable by recipient name,
 * amount, and count.
 *
 * @param {object} props The component props.
 * @param {Array<object>} props.transactions An array of transaction objects.
 * @returns {JSX.Element}
 */
const TopRecipientsTable = ({ transactions }) => {
  const [sortColumn, setSortColumn] = useState("amount"); // Initial sort column
  const [sortDirection, setSortDirection] = useState("desc"); // Initial sort direction

  /**
   * Handles sorting when a column header is clicked. Toggles the sort
   * direction if clicking the same column, otherwise sets the new sort column.
   * @param {string} column The column to sort by.
   */
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  /**
   * Aggregates transaction data to determine the top recipients.
   * Calculates total amounts and counts for each recipient.
   * useMemo ensures that this calculation only happens when `transactions` changes.
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
        recipientTotals[tx.receiver] =
          (recipientTotals[tx.receiver] || 0) + tx.amount;
      }
    });
    // Prepare the data in an array format suitable for sorting
    const recipientData = Object.entries(recipientTotals).map(
      ([recipient, amount]) => ({
        recipient,
        amount,
        count: recipientCounts[recipient] || 0, // Ensure count exists
      })
    );

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
    <div className="rounded-lg border bg-white text-gray-800 shadow-sm">
      <div className="p-4 md:p-6">
        <h2 className="text-xl font-semibold text-cbe-purple">
          Top 25 Recipients
        </h2>
      </div>
      <div className="p-4 md:p-6 pt-0">
        <div className="overflow-x-auto">
          {" "}
          {/* Use overflow-x-auto for horizontal scrolling on small screens */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("recipient")}
                >
                  Recipient{" "}
                  {sortColumn === "recipient"
                    ? sortDirection === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("amount")}
                >
                  Amount (ETB){" "}
                  {sortColumn === "amount"
                    ? sortDirection === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("count")}
                >
                  Count{" "}
                  {sortColumn === "count"
                    ? sortDirection === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedRecipients.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.recipient}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {item.amount.toFixed(2)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {item.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedRecipients.length === 0 && (
            <div className="p-4 text-gray-600">No transactions found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopRecipientsTable;
