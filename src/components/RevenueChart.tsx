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

const RevenueChart: React.FC = () => {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCustomers = async () => {
			try {
				setLoading(true);
				// Fetch all customers for comprehensive revenue analysis
				const data = await dataService.getCustomers({ limit: 2000 });
				setCustomers(data.customers);
			} catch (error) {
				console.error("Failed to fetch customers for revenue chart:", error);
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
				display: false,
			},
			tooltip: {
				backgroundColor: "rgba(17, 24, 39, 0.95)",
				titleColor: "white",
				bodyColor: "white",
				borderColor: "rgba(255, 255, 255, 0.1)",
				borderWidth: 1,
				cornerRadius: 12,
				padding: 12,
				callbacks: {
					label: function (context) {
						const item = categoryData[context.dataIndex];
						return [
							`Revenue: $${item.revenue.toLocaleString()}`,
							`Customers: ${item.customers.toLocaleString()}`,
							`Avg per Customer: $${item.avgRevenue.toFixed(2)}`,
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
						size: 11,
					},
					color: "#9CA3AF",
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
					color: "#9CA3AF",
					callback: function (value) {
						return "$" + (Number(value) / 1000).toFixed(0) + "K";
					},
				},
				border: {
					display: false,
				},
			},
		},
	};

	if (loading) {
		return (
			<div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
				<div className="animate-pulse">
					<div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
					<div className="h-64 bg-gray-700 rounded"></div>
				</div>
			</div>
		);
	}

	const topCategory = categoryData[0];
	const totalRevenue = categoryData.reduce(
		(sum, item) => sum + item.revenue,
		0
	);

	return (
		<motion.div
			className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700"
			initial={{ opacity: 0, y: 40 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4, duration: 0.8 }}
		>
			{/* Header */}
			<motion.div
				className="flex items-center justify-between mb-6"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.6, duration: 0.6 }}
			>
				<div className="flex items-center">
					<div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mr-4 shadow-lg">
						<DollarSign className="w-5 h-5 text-white" />
					</div>
					<div>
						<h3 className="text-xl font-bold text-white">
							Revenue by Category
						</h3>
						<p className="text-gray-400 text-sm">
							Top performing product categories
						</p>
					</div>
				</div>
			</motion.div>

			{/* Stats Cards */}
			<motion.div
				className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.8, duration: 0.6 }}
			>
				<div className="bg-gray-700/50 rounded-lg p-4">
					<div className="flex items-center">
						<Package className="w-5 h-5 text-blue-400 mr-2" />
						<div>
							<p className="text-gray-400 text-sm">Top Category</p>
							<p className="text-white font-semibold">
								{topCategory?.category || "N/A"}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-gray-700/50 rounded-lg p-4">
					<div className="flex items-center">
						<DollarSign className="w-5 h-5 text-green-400 mr-2" />
						<div>
							<p className="text-gray-400 text-sm">Total Revenue</p>
							<p className="text-white font-semibold">
								${totalRevenue.toLocaleString()}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-gray-700/50 rounded-lg p-4">
					<div className="flex items-center">
						<TrendingUp className="w-5 h-5 text-purple-400 mr-2" />
						<div>
							<p className="text-gray-400 text-sm">Categories</p>
							<p className="text-white font-semibold">{categoryData.length}</p>
						</div>
					</div>
				</div>
			</motion.div>

			{/* Chart */}
			<motion.div
				className="h-64"
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 1, duration: 0.8 }}
			>
				<Bar data={getChartData()} options={options} />
			</motion.div>
		</motion.div>
	);
};

export default RevenueChart;
