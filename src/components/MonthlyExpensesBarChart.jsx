import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const MonthlyExpensesBarChart = ({ data = [] }) => {
  // Aggregate expenses by month.
  // Assumes each transaction object has a valid 'date' property and an 'amount' property.
  const aggregatedData = data.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    // Get month as short name (e.g., Jan, Feb)
    const month = date.toLocaleString('default', { month: 'short' });
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += transaction.amount;
    return acc;
  }, {});

  const chartData = Object.entries(aggregatedData).map(([month, total]) => ({
    month,
    total
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="total" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MonthlyExpensesBarChart;
