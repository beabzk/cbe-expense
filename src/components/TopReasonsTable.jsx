import React, { useMemo, useState } from "react";
import { sortData } from "../lib/utils";

/**
 *  A component to display the top 25 transaction reasons in a sortable table.
 *
 * @param {object} props The component props
 * @param {Array} props.transactions The transaction data
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 * @returns {JSX.Element}
 */
const TopReasonsTable = ({ transactions, darkMode }) => {
  const [sortColumn, setSortColumn] = useState("amount"); // Initialize
  const [sortDirection, setSortDirection] = useState("desc");

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
   * Aggregates transaction data to determine the top transaction reasons.
   * Calculates total amount and count for each reason.
   * useMemo ensures that this calculation only happens when `transactions` changes.
   */
  const topReasons = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    const reasonCounts = {};
    const reasonTotals = {};

    transactions.forEach((tx) => {
      if (tx.reason) {
        reasonCounts[tx.reason] = (reasonCounts[tx.reason] || 0) + 1;
        reasonTotals[tx.reason] =
          (reasonTotals[tx.reason] || 0) + Math.abs(tx.amount);
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
    // Limit to top 25 reasons *after* sorting
    return sortData(topReasons, sortColumn, sortDirection).slice(0, 25);
  }, [topReasons, sortColumn, sortDirection]);

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
          Top 25 Transaction Reasons
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
                  onClick={() => handleSort("reason")}
                >
                  Reason
                  {sortColumn === "reason" && (
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
              {sortedReasons.map((item, index) => (
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
                    {item.reason}
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
          {sortedReasons.length === 0 && (
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

export default TopReasonsTable;
