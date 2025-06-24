import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { dataService, Customer } from "../services/dataService";
import { BarChart3, TrendingUp, Users, Target } from "lucide-react";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

const DarkSegmentChart: React.FC = () => {
	const chartRef = useRef<ChartJS<"bar">>(null);
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		const fetchCustomers = async () => {
			try {
				setLoading(true);
				// Fetch a larger sample of customers for better analytics
				const data = await dataService.getCustomers({ limit: 1000 });
				setCustomers(data.customers || []);
			} catch (error) {
				console.error("Failed to fetch customers for chart:", error);
				setCustomers([]); // Set empty array on error
			} finally {
				setLoading(false);
			}
		};

		fetchCustomers();
	}, []);

	// Aggregate data by segment and risk
	const aggregateData = () => {
		const segmentMap = new Map();

		customers.forEach((customer) => {
			const key = `${customer.segment}_${customer.churn_risk}_${customer.cltv_segment}`;
			if (!segmentMap.has(key)) {
				segmentMap.set(key, {
					segment: customer.segment,
					churn_risk: customer.churn_risk,
					cltv_segment: customer.cltv_segment,
					count: 0,
					totalRevenue: 0,
					totalCLTV: 0,
				});
			}
			const data = segmentMap.get(key);
			data.count += 1;
			data.totalRevenue += customer.overall_revenue;
			data.totalCLTV += customer.cltv;
		});

		return Array.from(segmentMap.values());
	};

	const aggregatedData = aggregateData();
	const segments = [...new Set(aggregatedData.map((d) => d.segment))];

	const getChartData = () => {
		const highChurnData = segments.map((segment) =>
			aggregatedData
				.filter((d) => d.segment === segment && d.churn_risk === "high")
				.reduce((sum, d) => sum + d.count, 0)
		);

		const mediumChurnData = segments.map((segment) =>
			aggregatedData
				.filter((d) => d.segment === segment && d.churn_risk === "medium")
				.reduce((sum, d) => sum + d.count, 0)
		);

		const lowChurnData = segments.map((segment) =>
			aggregatedData
				.filter((d) => d.segment === segment && d.churn_risk === "low")
				.reduce((sum, d) => sum + d.count, 0)
		);

		return {
			labels: segments,
			datasets: [
				{
					label: "High Risk",
					data: highChurnData,
					backgroundColor: "rgba(239, 68, 68, 0.9)",
					borderColor: "rgba(239, 68, 68, 1)",
					borderWidth: 0,
					borderRadius: 12,
					borderSkipped: false,
				},
				{
					label: "Medium Risk",
					data: mediumChurnData,
					backgroundColor: "rgba(245, 158, 11, 0.9)",
					borderColor: "rgba(245, 158, 11, 1)",
					borderWidth: 0,
					borderRadius: 12,
					borderSkipped: false,
				},
				{
					label: "Low Risk",
					data: lowChurnData,
					backgroundColor: "rgba(34, 197, 94, 0.9)",
					borderColor: "rgba(34, 197, 94, 1)",
					borderWidth: 0,
					borderRadius: 12,
					borderSkipped: false,
				},
			],
		};
	};

	const options: ChartOptions<"bar"> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top" as const,
				labels: {
					font: {
						size: 14,
						weight: "bold",
					},
					usePointStyle: true,
					pointStyle: "circle",
					padding: 25,
					color: "#E5E7EB", // Light gray for dark theme
				},
			},
			title: {
				display: false,
			},
			tooltip: {
				backgroundColor: "rgba(17, 24, 39, 0.95)",
				titleColor: "white",
				bodyColor: "white",
				borderColor: "rgba(255, 255, 255, 0.1)",
				borderWidth: 1,
				cornerRadius: 12,
				displayColors: true,
				titleFont: {
					size: 14,
					weight: "bold",
				},
				bodyFont: {
					size: 13,
				},
				padding: 12,
			},
		},
		scales: {
			x: {
				grid: {
					display: false,
				},
				ticks: {
					font: {
						size: 12,
						weight: "normal",
					},
					color: "#9CA3AF", // Gray for dark theme
					maxRotation: 45,
				},
				border: {
					display: false,
				},
			},
			y: {
				beginAtZero: true,
				grid: {
					color: "rgba(156, 163, 175, 0.2)",
				},
				ticks: {
					font: {
						size: 12,
					},
					color: "#9CA3AF", // Gray for dark theme
				},
				border: {
					display: false,
				},
			},
		},
		elements: {
			bar: {
				borderSkipped: false,
			},
		},
		interaction: {
			intersect: false,
			mode: "index",
		},
	};

	const insights = [
		{
			icon: <Target className="w-5 h-5 text-red-400" />,
			title: "High-Risk Champions",
			description: "Urgent retention needed for high-value customers at risk",
			color: "bg-red-900/30 border-red-500/30",
		},
		{
			icon: <TrendingUp className="w-5 h-5 text-orange-400" />,
			title: "Growth Opportunities",
			description:
				"Medium-risk segments ideal for targeted marketing campaigns",
			color: "bg-orange-900/30 border-orange-500/30",
		},
		{
			icon: <Users className="w-5 h-5 text-green-400" />,
			title: "Loyal Base",
			description: "Low-risk customers perfect for upselling and cross-selling",
			color: "bg-green-900/30 border-green-500/30",
		},
	];

	if (loading) {
		return (
			<div className="bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700">
				<div className="flex items-center justify-center h-96">
					<div className="text-gray-400">Loading segment data...</div>
				</div>
			</div>
		);
	}
	return (
		<motion.div
			className="bg-gray-800 rounded-2xl p-4 md:p-8 shadow-xl border border-gray-700 overflow-hidden"
			initial={{ opacity: 0, y: 40 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2, duration: 0.8 }}
		>
			{" "}
			{/* Header */}
			<motion.div
				className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4, duration: 0.6 }}
			>
				<div className="flex items-center">
					<div className="p-2 md:p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mr-3 md:mr-4 shadow-lg">
						<BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-white" />
					</div>
					<div>
						<h3 className="text-xl md:text-2xl font-bold text-white">
							Customer Segment Analysis
						</h3>
						<p className="text-sm md:text-base text-gray-400">
							Distribution by churn risk across customer segments
						</p>
					</div>
				</div>
				<div className="flex items-center px-3 md:px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 self-start sm:self-auto">
					<div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-2"></div>
					<span className="text-xs md:text-sm font-semibold text-purple-300">
						Live Data
					</span>
				</div>
			</motion.div>{" "}
			{/* Chart */}
			<motion.div
				className="h-64 md:h-96 mb-6 md:mb-8"
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 0.6, duration: 0.8 }}
			>
				<Bar ref={chartRef} data={getChartData()} options={options} />
			</motion.div>{" "}
			{/* Insights Grid */}
			<motion.div
				className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.8, duration: 0.6 }}
			>
				{insights.map((insight, index) => (
					<motion.div
						key={index}
						className={`p-4 md:p-6 rounded-2xl border-2 ${insight.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
						whileHover={{ scale: 1.02 }}
					>
						<div className="flex items-start">
							<div className="mr-1 md:mr-1 mt-1 flex-shrink-0">
								{insight.icon}
							</div>
							<div className="min-w-0 flex-1">
								<h4 className="font-bold text-white mb-2 text-sm md:text-base leading-tight">
									{insight.title}
								</h4>
								<p className="text-xs md:text-sm text-gray-300 leading-relaxed break-words">
									{insight.description}
								</p>
							</div>
						</div>
					</motion.div>
				))}
			</motion.div>
		</motion.div>
	);
};

export default DarkSegmentChart;
