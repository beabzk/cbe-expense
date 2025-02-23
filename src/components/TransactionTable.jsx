import React, { useState, useMemo, useEffect } from "react";
import { sortData } from "../lib/utils";

/**
 * A component to display transaction data in a table format with pagination.
 * Supports sorting by date, amount, reason, and receiver, and date range filtering.
 * Also allows the user to select the number of items to display per page.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.transactions - An array of transaction objects.
 * @returns {JSX.Element} The rendered TransactionTable component.
 */
const TransactionTable = ({ transactions = [] }) => {
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
      if (filterStart && new Date(tx.date) < new Date(filterStart))
        return false;
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

  const pagedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedTransactions.slice(startIndex, endIndex);
  }, [sortedTransactions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  // Reset to page 1 if itemsPerPage changes, avoiding out-of-bounds errors
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  return (
    <div className="p-4">
      {/* Date Filtering inputs */}
      <div className="mb-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
        <div className="flex flex-col">
          <label
            htmlFor="filterStart"
            className="block text-sm font-medium text-gray-700"
          >
            Start Date
          </label>
          <input
            id="filterStart"
            type="date"
            value={filterStart}
            onChange={(e) => setFilterStart(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#6b21a8] focus:border-transparent"
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="filterEnd"
            className="block text-sm font-medium text-gray-700"
          >
            End Date
          </label>
          <input
            id="filterEnd"
            type="date"
            value={filterEnd}
            onChange={(e) => setFilterEnd(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#6b21a8] focus:border-transparent"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-white text-gray-800 shadow-sm">
        <div className="p-4 md:p-6">
          <h2 className="text-xl font-semibold text-[#6b21a8]">Transactions</h2>
        </div>
        <div className="p-4 md:p-6 pt-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    onClick={() => handleSort("date")}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    Date{" "}
                    {sortColumn === "date"
                      ? sortDirection === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort("amount")}
                    className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                    onClick={() => handleSort("reason")}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    Reason{" "}
                    {sortColumn === "reason"
                      ? sortDirection === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort("receiver")}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    Recipient{" "}
                    {sortColumn === "receiver"
                      ? sortDirection === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pagedTransactions.length > 0 ? (
                  pagedTransactions.map((tx, index) => (
                    <tr
                      key={tx.date + index}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tx.date}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {tx.amount && tx.amount.toFixed(2)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tx.reason}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tx.receiver}
                      </td>
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-4 space-x-2">
              <div className="flex space-x-2 items-center">
                <span>Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="border rounded px-2 py-1"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
