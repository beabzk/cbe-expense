import React, { useState, useMemo } from "react";
import { sortData } from "../lib/utils";

/**
 * A component to display a table of the top 25 recipients, sortable by recipient name,
 * amount, and count.
 *
 * @param {object} props The component props.
 * @param {Array<object>} props.transactions An array of transaction objects.
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 * @returns {JSX.Element}
 */
const TopRecipientsTable = ({ transactions, darkMode }) => {
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
          (recipientTotals[tx.receiver] || 0) + Math.abs(tx.amount);
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
    // Limit to top 25 recipients *after* sorting
    return sortData(topRecipients, sortColumn, sortDirection).slice(0, 25);
  }, [topRecipients, sortColumn, sortDirection]);

  return (
    <div
      className={`rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${
        darkMode
          ? "bg-gray-800 border border-gray-700 text-gray-300"
          : "bg-white border border-gray-200 text-gray-800"
      }`}
    >
      <div className="p-4 md:p-6">
        <h2
          className={`text-xl font-semibold ${
            darkMode ? "text-purple-300" : "text-[#4c1d95]"
          }`}
        >
          Top 25 Recipients
        </h2>
      </div>
      <div className="p-4 md:p-6 pt-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
              <tr>
                <th
                  scope="col"
                  className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                  onClick={() => handleSort("recipient")}
                >
                  Recipient
                  {sortColumn === "recipient" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  scope="col"
                  className={`px-3 py-2 text-right text-xs font-medium uppercase tracking-wider cursor-pointer ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                  onClick={() => handleSort("amount")}
                >
                  Amount (ETB)
                  {sortColumn === "amount" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  scope="col"
                  className={`px-3 py-2 text-right text-xs font-medium uppercase tracking-wider cursor-pointer ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                  onClick={() => handleSort("count")}
                >
                  Count
                  {sortColumn === "count" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y  ${
                darkMode
                  ? "bg-gray-800 divide-gray-600"
                  : "bg-white divide-gray-200"
              }`}
            >
              {sortedRecipients.map((item, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 transition-colors duration-150 ${
                    darkMode ? "hover:bg-gray-700/50" : ""
                  }`}
                >
                  <td
                    className={`px-3 py-4 whitespace-nowrap text-sm ${
                      darkMode ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {item.recipient}
                  </td>
                  <td
                    className={`px-3 py-4 whitespace-nowrap text-sm text-right ${
                      darkMode ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {item.amount.toFixed(2)}
                  </td>
                  <td
                    className={`px-3 py-4 whitespace-nowrap text-sm text-right ${
                      darkMode ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {item.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedRecipients.length === 0 && (
            <div
              className={`p-4 text-center ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              No transactions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopRecipientsTable;
