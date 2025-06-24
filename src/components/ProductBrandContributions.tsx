import React, { useState, useEffect } from "react";
import {
	dataService,
	ProductBrandContributionsResponse,
	Customer,
} from "../services/dataService";
import { motion } from "framer-motion";

export const ProductBrandContributions: React.FC = () => {
	const [contributionsData, setContributionsData] =
		useState<ProductBrandContributionsResponse | null>(null);
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [loading, setLoading] = useState(false);

	// Filter states - managed internally
	const [selectedSegment, setSelectedSegment] = useState<string>("");
	const [selectedChurnRisk, setSelectedChurnRisk] = useState<string>("");
	const [selectedCltvSegment, setSelectedCltvSegment] = useState<string>("");

	// Fetch customers data for filter options
	useEffect(() => {
		const fetchCustomers = async () => {
			try {
				const data = await dataService.getCustomers({ limit: 5000 });
				setCustomers(data.customers);
			} catch (err) {
				console.error("Failed to fetch customers for filters:", err);
			}
		};
		fetchCustomers();
	}, []);

	useEffect(() => {
		const fetchContributions = async () => {
			setLoading(true);
			try {
				const filters = {
					segment: selectedSegment || undefined,
					churn_risk: selectedChurnRisk || undefined,
					cltv_segment: selectedCltvSegment || undefined,
				};

				const data = await dataService.getProductBrandContributions(filters);
				setContributionsData(data);
			} catch (err) {
				console.error("Failed to fetch product brand contributions:", err);
				setContributionsData(null);
			} finally {
				setLoading(false);
			}
		};

		fetchContributions();
	}, [selectedSegment, selectedChurnRisk, selectedCltvSegment]);

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	};

	const formatNumber = (value: number) => {
		return new Intl.NumberFormat("en-US").format(value);
	};

	if (loading) {
		return (
			<div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
				<div className="text-center py-8">
					<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
					<p className="text-gray-300 mt-2">
						Loading product brand contributions...
					</p>
				</div>
			</div>
		);
	}

	if (!contributionsData) {
		return (
			<div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
				<p className="text-red-400 text-center">
					Failed to load product brand contributions.
				</p>
			</div>
		);
	}

	const { contributions, total_revenue, total_customers } = contributionsData;

	// Get top 2 and bottom 2 by revenue percentage
	const topContributions = contributions.slice(0, 2);
	const bottomContributions = contributions.slice(-2).reverse();

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
		>
			<h2 className="text-xl font-semibold text-white mb-4">
				🏪 Product Brand Contributions
			</h2>

			{/* Filter Controls */}
			<div className="mb-6">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-4">
						<span className="text-sm text-gray-300">Filters:</span>
						<span className="text-xs text-gray-400">
							Select filters to analyze specific customer segments
						</span>
					</div>

					{/* Clear Filters Button */}
					<button
						onClick={() => {
							setSelectedSegment("");
							setSelectedChurnRisk("");
							setSelectedCltvSegment("");
						}}
						className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
					>
						Clear All Filters
					</button>
				</div>

				{/* Filter Dropdowns */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="block text-sm text-gray-300 mb-2">
							Customer Segment
						</label>
						<select
							value={selectedSegment}
							onChange={(e) => setSelectedSegment(e.target.value)}
							className="w-full bg-gray-700 border border-gray-600 rounded-md text-white p-2"
						>
							<option value="">None (All Segments)</option>
							{Array.from(new Set(customers.map((c) => c.segment))).map(
								(seg) => (
									<option key={seg} value={seg}>
										{seg}
									</option>
								)
							)}
						</select>
					</div>

					<div>
						<label className="block text-sm text-gray-300 mb-2">
							Churn Risk
						</label>
						<select
							value={selectedChurnRisk}
							onChange={(e) => setSelectedChurnRisk(e.target.value)}
							className="w-full bg-gray-700 border border-gray-600 rounded-md text-white p-2"
						>
							<option value="">None (All Churn Risks)</option>
							{Array.from(new Set(customers.map((c) => c.churn_risk))).map(
								(cr) => (
									<option key={cr} value={cr}>
										{cr}
									</option>
								)
							)}
						</select>
					</div>

					<div>
						<label className="block text-sm text-gray-300 mb-2">
							CLTV Segment
						</label>
						<select
							value={selectedCltvSegment}
							onChange={(e) => setSelectedCltvSegment(e.target.value)}
							className="w-full bg-gray-700 border border-gray-600 rounded-md text-white p-2"
						>
							<option value="">None (All CLTV Segments)</option>
							{Array.from(new Set(customers.map((c) => c.cltv_segment))).map(
								(cs) => (
									<option key={cs} value={cs}>
										{cs}
									</option>
								)
							)}
						</select>
					</div>
				</div>
			</div>

			{/* Filter Summary */}
			<div className="mb-6 p-4 bg-gray-700/30 rounded-lg">
				<h4 className="text-sm font-semibold text-white mb-2">
					📊 Analysis Summary
				</h4>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
					<div className="text-center">
						<p className="text-gray-400">Total Revenue</p>
						<p className="text-green-400 font-semibold">
							{formatCurrency(total_revenue)}
						</p>
					</div>
					<div className="text-center">
						<p className="text-gray-400">Total Customers</p>
						<p className="text-white font-semibold">
							{formatNumber(total_customers)}
						</p>
					</div>
					<div className="text-center">
						<p className="text-gray-400">Product Categories</p>
						<p className="text-blue-400 font-semibold">
							{contributions.length}
						</p>
					</div>
					<div className="text-center">
						<p className="text-gray-400">Active Filters</p>
						<p className="text-purple-400 font-semibold">
							{[selectedSegment, selectedChurnRisk, selectedCltvSegment].filter(
								Boolean
							).length || "None"}
						</p>
					</div>
				</div>
			</div>

			{/* Top 2 Contributors */}
			<div className="mb-6">
				<h3 className="text-lg font-medium text-white mb-3 flex items-center">
					🏆 Top 2% Contributors
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{topContributions.map((item, index) => (
						<div
							key={item.category}
							className="bg-gradient-to-br from-green-600/20 to-emerald-700/20 p-4 rounded-lg border border-green-600/30"
						>
							<div className="flex items-center justify-between mb-3">
								<h4 className="text-white font-medium">
									{item.category.replace(/_/g, " ")}
								</h4>
								<span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
									#{index + 1}
								</span>
							</div>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-gray-300 text-sm">Revenue:</span>
									<span className="text-green-400 font-semibold">
										{formatCurrency(item.revenue)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-300 text-sm">% of Total:</span>
									<span className="text-green-400 font-bold">
										{item.revenue_percentage.toFixed(1)}%
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-300 text-sm">Customers:</span>
									<span className="text-white font-semibold">
										{formatNumber(item.customers)} (
										{item.customer_percentage.toFixed(1)}%)
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-300 text-sm">Visits:</span>
									<span className="text-blue-400 font-semibold">
										{formatNumber(item.visits)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-300 text-sm">Units Sold:</span>
									<span className="text-purple-400 font-semibold">
										{formatNumber(item.units)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-300 text-sm">
										Avg Rev/Customer:
									</span>
									<span className="text-yellow-400 font-semibold">
										{formatCurrency(item.avg_revenue_per_customer)}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Bottom 2 Contributors */}
			<div className="mb-6">
				<h3 className="text-lg font-medium text-white mb-3 flex items-center">
					📉 Lowest 2% Contributors
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{bottomContributions.map((item, index) => (
						<div
							key={item.category}
							className="bg-gradient-to-br from-red-600/20 to-red-700/20 p-4 rounded-lg border border-red-600/30"
						>
							<div className="flex items-center justify-between mb-3">
								<h4 className="text-white font-medium">
									{item.category.replace(/_/g, " ")}
								</h4>
								<span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
									#{contributions.length - index}
								</span>
							</div>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-gray-300 text-sm">Revenue:</span>
									<span className="text-red-400 font-semibold">
										{formatCurrency(item.revenue)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-300 text-sm">% of Total:</span>
									<span className="text-red-400 font-bold">
										{item.revenue_percentage.toFixed(1)}%
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-300 text-sm">Customers:</span>
									<span className="text-white font-semibold">
										{formatNumber(item.customers)} (
										{item.customer_percentage.toFixed(1)}%)
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-300 text-sm">Visits:</span>
									<span className="text-blue-400 font-semibold">
										{formatNumber(item.visits)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-300 text-sm">Units Sold:</span>
									<span className="text-purple-400 font-semibold">
										{formatNumber(item.units)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-300 text-sm">
										Avg Rev/Customer:
									</span>
									<span className="text-yellow-400 font-semibold">
										{formatCurrency(item.avg_revenue_per_customer)}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</motion.div>
	);
};
