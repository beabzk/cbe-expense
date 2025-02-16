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
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /> {/* Lighter grid */}
        <XAxis dataKey="month" stroke="#666" tick={{fontSize: 12}}  tickMargin={10}/>  {/* Increase font size */}
        <YAxis stroke="#666" tick={{fontSize: 12}} />
        <Tooltip  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '10px' }}/>
        <Legend wrapperStyle={{ bottom: 0, left: 0, width: '100%', textAlign: 'center' }} />
        <Line
          type="monotone"
          dataKey="Expenses"
          stroke="#c2410c" // Changed to Tailwind's orange-600
          strokeWidth={2}
          dot={{ r: 4, fill: "#fff", stroke: "#c2410c", strokeWidth: 2 }} // Consistent with stroke
        />
        <Line
          type="monotone"
          dataKey="Balance"
          stroke="#6b21a8"  // Changed to CBE purple
          strokeWidth={2}
          dot={{ r: 4, fill: "#fff", stroke: "#6b21a8", strokeWidth: 2 }} // Consistent
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MonthlyExpensesChart;