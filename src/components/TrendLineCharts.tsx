import React, { useMemo } from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	CartesianGrid,
} from "recharts";
import { Customer } from "../services/dataService";

interface TrendLineChartsProps {
	customers: Customer[];
}

export const TrendLineCharts: React.FC<TrendLineChartsProps> = ({
	customers,
}) => {
	// Prepare data for trend lines based on actual CSV data
	const chartData = useMemo(() => {
		// Sort customers by customer_id to maintain order from CSV
		const sortedCustomers = [...customers].sort((a, b) =>
			a.customer_id.localeCompare(b.customer_id)
		);

		let cumulativeRevenue = 0;
		let churned = 0;

		// Take every 10th customer to show clear trend lines
		const sampleRate = Math.max(1, Math.floor(sortedCustomers.length / 200));

		const data = sortedCustomers
			.filter((_, idx) => idx % sampleRate === 0)
			.map((customer, idx) => {
				const actualIndex = idx * sampleRate;
				cumulativeRevenue += customer.overall_revenue;
				if (customer.churn === 1) churned++;

				return {
					period: idx + 1,
					revenue: customer.overall_revenue,
					cumulativeRevenue: cumulativeRevenue,
					customerCount: actualIndex + 1,
					churnRate: actualIndex > 0 ? (churned / (actualIndex + 1)) * 100 : 0,
				};
			});

		return data;
	}, [customers]);

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			{/* Revenue Trend */}
			<div className="bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-700">
				<h4 className="text-white text-sm font-semibold mb-2">Revenue Trend</h4>{" "}
				<ResponsiveContainer width="100%" height={180}>
					<LineChart
						data={chartData}
						margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
						<XAxis dataKey="period" stroke="#fff" fontSize={10} />
						<YAxis
							stroke="#fff"
							tickFormatter={(v) => `$${Math.round(v / 1000)}K`}
						/>
						<Tooltip
							formatter={(v) => `$${Math.round(Number(v)).toLocaleString()}`}
						/>
						<Line
							type="monotone"
							dataKey="cumulativeRevenue"
							stroke="#10b981"
							strokeWidth={2}
							dot={false}
							isAnimationActive={false}
						/>
					</LineChart>
				</ResponsiveContainer>
				<div className="text-green-400 text-lg font-bold mt-2">
					$
					{Math.round(
						chartData[chartData.length - 1]?.cumulativeRevenue / 1000
					)}
					K <span className="text-xs text-gray-400">current</span>
				</div>
			</div>
			{/* Customer Growth */}
			<div className="bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-700">
				<h4 className="text-white text-sm font-semibold mb-2">
					Customer Growth
				</h4>{" "}
				<ResponsiveContainer width="100%" height={180}>
					<LineChart
						data={chartData}
						margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
						<XAxis dataKey="period" stroke="#fff" fontSize={10} />
						<YAxis stroke="#fff" />
						<Tooltip formatter={(v) => Number(v).toLocaleString()} />
						<Line
							type="monotone"
							dataKey="customerCount"
							stroke="#3b82f6"
							strokeWidth={2}
							dot={false}
							isAnimationActive={false}
						/>
					</LineChart>
				</ResponsiveContainer>
				<div className="text-blue-400 text-lg font-bold mt-2">
					{chartData[chartData.length - 1]?.customerCount?.toLocaleString()}{" "}
					<span className="text-xs text-gray-400">current</span>
				</div>
			</div>{" "}
			{/* Churn Rate */}
			<div className="bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-700">
				<h4 className="text-white text-sm font-semibold mb-2">Churn Rate</h4>
				<ResponsiveContainer width="100%" height={180}>
					<LineChart
						data={chartData}
						margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
						<XAxis dataKey="period" stroke="#fff" fontSize={10} />
						<YAxis stroke="#fff" tickFormatter={(v) => `${v.toFixed(1)}%`} />
						<Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
						<Line
							type="monotone"
							dataKey="churnRate"
							stroke="#ef4444"
							strokeWidth={2}
							dot={false}
							isAnimationActive={false}
						/>
					</LineChart>
				</ResponsiveContainer>
				<div className="text-red-400 text-lg font-bold mt-2">
					{chartData[chartData.length - 1]?.churnRate?.toFixed(1)}%{" "}
					<span className="text-xs text-gray-400">current</span>
				</div>
			</div>
		</div>
	);
};
