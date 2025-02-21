import React from 'react';
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
 * @param {Array<object>} props.data - An array of *aggregated* transaction data.
 *                                      Each object should have: { month: string, Expenses: number, Balance: number }
 * @returns {JSX.Element} The rendered MonthlyExpensesChart component.
 */
const MonthlyExpensesChart = ({ data = [] }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data} // Directly using pre-aggregated data
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="month" stroke="#666" tick={{fontSize: 12}}  tickMargin={10}/>
            <YAxis stroke="#666" tick={{fontSize: 12}} />
            <Tooltip  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '10px' }}/>
            <Legend wrapperStyle={{ bottom: 0, left: 0, width: '100%', textAlign: 'center' }} />
            <Line
              type="monotone"
              dataKey="Expenses"
              stroke="#c2410c"
              strokeWidth={2}
              dot={{ r: 4, fill: "#fff", stroke: "#c2410c", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="Balance"
              stroke="#6b21a8"
              strokeWidth={2}
                dot={{ r: 4, fill: "#fff", stroke: "#6b21a8", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
};

export default MonthlyExpensesChart;