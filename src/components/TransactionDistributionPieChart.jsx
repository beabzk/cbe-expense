import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#6b21a8", "#9333ea", "#a855f7", "#c084fc", "#d8b4fe"]; // Using purple shades

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

    const recipientCounts = {}; // Change to recipientCounts
    transactions.forEach((tx) => {
      const recipient = tx.receiver || "Unknown Recipient"; // Use receiver, default if missing
      recipientCounts[recipient] = (recipientCounts[recipient] || 0) + 1;
    });

    const chartData = Object.entries(recipientCounts).map(([name, value]) => ({
      name,
      value,
    }));
    return chartData;
  }, [transactions]);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-cbe-purple">
          Transaction Distribution by Recipients
        </h2>
      </div>
      <div className="p-6 pt-0">
        <div className="h-[300px] md:h-[400px] w-full">
          {" "}
          {/* Adjusted heights */}
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                wrapperStyle={{
                  // Style the tooltip container
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "4px 8px", // Less padding
                  fontSize: "0.8rem", // Smaller font
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)", // Subtle shadow
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TransactionDistributionPieChart;
