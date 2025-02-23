import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "#6b21a8",
  "#9333ea",
  "#a855f7",
  "#c084fc",
  "#d8b4fe",
  "#e9d5ff",
  "#f3e8ff",
  "#faf5ff",
]; // Using purple shades

/**
 * A component to display the distribution of transactions across recipients using a pie chart.
 * Combines small slices into an "Others" category and shows the recipient name and count.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.transactions - An array of transaction objects.
 *  Each object should have a receiver property
 * @returns {JSX.Element} The rendered TransactionDistributionPieChart component.
 */
const TransactionDistributionPieChart = ({ transactions }) => {
  const data = useMemo(() => {
    if (!transactions) return [];

    const recipientCounts = {};
    transactions.forEach((tx) => {
      const recipient = tx.receiver || "Unknown Recipient"; // Default if missing
      recipientCounts[recipient] = (recipientCounts[recipient] || 0) + 1;
    });

    // Convert to array, sort by count (descending), and get total count
    const sortedData = Object.entries(recipientCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const totalCount = sortedData.reduce((sum, { value }) => sum + value, 0);
    const othersThreshold = totalCount * 0.02; // "Others" if < 2% of total (adjustable)
    let othersCount = 0;
    const finalData = [];

    // Aggregate small slices into "Others"
    for (const { name, value } of sortedData) {
      if (value < othersThreshold) {
        othersCount += value;
      } else {
        finalData.push({ name, value });
      }
    }

    if (othersCount > 0) {
      finalData.push({ name: "Others", value: othersCount });
    }

    return finalData;
  }, [transactions]);

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="text-cbe-purple">{`${payload[0].name} : ${payload[0].value}`}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-cbe-purple">
          Transaction Distribution by Recipients
        </h2>
      </div>
      <div className="p-6 pt-0">
        <div className="h-[300px] md:h-[400px] w-full">
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
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TransactionDistributionPieChart;
