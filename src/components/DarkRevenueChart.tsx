import React, { useEffect, useState } from "react";
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
import { DollarSign, TrendingUp, Package } from "lucide-react";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

const DarkRevenueChart: React.FC = () => {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		const fetchCustomers = async () => {
			try {
				setLoading(true);
				// Fetch all customers for comprehensive revenue analysis
				const data = await dataService.getCustomers({ limit: 2000 });
				setCustomers(data.customers || []);
			} catch (error) {
				console.error("Failed to fetch customers for revenue chart:", error);
				setCustomers([]); // Set empty array on error
			} finally {
				setLoading(false);
			}
		};

		fetchCustomers();
	}, []);

	const getProductCategories = () => {
		const categories = new Set<string>();
		customers.forEach((customer) => {
			Object.keys(customer).forEach((key) => {
				if (key.endsWith("_revenue") && key !== "overall_revenue") {
					const category = key.replace("_revenue", "");
					categories.add(category);
				}
			});
		});
		return Array.from(categories);
	};

	const getCategoryRevenue = () => {
		const categories = getProductCategories();
		const categoryData = categories.map((category) => {
			const revenueKey = `${category}_revenue`;
			const totalRevenue = customers.reduce((sum, customer) => {
				const revenue = customer[revenueKey];
				return sum + (typeof revenue === "number" ? revenue : 0);
			}, 0);

			const customerCount = customers.filter((customer) => {
				const revenue = customer[revenueKey];
				return typeof revenue === "number" && revenue > 0;
			}).length;

			return {
				category: category.replace(/_/g, " "),
				revenue: totalRevenue,
				customers: customerCount,
				avgRevenue: customerCount > 0 ? totalRevenue / customerCount : 0,
			};
		});

		return categoryData
			.filter((item) => item.revenue > 0)
			.sort((a, b) => b.revenue - a.revenue)
			.slice(0, 10); // Top 10 categories
	};

	const categoryData = getCategoryRevenue();

	const getChartData = () => {
		return {
			labels: categoryData.map((item) => item.category),
			datasets: [
				{
					label: "Total Revenue ($)",
					data: categoryData.map((item) => item.revenue),
					backgroundColor: "rgba(59, 130, 246, 0.8)",
					borderColor: "rgba(59, 130, 246, 1)",
					borderWidth: 0,
					borderRadius: 8,
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
				callbacks: {
					label: function (context) {
						const dataPoint = categoryData[context.dataIndex];
						return [
							`Revenue: $${context.parsed.y.toLocaleString()}`,
							`Customers: ${dataPoint.customers}`,
							`Avg per Customer: $${dataPoint.avgRevenue.toFixed(0)}`,
						];
					},
				},
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
					callback: function (value) {
						return "$" + Number(value).toLocaleString();
					},
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

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	};

	const topCategory = categoryData[0];
	const totalRevenue = categoryData.reduce(
		(sum, item) => sum + item.revenue,
		0
	);

	if (loading) {
		return (
			<div className="bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700">
				<div className="flex items-center justify-center h-96">
					<div className="text-gray-400">Loading revenue data...</div>
				</div>
			</div>
		);
	}

	return (
		<motion.div
			className="bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700 overflow-hidden"
			initial={{ opacity: 0, y: 40 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4, duration: 0.8 }}
		>
			{/* Header */}
			<motion.div
				className="flex items-center justify-between mb-8"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.6, duration: 0.6 }}
			>
				<div className="flex items-center">
					<div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mr-4 shadow-lg">
						<DollarSign className="w-6 h-6 text-white" />
					</div>
					<div>
						<h3 className="text-2xl font-bold text-white">
							Revenue by Category
						</h3>
						<p className="text-gray-400">
							Top-performing product categories analysis
						</p>
					</div>
				</div>
				<div className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-500/30">
					<div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></div>
					<span className="text-sm font-semibold text-blue-300">Live Data</span>
				</div>
			</motion.div>

			{/* Chart */}
			<motion.div
				className="h-96 mb-8"
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 0.8, duration: 0.8 }}
			>
				<Bar data={getChartData()} options={options} />
			</motion.div>

			{/* Revenue Insights */}
			<motion.div
				className="grid grid-cols-1 md:grid-cols-3 gap-6"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 1, duration: 0.6 }}
			>
				<motion.div
					className="p-6 rounded-2xl border-2 bg-blue-900/30 border-blue-500/30 hover:shadow-lg transition-all duration-300"
					whileHover={{ scale: 1.02 }}
				>
					<div className="flex items-start">
						<Package className="w-5 h-5 text-blue-400 mr-4 mt-1" />
						<div>
							<h4 className="font-bold text-white mb-2">Top Category</h4>
							<p className="text-sm text-gray-300 leading-relaxed">
								{topCategory?.category || "N/A"} leads with{" "}
								{formatCurrency(topCategory?.revenue || 0)}
							</p>
						</div>
					</div>
				</motion.div>

				<motion.div
					className="p-6 rounded-2xl border-2 bg-green-900/30 border-green-500/30 hover:shadow-lg transition-all duration-300"
					whileHover={{ scale: 1.02 }}
				>
					<div className="flex items-start">
						<TrendingUp className="w-5 h-5 text-green-400 mr-4 mt-1" />
						<div>
							<h4 className="font-bold text-white mb-2">Total Revenue</h4>
							<p className="text-sm text-gray-300 leading-relaxed">
								{formatCurrency(totalRevenue)} across all categories
							</p>
						</div>
					</div>
				</motion.div>

				<motion.div
					className="p-6 rounded-2xl border-2 bg-purple-900/30 border-purple-500/30 hover:shadow-lg transition-all duration-300"
					whileHover={{ scale: 1.02 }}
				>
					<div className="flex items-start">
						<DollarSign className="w-5 h-5 text-purple-400 mr-4 mt-1" />
						<div>
							<h4 className="font-bold text-white mb-2">Categories</h4>
							<p className="text-sm text-gray-300 leading-relaxed">
								{categoryData.length} active revenue streams
							</p>
						</div>
					</div>
				</motion.div>
			</motion.div>
		</motion.div>
	);
};

export default DarkRevenueChart;
