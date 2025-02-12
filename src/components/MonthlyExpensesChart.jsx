import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/**
 * A component that displays a line chart showing monthly expenses and balance over time.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.data - An array of transaction objects.
 * @returns {JSX.Element} The rendered MonthlyExpensesChart component.
 */
const MonthlyExpensesChart = ({ data = [] }) => {

    /**
     * Aggregates transaction data by month, calculating total expenses and
     * storing the *last* encountered balance for each month.  This assumes
     * transactions within a month are also sorted chronologically (newest first).
     * useMemo ensures that this is only recalculated when `data` changes.
     */
  const aggregatedData = useMemo(() => {
     return data.reduce((acc, transaction) => {
        const date = new Date(transaction.date);
        if (isNaN(date)) {
            console.warn("Invalid date found:", transaction.date);
            return acc;
        }

        const month = date.toISOString().slice(0, 7);

        if (!acc[month]) {
            acc[month] = { expenses: 0, balance: transaction.currentBalance }; // Initialize balance
        }
        // Accumulate expenses and keep track of the *last* balance for each month
        if (transaction.amount > 0) {
            acc[month].expenses += transaction.amount;
        }
        acc[month].balance = transaction.currentBalance; // Update balance with each transaction

        return acc;

    }, {});
}, [data]);

    /**
     * Transforms the aggregated data into the format expected by Recharts.
     * Creates an array of objects, each with 'month', 'Expenses', and 'Balance' properties.
     * useMemo ensures this transformation only happens when `aggregatedData` changes.
     * */
    const chartData = useMemo(() => {
    return Object.entries(aggregatedData).map(([month, { expenses, balance }]) => ({
        month,
        Expenses: expenses,
        Balance: balance, // Add balance to the chart data
        }));
    }, [aggregatedData]);


  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
        <XAxis dataKey="month" stroke="#666" />
        <YAxis stroke="#666" />
        <Tooltip />
        <Legend  wrapperStyle={{ bottom: 5, left: 5, width: '100%', textAlign: 'center' }}/>
        <Line
          type="monotone"
          dataKey="Expenses"
          stroke="#ff7c43"
          strokeWidth={1}
          dot={{ r: 3, fill: "#fff", stroke: "#ff7c43", strokeWidth: 1 }}
        />
        <Line
          type="monotone"
          dataKey="Balance"
          stroke="#2563eb"  // Changed to a blue color
          strokeWidth={1}
            dot={{ r: 3, fill: "#fff", stroke: "#2563eb", strokeWidth: 1 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MonthlyExpensesChart;