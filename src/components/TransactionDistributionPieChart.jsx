import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF33F6']; // Add more colors

/**
 *  A component to display the distribution of transactions by recipients using a pie chart.
 *
 * @param {object} props
 * @param {Array<object>} props.transactions
 * @returns {JSX.Element}
 */
const TransactionDistributionPieChart = ({ transactions }) => {

  const data = useMemo(() => {
    if (!transactions) return [];

    const recipientCounts = {};  // Change to recipientCounts
    transactions.forEach(tx => {
        const recipient = tx.receiver || "Unknown Recipient"; // Use receiver, default if missing
        recipientCounts[recipient] = (recipientCounts[recipient] || 0) + 1;
    });

    const chartData = Object.entries(recipientCounts).map(([name, value]) => ({
      name,
      value
    }));
    return chartData;
  }, [transactions]);


  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex justify-between items-center">
          {/* Updated Title */}
          <div className="text-2xl font-semibold leading-none tracking-tight">Transaction Distribution by Recipients</div>
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="h-[500px] w-full">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TransactionDistributionPieChart;