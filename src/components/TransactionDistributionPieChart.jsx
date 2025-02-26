import React, { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Color palette based on CBE colors
const COLORS = [
  "#6b21a8", // CBE Purple
  "#4c1d95", // CBE Purple Dark
  "#8b5cf6", // CBE Purple Light
  "#9333ea",
  "#a855f7",
  "#c084fc",
  "#d8b4fe",
  "#7c3aed",
  "#5b21b6",
  "#4338ca",
];

/**
 * Custom label component for the pie chart
 */
const CustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  name,
  darkMode,
}) => {
  // Only show labels for segments that are large enough to be readable
  if (percent < 0.08) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={darkMode ? "#fff" : "black"}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize="12"
      fontWeight="500"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/**
 * A component to display the distribution of transactions across recipients using a pie chart.
 * Combines small slices into an "Others" category and shows the recipient name and count.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.transactions - An array of transaction objects.
 *  Each object should have a receiver property
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 * @returns {JSX.Element} The rendered TransactionDistributionPieChart component.
 */
const TransactionDistributionPieChart = ({
  transactions,
  darkMode = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const data = useMemo(() => {
    if (!transactions || !transactions.length) return [];

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
      const { name, value } = payload[0].payload;
      const percentage = ((value / transactions.length) * 100).toFixed(1);

      return (
        <div
          className={`p-3 rounded-lg shadow-md ${
            darkMode
              ? "bg-gray-800 text-white border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <p className="font-semibold">{name}</p>
          <div className="flex justify-between gap-4 mt-1">
            <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
              Count:
            </span>
            <span className="font-medium">{value}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
              Percentage:
            </span>
            <span className="font-medium">{percentage}%</span>
          </div>
        </div>
      );
    }

    return null;
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  // Format the legend text
  const formatLegendText = (value) => {
    // Truncate long names to keep the legend readable
    return value.length > 20 ? value.substring(0, 18) + "..." : value;
  };

  // Add percentage to the legend
  const renderLegendContent = (props) => {
    const { payload } = props;
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="flex flex-wrap justify-center mt-4 gap-x-4 gap-y-2">
        {payload.map((entry, index) => {
          const percentage = ((entry.payload.value / totalValue) * 100).toFixed(
            1
          );
          return (
            <div key={`legend-${index}`} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                {formatLegendText(entry.value)} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (!data.length) {
    return (
      <div
        className={`flex items-center justify-center h-60 ${
          darkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        No transaction data to display
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chart header with count */}
      <div className="flex justify-between items-center mb-4">
        <h3 className={darkMode ? "text-gray-200" : "text-gray-700"}>
          Distribution of {transactions.length} transactions
        </h3>
      </div>

      {/* Chart area */}
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props) => <CustomLabel {...props} darkMode={darkMode} />}
              outerRadius={130}
              innerRadius={50}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke={darkMode ? "#1f2937" : "#ffffff"}
                  strokeWidth={2}
                  opacity={activeIndex === index ? 1 : 0.9}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              content={renderLegendContent}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TransactionDistributionPieChart;
