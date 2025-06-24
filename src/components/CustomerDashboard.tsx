import React, { useState, useEffect, useMemo } from "react";
import { dataService, Customer, Summary } from "../services/dataService";
import DarkSegmentChart from "./DarkSegmentChart";
import { ProductGroupOverview } from "./ProductGroupOverview";
import { ProductBrandContributions } from "./ProductBrandContributions";
import { ChurnAnalytics } from "./ChurnAnalytics";
import { InsightsRecommendations } from "./InsightsRecommendations";
import { motion } from "framer-motion";
import { SegmentSummaryBarChart } from "./SegmentSummaryBarChart";

export const CustomerDashboard: React.FC = () => {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [summary, setSummary] = useState<Summary | null>(null);
	useEffect(() => {
		const fetchSummary = async () => {
			try {
				const summaryData = await dataService.getSummary();
				setSummary(summaryData);
			} catch (err) {
				console.error("Failed to fetch summary:", err);
			}
		};

		fetchSummary();
	}, []);

	useEffect(() => {
		const fetchCustomers = async () => {
			try {
				const data = await dataService.getCustomers({ limit: 5000 });
				setCustomers(data.customers);
			} catch (err) {
				console.error("Failed to fetch customers:", err);
				setCustomers([]);
			}
		};

		fetchCustomers();
	}, []); // Aggregate data for segment summary with percentage calculations
	const aggData = useMemo(() => {
		const map: Record<
			string,
			{
				Segment: string;
				ChurnRisk: string;
				CLTVSegment: string;
				CustomerCount: number;
				AvgRevenue: number;
				AvgCLTV: number;
				TotalRevenue: number;
				TotalCLTV: number;
			}
		> = {};

		customers.forEach((c) => {
			const key = `${c.segment}|${c.churn_risk}|${c.cltv_segment}`;
			if (!map[key]) {
				map[key] = {
					Segment: c.segment,
					ChurnRisk: c.churn_risk,
					CLTVSegment: c.cltv_segment,
					CustomerCount: 0,
					AvgRevenue: 0,
					AvgCLTV: 0,
					TotalRevenue: 0,
					TotalCLTV: 0,
				};
			}
			map[key].CustomerCount += 1;
			map[key].TotalRevenue += c.overall_revenue;
			map[key].TotalCLTV += c.cltv;
		});

		// Calculate averages
		Object.values(map).forEach((item) => {
			if (item.CustomerCount > 0) {
				item.AvgRevenue = item.TotalRevenue / item.CustomerCount;
				item.AvgCLTV = item.TotalCLTV / item.CustomerCount;
			}
		});

		return Object.values(map);
	}, [customers]); // Filter aggregated data with percentage calculations
	const { filteredAggData, filteredTotalStats } = useMemo(() => {
		// Show all data without filters in Segment Summary
		const filtered = aggData;

		// Calculate totals for percentage calculations
		const filteredTotal = {
			totalCustomers: filtered.reduce(
				(sum, item) => sum + item.CustomerCount,
				0
			),
			totalRevenue: filtered.reduce((sum, item) => sum + item.TotalRevenue, 0),
			totalCLTV: filtered.reduce((sum, item) => sum + item.TotalCLTV, 0),
		};

		// Add percentage calculations to each item
		const dataWithPercentages = filtered.map((item) => ({
			...item,
			CustomerPercentage:
				filteredTotal.totalCustomers > 0
					? (item.CustomerCount / filteredTotal.totalCustomers) * 100
					: 0,
			RevenuePercentage:
				filteredTotal.totalRevenue > 0
					? (item.TotalRevenue / filteredTotal.totalRevenue) * 100
					: 0,
			CLTVPercentage:
				filteredTotal.totalCLTV > 0
					? (item.TotalCLTV / filteredTotal.totalCLTV) * 100
					: 0,
		}));

		return {
			filteredAggData: dataWithPercentages,
			filteredTotalStats: filteredTotal,
		};
	}, [aggData]);
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	};
	return (
		<div className="container mx-auto px-4 py-8 max-w-7xl">
			<h1 className="text-3xl font-bold text-white mb-6">
				Customer Analytics Dashboard
			</h1>
			{/* Product Group Overview */}
			<ProductGroupOverview />
			{/* Summary Cards */}
			{summary && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
				>
					<div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-lg shadow-lg">
						<h3 className="text-white text-sm font-medium mb-2">
							Total Customers
						</h3>
						<p className="text-white text-2xl font-bold">
							{summary.total_customers.toLocaleString()}
						</p>
					</div>
					<div className="bg-gradient-to-br from-red-600 to-pink-700 p-6 rounded-lg shadow-lg">
						<h3 className="text-white text-sm font-medium mb-2">
							Average Churn Rate
						</h3>
						<p className="text-white text-2xl font-bold">
							{summary.avg_churn_rate}%
						</p>
					</div>
					<div className="bg-gradient-to-br from-amber-500 to-orange-700 p-6 rounded-lg shadow-lg">
						<h3 className="text-white text-sm font-medium mb-2">
							High Risk Customers
						</h3>
						<p className="text-white text-2xl font-bold">
							{summary.high_risk_customers.toLocaleString()}
						</p>
					</div>
					<div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-6 rounded-lg shadow-lg">
						<h3 className="text-white text-sm font-medium mb-2">
							Average CLTV
						</h3>
						<p className="text-white text-2xl font-bold">
							{formatCurrency(summary.avg_cltv)}
						</p>
					</div>{" "}
				</motion.div>
			)}{" "}
			{/* Analytics Charts Row */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.4 }}
				className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
			>
				<DarkSegmentChart />
				<ChurnAnalytics customers={customers} />
			</motion.div>{" "}
			{/* Segment Summary Visualization */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.6 }}
				className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
			>
				<h2 className="text-xl font-semibold text-white mb-4">
					🧠 Segment Summary Visualization
				</h2>
				{/* Summary Statistics */}
				{filteredAggData.length > 0 && (
					<div className="mb-6 p-4 bg-gray-700/30 rounded-lg">
						<h4 className="text-sm font-semibold text-white mb-2">
							📈 Overall Summary
						</h4>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
							<div className="text-center">
								<p className="text-gray-400">Total Customers</p>
								<p className="text-white font-semibold">
									{filteredTotalStats.totalCustomers.toLocaleString()}
								</p>
							</div>
							<div className="text-center">
								<p className="text-gray-400">Total Revenue</p>
								<p className="text-green-400 font-semibold">
									{formatCurrency(filteredTotalStats.totalRevenue)}
								</p>
							</div>
							<div className="text-center">
								<p className="text-gray-400">Total CLTV</p>
								<p className="text-blue-400 font-semibold">
									{formatCurrency(filteredTotalStats.totalCLTV)}
								</p>
							</div>
							<div className="text-center">
								<p className="text-gray-400">Avg CLTV</p>
								<p className="text-purple-400 font-semibold">
									{formatCurrency(
										filteredTotalStats.totalCustomers > 0
											? filteredTotalStats.totalCLTV /
													filteredTotalStats.totalCustomers
											: 0
									)}
								</p>
							</div>
						</div>
					</div>
				)}
				{/* Segment Summary Bar Chart */}
				<SegmentSummaryBarChart customers={customers} />
				{/* Enhanced Insights */}
				<div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
					<h4 className="text-sm font-semibold text-white mb-2">
						📊 Key Insights
					</h4>
					<div className="text-sm text-gray-300 space-y-1">
						{filteredAggData.length === 0 ? (
							<p>• No data available. Check your data source.</p>
						) : (
							<>
								<p>
									• Showing {filteredAggData.length} segment combinations across
									all customer data.
								</p>
								<p>
									• Percentages show contribution within the entire customer
									base.
								</p>
								<p>
									• High churn & high CLTV customers need urgent retention
									offers.
								</p>
								<p>
									• Medium churn & medium CLTV segments are opportunities for
									targeted marketing.
								</p>
								<p>
									• Low churn & high CLTV groups are loyal, potential targets
									for upsell and cross-sell.
								</p>
							</>
						)}
					</div>{" "}
				</div>{" "}
			</motion.div>
			{/* Product Brand Contributions */}
			<ProductBrandContributions />
			{/* Executive Summary & Insights */}
			{customers.length > 0 && (
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 1.0 }}
					className="mt-8"
				>
					<InsightsRecommendations customers={customers} />
				</motion.div>
			)}
		</div>
	);
};
