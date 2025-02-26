import React, { useState, useMemo, useEffect } from "react";
import { sortData } from "../lib/utils";

/**
 * A component to display transaction data in a table format with pagination.
 * Supports sorting by date, amount, reason, and receiver, and date range filtering.
 * Also allows the user to select the number of items to display per page.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.transactions - An array of transaction objects.
 * @param {boolean} props.darkMode - Whether dark mode is enabled.
 * @returns {JSX.Element} The rendered TransactionTable component.
 */
const TransactionTable = ({ transactions = [], darkMode }) => {
  const [sortColumn, setSortColumn] = useState(""); // The column to sort by.
  const [sortDirection, setSortDirection] = useState("asc"); // Sort direction ('asc' or 'desc').
  const [filterStart, setFilterStart] = useState(""); // Start date for filtering.
  const [filterEnd, setFilterEnd] = useState(""); // End date for filtering.
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Items per page, default is 10

  /**
   * Handles sorting when a column header is clicked.  Toggles the sort direction
   * if the same column is clicked again; otherwise, sets the new sort column and
   * resets the direction to ascending.
   *
   * @param {string} column - The name of the column to sort by.
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
   * Filters the transactions based on the selected start and end dates.
   * useMemo ensures this is only recalculated when dependencies change.
   *
   * @returns {Array<object>} The filtered array of transactions.
   */
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      if (filterStart && txDate < new Date(filterStart + "T00:00:00"))
        return false;
      if (filterEnd && txDate > new Date(filterEnd + "T23:59:59")) return false; // Include time for end date
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

  const pagedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedTransactions.slice(startIndex, endIndex);
  }, [sortedTransactions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  // Reset to page 1 if itemsPerPage changes, avoiding out-of-bounds errors
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, sortedTransactions.length]);

  return (
    <div className="p-4">
      {/* Date Filtering inputs */}
      <div className="mb-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
        <div className="flex flex-col">
          <label
            htmlFor="filterStart"
            className={`block text-sm font-medium ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Start Date
          </label>
          <input
            id="filterStart"
            type="date"
            value={filterStart}
            onChange={(e) => setFilterStart(e.target.value)}
            className={`mt-1 block w-full rounded-md  p-2 focus:outline-none focus:ring-2 focus:ring-opacity-50  ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600 focus:ring-[#8b5cf6] focus:border-[#8b5cf6]"
                : "border border-gray-300 focus:ring-[#6b21a8] focus:border-[#6b21a8]"
            }`}
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="filterEnd"
            className={`block text-sm font-medium ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            End Date
          </label>
          <input
            id="filterEnd"
            type="date"
            value={filterEnd}
            onChange={(e) => setFilterEnd(e.target.value)}
            className={`mt-1 block w-full  rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600 focus:ring-[#8b5cf6] focus:border-[#8b5cf6]"
                : "border border-gray-300 focus:ring-[#6b21a8] focus:border-[#6b21a8]"
            }`}
          />
        </div>
      </div>

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
            Transactions
          </h2>
        </div>
        <div className="p-4 md:p-6 pt-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th
                    scope="col"
                    onClick={() => handleSort("date")}
                    className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Date
                    {sortColumn === "date" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort("amount")}
                    className={`px-3 py-2 text-right text-xs font-medium uppercase tracking-wider cursor-pointer ${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    }`}
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
                    onClick={() => handleSort("reason")}
                    className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    }`}
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
                    onClick={() => handleSort("receiver")}
                    className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Recipient
                    {sortColumn === "receiver" && (
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
                {pagedTransactions.length > 0 ? (
                  pagedTransactions.map((tx, index) => (
                    <tr
                      key={tx.date + index}
                      className={`hover:bg-gray-50 transition-colors duration-150 ${
                        darkMode ? "hover:bg-gray-700/50" : ""
                      }`}
                    >
                      <td
                        className={`px-3 py-4 whitespace-nowrap text-sm ${
                          darkMode ? "text-gray-200" : "text-gray-900"
                        }`}
                      >
                        {tx.date}
                      </td>
                      <td
                        className={`px-3 py-4 whitespace-nowrap text-sm text-right ${
                          darkMode ? "text-gray-200" : "text-gray-900"
                        }`}
                      >
                        {tx.amount && tx.amount.toFixed(2)}
                      </td>
                      <td
                        className={`px-3 py-4 whitespace-nowrap text-sm ${
                          darkMode ? "text-gray-200" : "text-gray-900"
                        }`}
                      >
                        {tx.reason}
                      </td>
                      <td
                        className={`px-3 py-4 whitespace-nowrap text-sm ${
                          darkMode ? "text-gray-200" : "text-gray-900"
                        }`}
                      >
                        {tx.receiver}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className={`p-4 text-center ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      No transactions found matching the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              className={`flex items-center justify-between mt-4 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className={`border rounded px-2 py-1 ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                      : "border-gray-300 focus:ring-[#6b21a8] focus:border-[#6b21a8]"
                  }`}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} // Prevent going below 1
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-50"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                  }`}
                  aria-label="Previous Page"
                >
                  Previous
                </button>
                <span className="">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  } //Prevent going past the last page
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-50"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                  }`}
                  aria-label="Next Page"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
