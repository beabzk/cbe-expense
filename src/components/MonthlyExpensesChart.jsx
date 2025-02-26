import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const CustomTooltip = ({ active, payload, label, darkMode }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={`p-4 rounded-lg shadow-lg ${
          darkMode
            ? "bg-gray-800 text-white border border-gray-700"
            : "bg-white border border-gray-200"
        }`}
      >
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div
            key={`tooltip-${index}`}
            className="flex items-center space-x-2 my-1"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <div className={darkMode ? "text-gray-300" : "text-gray-700"}>
              {entry.name}:{" "}
              <span className="font-medium">
                {entry.value.toLocaleString()} ETB
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * A component that displays a line chart showing monthly expenses and balance over time.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.data - An array of aggregated transaction data.
 *                                      Each object should have: { month: string, Expenses: number, Balance: number }
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 * @returns {JSX.Element} The rendered MonthlyExpensesChart component.
 */
const MonthlyExpensesChart = ({ data = [], darkMode = false }) => {
  // Format month labels for better display
  const formattedData = data.map((item) => {
    const [year, month] = item.month.split("-");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthName = monthNames[parseInt(month, 10) - 1];
    return {
      ...item,
      formattedMonth: `${monthName} ${year}`,
    };
  });

  // Find average expense to create a reference line
  const expenses = data.map((item) => item.Expenses);
  const avgExpense =
    expenses.length > 0
      ? expenses.reduce((sum, value) => sum + value, 0) / expenses.length
      : 0;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={formattedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={darkMode ? "#444" : "#e0e0e0"}
        />
        <XAxis
          dataKey="formattedMonth"
          stroke={darkMode ? "#aaa" : "#666"}
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <YAxis
          stroke={darkMode ? "#aaa" : "#666"}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
        <Legend
        //   wrapperStyle={{  // Removed the wrapperStyle
        //     bottom: 0,
        //     left: 0,
        //     width: "100%",
        //     textAlign: "center",
        //     color: darkMode ? "#fff" : "#000",
        //   }}
        />
        <ReferenceLine
          y={avgExpense}
          label={{
            value: "Avg Expense",
            position: "insideTopRight",
            fill: darkMode ? "#bbb" : "#666",
            fontSize: 12,
          }}
          stroke={darkMode ? "#aaa" : "#888"}
          strokeDasharray="3 3"
        />
        <Line
          type="monotone"
          dataKey="Expenses"
          stroke="#c2410c"
          strokeWidth={2}
          dot={{
            r: 4,
            fill: darkMode ? "#1f2937" : "#fff",
            stroke: "#c2410c",
            strokeWidth: 2,
          }}
          activeDot={{
            r: 6,
            fill: "#c2410c",
            stroke: darkMode ? "#1f2937" : "#fff",
          }}
        />
        <Line
          type="monotone"
          dataKey="Balance"
          stroke="#6b21a8"
          strokeWidth={2}
          dot={{
            r: 4,
            fill: darkMode ? "#1f2937" : "#fff",
            stroke: "#6b21a8",
            strokeWidth: 2,
          }}
          activeDot={{
            r: 6,
            fill: "#6b21a8",
            stroke: darkMode ? "#1f2937" : "#fff",
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MonthlyExpensesChart;
