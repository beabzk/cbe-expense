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
  console.log("MonthlyExpensesBarChart.jsx - data prop:", data); // Log the data prop

  const aggregatedData = data.reduce((acc, transaction) => {
    const date = new Date(transaction.date);

    // Check for invalid date
    if (isNaN(date)) {
      console.warn("Invalid date found:", transaction.date);
      return acc; // Skip this transaction
    }

    const month = date.toISOString().slice(0, 7); // Use YYYY-MM format

    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += transaction.amount; // Ensure amount is a number
    return acc;
  }, {});

  const chartData = Object.entries(aggregatedData).map(([month, total]) => ({
    month,
    total
  }));

    console.log("MonthlyExpensesBarChart.jsx - chartData:", chartData);

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