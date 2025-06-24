import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { dataService } from "../services/dataService";

interface DataPoint {
	time: string;
	value: number;
	change: number;
}

interface LiveChartProps {
	title: string;
	color: string;
	metric: "revenue" | "customers" | "churn";
}

export const LiveChart: React.FC<LiveChartProps> = ({
	title,
	color,
	metric,
}) => {
	const [data, setData] = useState<DataPoint[]>([]);
	const [isLive, setIsLive] = useState(true);
	const [loading, setLoading] = useState(true);

	// Initialize with real data
	useEffect(() => {
		const initializeData = async () => {
			try {
				const summary = await dataService.getSummary();
				let baseValue = 0;

				switch (metric) {
					case "revenue":
						baseValue = summary.total_revenue / 1000; // Convert to thousands
						break;
					case "customers":
						baseValue = summary.total_customers;
						break;
					case "churn":
						baseValue = summary.avg_churn_rate;
						break;
				}

				// Generate initial historical data points
				const initialData: DataPoint[] = [];
				const now = new Date();

				for (let i = 19; i >= 0; i--) {
					const time = new Date(now.getTime() - i * 30000); // 30 seconds intervals
					const variation = (Math.random() - 0.5) * 0.1; // ±10% variation
					const value = baseValue * (1 + variation);
					const change =
						i === 19
							? 0
							: value - initialData[initialData.length - 1]?.value || 0;

					initialData.push({
						time: time.toLocaleTimeString(),
						value: Math.max(0, value),
						change,
					});
				}

				setData(initialData);
				setLoading(false);
			} catch (error) {
				console.error("Failed to initialize chart data:", error);
				setLoading(false);
			}
		};

		initializeData();
	}, [metric]);

	useEffect(() => {
		if (!isLive || loading || data.length === 0) return;

		const interval = setInterval(() => {
			setData((prevData) => {
				if (prevData.length === 0) return prevData;

				const newData = [...prevData];
				const lastValue = newData[newData.length - 1]?.value || 0;

				// More realistic variations based on metric type
				let changeRange = 0;
				switch (metric) {
					case "revenue":
						changeRange = lastValue * 0.05; // ±5% for revenue
						break;
					case "customers":
						changeRange = Math.max(10, lastValue * 0.02); // ±2% for customers, min 10
						break;
					case "churn":
						changeRange = lastValue * 0.03; // ±3% for churn rate
						break;
				}

				const change = (Math.random() - 0.5) * changeRange;
				const newValue = Math.max(0, lastValue + change);

				newData.push({
					time: new Date().toLocaleTimeString(),
					value: newValue,
					change: change,
				});

				return newData.slice(-20); // Keep last 20 points
			});
		}, 3000); // Update every 3 seconds

		return () => clearInterval(interval);
	}, [isLive, loading, data.length, metric]);

	if (loading || data.length === 0) {
		return (
			<div className="animate-pulse">
				<div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
				<div className="h-32 bg-gray-700 rounded"></div>
			</div>
		);
	}

	const maxValue = Math.max(...data.map((d) => d.value));
	const minValue = Math.min(...data.map((d) => d.value));
	const latestPoint = data[data.length - 1];
	const isPositive = latestPoint?.change >= 0;

	const formatValue = (value: number) => {
		switch (metric) {
			case "revenue":
				return `$${value.toFixed(0)}K`;
			case "customers":
				return value.toFixed(0);
			case "churn":
				return `${value.toFixed(1)}%`;
			default:
				return value.toFixed(0);
		}
	};

	return (
		<div className="relative">
			<div className="flex items-center justify-between mb-4">
				<h4 className="text-sm font-medium text-gray-300">{title}</h4>
				<div className="flex items-center space-x-2">
					<div
						className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
							isPositive
								? "bg-green-500/20 text-green-400"
								: "bg-red-500/20 text-red-400"
						}`}
					>
						{isPositive ? (
							<TrendingUp className="w-3 h-3" />
						) : (
							<TrendingDown className="w-3 h-3" />
						)}
						<span>{Math.abs(latestPoint?.change || 0).toFixed(1)}</span>
					</div>
					<button
						onClick={() => setIsLive(!isLive)}
						className={`w-2 h-2 rounded-full ${
							isLive ? "bg-green-400 animate-pulse" : "bg-gray-500"
						}`}
						title={isLive ? "Live" : "Paused"}
					/>
				</div>
			</div>

			<div className="h-32 relative">
				<svg className="w-full h-full" viewBox="0 0 400 120">
					<defs>
						<linearGradient
							id={`gradient-${color.replace("#", "")}`}
							x1="0%"
							y1="0%"
							x2="0%"
							y2="100%"
						>
							<stop offset="0%" stopColor={color} stopOpacity="0.3" />
							<stop offset="100%" stopColor={color} stopOpacity="0.05" />
						</linearGradient>
					</defs>

					{/* Grid lines */}
					{[0, 1, 2, 3, 4].map((i) => (
						<line
							key={i}
							x1="0"
							y1={i * 30}
							x2="400"
							y2={i * 30}
							stroke="rgba(255,255,255,0.05)"
							strokeWidth="1"
						/>
					))}

					{/* Chart area */}
					{data.length > 1 && (
						<>
							<path
								d={`M ${data
									.map(
										(point, index) =>
											`${(index / (data.length - 1)) * 400},${
												120 -
												((point.value - minValue) / (maxValue - minValue)) * 100
											}`
									)
									.join(" L ")}`}
								fill="none"
								stroke={color}
								strokeWidth="2"
								className="drop-shadow-lg"
							/>
							<path
								d={`M ${data
									.map(
										(point, index) =>
											`${(index / (data.length - 1)) * 400},${
												120 -
												((point.value - minValue) / (maxValue - minValue)) * 100
											}`
									)
									.join(" L ")} L 400,120 L 0,120 Z`}
								fill={`url(#gradient-${color.replace("#", "")})`}
							/>
						</>
					)}

					{/* Data points */}
					{data.map((point, index) => (
						<circle
							key={index}
							cx={(index / (data.length - 1)) * 400}
							cy={
								120 - ((point.value - minValue) / (maxValue - minValue)) * 100
							}
							r="3"
							fill={color}
							className="drop-shadow-lg"
						/>
					))}
				</svg>
			</div>

			<div className="mt-2 text-right">
				<span className="text-2xl font-bold text-white">
					{formatValue(latestPoint?.value || 0)}
				</span>
				<span className="text-sm text-gray-400 ml-2">current</span>
			</div>
		</div>
	);
};
