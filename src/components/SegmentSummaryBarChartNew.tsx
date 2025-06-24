import React, { useMemo, useState } from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { Customer } from "../services/dataService";

interface SegmentSummaryBarChartProps {
	customers: Customer[];
}

interface FilterState {
	segments: string[];
	churnRisks: string[];
	cltvSegments: string[];
}

interface ChartDataPoint {
	segment: string;
	[key: string]: string | number;
}

export const SegmentSummaryBarChart: React.FC<SegmentSummaryBarChartProps> = ({
	customers,
}) => {
	// Initialize filters with all options selected
	const allSegments = Array.from(new Set(customers.map((c) => c.segment)));
	const allChurnRisks = Array.from(new Set(customers.map((c) => c.churn_risk)));
	const allCltvSegments = Array.from(
		new Set(customers.map((c) => c.cltv_segment))
	);

	const [filters, setFilters] = useState<FilterState>({
		segments: allSegments,
		churnRisks: allChurnRisks,
		cltvSegments: allCltvSegments,
	});

	// Filter customers based on selected filters
	const filteredCustomers = useMemo(() => {
		return customers.filter(
			(customer) =>
				filters.segments.includes(customer.segment) &&
				filters.churnRisks.includes(customer.churn_risk) &&
				filters.cltvSegments.includes(customer.cltv_segment)
		);
	}, [customers, filters]);

	// Aggregate data for the chart
	const chartData = useMemo(() => {
		const dataMap = new Map<string, ChartDataPoint>();

		// Initialize segments
		filters.segments.forEach((segment) => {
			if (!dataMap.has(segment)) {
				dataMap.set(segment, { segment });
			}
		});

		// Count customers for each combination
		filteredCustomers.forEach((customer) => {
			const segment = customer.segment;
			const barKey = `${customer.churn_risk} / ${customer.cltv_segment}`;

			const dataPoint = dataMap.get(segment);
			if (dataPoint) {
				dataPoint[barKey] = ((dataPoint[barKey] as number) || 0) + 1;
			}
		});

		return Array.from(dataMap.values());
	}, [filteredCustomers, filters.segments]);

	// Get all possible bar keys (churn/cltv combinations)
	const barKeys = useMemo(() => {
		const keys = new Set<string>();
		filters.churnRisks.forEach((churn) => {
			filters.cltvSegments.forEach((cltv) => {
				keys.add(`${churn} / ${cltv}`);
			});
		});
		return Array.from(keys);
	}, [filters.churnRisks, filters.cltvSegments]);

	const colors = [
		"#ef4444",
		"#f59e42",
		"#22c55e",
		"#6366f1",
		"#eab308",
		"#06b6d4",
		"#a21caf",
		"#f97316",
		"#84cc16",
		"#8b5cf6",
	];

	const handleFilterChange = (
		type: keyof FilterState,
		value: string,
		checked: boolean
	) => {
		setFilters((prev) => ({
			...prev,
			[type]: checked
				? [...prev[type], value]
				: prev[type].filter((item) => item !== value),
		}));
	};

	return (
		<div className="w-full bg-gray-800 rounded-lg p-6">
			<h3 className="text-lg font-semibold text-white mb-4">
				📊 Customer Segments Analysis
			</h3>

			{/* Filter Controls */}
			<div className="mb-6 bg-gray-700/30 rounded-lg p-4">
				<h4 className="text-sm font-semibold text-white mb-3">Filters</h4>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Customer Segments Filter */}
					<div>
						<h5 className="text-sm font-medium text-gray-300 mb-2">
							Customer Segments
						</h5>
						<div className="space-y-2 max-h-32 overflow-y-auto">
							{allSegments.map((segment) => (
								<label
									key={segment}
									className="flex items-center space-x-2 text-sm"
								>
									<input
										type="checkbox"
										checked={filters.segments.includes(segment)}
										onChange={(e) =>
											handleFilterChange("segments", segment, e.target.checked)
										}
										className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
									/>
									<span className="text-gray-300">{segment}</span>
								</label>
							))}
						</div>
					</div>

					{/* Churn Risk Filter */}
					<div>
						<h5 className="text-sm font-medium text-gray-300 mb-2">
							Churn Risk
						</h5>
						<div className="space-y-2">
							{allChurnRisks.map((risk) => (
								<label
									key={risk}
									className="flex items-center space-x-2 text-sm"
								>
									<input
										type="checkbox"
										checked={filters.churnRisks.includes(risk)}
										onChange={(e) =>
											handleFilterChange("churnRisks", risk, e.target.checked)
										}
										className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
									/>
									<span
										className={`text-gray-300 ${
											risk === "high"
												? "text-red-400"
												: risk === "medium"
												? "text-yellow-400"
												: "text-green-400"
										}`}
									>
										{risk}
									</span>
								</label>
							))}
						</div>
					</div>

					{/* CLTV Segment Filter */}
					<div>
						<h5 className="text-sm font-medium text-gray-300 mb-2">
							CLTV Segment
						</h5>
						<div className="space-y-2">
							{allCltvSegments.map((cltv) => (
								<label
									key={cltv}
									className="flex items-center space-x-2 text-sm"
								>
									<input
										type="checkbox"
										checked={filters.cltvSegments.includes(cltv)}
										onChange={(e) =>
											handleFilterChange("cltvSegments", cltv, e.target.checked)
										}
										className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
									/>
									<span
										className={`text-gray-300 ${
											cltv === "high"
												? "text-green-400"
												: cltv === "medium"
												? "text-yellow-400"
												: "text-red-400"
										}`}
									>
										{cltv}
									</span>
								</label>
							))}
						</div>
					</div>
				</div>

				{/* Clear All / Select All buttons */}
				<div className="mt-4 flex gap-2">
					<button
						onClick={() =>
							setFilters({
								segments: allSegments,
								churnRisks: allChurnRisks,
								cltvSegments: allCltvSegments,
							})
						}
						className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
					>
						Select All
					</button>
					<button
						onClick={() =>
							setFilters({
								segments: [],
								churnRisks: [],
								cltvSegments: [],
							})
						}
						className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
					>
						Clear All
					</button>
				</div>
			</div>

			{/* Chart */}
			<div className="h-96">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={chartData}
						margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
					>
						<XAxis
							dataKey="segment"
							stroke="#fff"
							fontSize={12}
							angle={-45}
							textAnchor="end"
							height={100}
						/>
						<YAxis
							stroke="#fff"
							allowDecimals={false}
							label={{
								value: "Number of Customers",
								angle: -90,
								position: "insideLeft",
								style: { textAnchor: "middle", fill: "#fff" },
							}}
						/>
						<Tooltip
							contentStyle={{
								background: "#1f2937",
								border: "1px solid #374151",
								borderRadius: "8px",
								color: "#fff",
							}}
							formatter={(value: number, name: string) => [
								`${value} customers`,
								name,
							]}
						/>
						<Legend wrapperStyle={{ color: "#fff" }} iconType="rect" />
						{barKeys.map((key, idx) => (
							<Bar
								key={key}
								dataKey={key}
								fill={colors[idx % colors.length]}
								name={key}
								radius={[2, 2, 0, 0]}
							/>
						))}
					</BarChart>
				</ResponsiveContainer>
			</div>

			{/* Summary Stats */}
			<div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
				<div className="text-center p-3 bg-gray-700/30 rounded">
					<p className="text-gray-400">Total Customers</p>
					<p className="text-white font-semibold text-lg">
						{filteredCustomers.length.toLocaleString()}
					</p>
				</div>
				<div className="text-center p-3 bg-gray-700/30 rounded">
					<p className="text-gray-400">Active Segments</p>
					<p className="text-blue-400 font-semibold text-lg">
						{filters.segments.length}
					</p>
				</div>
				<div className="text-center p-3 bg-gray-700/30 rounded">
					<p className="text-gray-400">Churn Risks</p>
					<p className="text-yellow-400 font-semibold text-lg">
						{filters.churnRisks.length}
					</p>
				</div>
				<div className="text-center p-3 bg-gray-700/30 rounded">
					<p className="text-gray-400">CLTV Segments</p>
					<p className="text-green-400 font-semibold text-lg">
						{filters.cltvSegments.length}
					</p>
				</div>
			</div>
		</div>
	);
};
