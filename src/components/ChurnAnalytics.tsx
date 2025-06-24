import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Customer } from "../services/dataService";

interface ChurnAnalyticsProps {
	customers: Customer[];
}

interface ChurnStats {
	count: number;
	avgChurnRate: number;
	avgRevenue: number;
	avgCltv: number;
	topBrands: Array<{ brand: string; count: number; revenue: number }>;
	bottomBrands: Array<{ brand: string; count: number; revenue: number }>;
}

export const ChurnAnalytics: React.FC<ChurnAnalyticsProps> = ({
	customers,
}) => {
	// Calculate statistics for churn = 0 and churn = 1
	const churnStats = useMemo(() => {
		const churn0Customers = customers.filter((c) => c.churn === 0);
		const churn1Customers = customers.filter((c) => c.churn === 1);

		// Helper function to get product brand contributions
		const getProductBrandContributions = (customerList: Customer[]) => {
			const brandContributions = new Map<
				string,
				{ count: number; revenue: number }
			>();

			customerList.forEach((customer) => {
				// Extract product categories from the customer data
				Object.keys(customer).forEach((key) => {
					if (key.endsWith("_revenue") && !key.startsWith("overall")) {
						const brandName = key.replace("_revenue", "").replace(/_/g, " ");
						const revenue = customer[key] as number;

						if (revenue > 0) {
							const existing = brandContributions.get(brandName) || {
								count: 0,
								revenue: 0,
							};
							brandContributions.set(brandName, {
								count: existing.count + 1,
								revenue: existing.revenue + revenue,
							});
						}
					}
				});
			});

			// Convert to array and sort by revenue
			const sorted = Array.from(brandContributions.entries())
				.map(([brand, data]) => ({ brand, ...data }))
				.sort((a, b) => b.revenue - a.revenue);

			return {
				top: sorted.slice(0, 2),
				bottom: sorted.slice(-2).reverse(),
			};
		};

		const churn0Brands = getProductBrandContributions(churn0Customers);
		const churn1Brands = getProductBrandContributions(churn1Customers);

		return {
			churn0: {
				count: churn0Customers.length,
				avgChurnRate: 0, // Always 0 for churn = 0
				avgRevenue:
					churn0Customers.length > 0
						? churn0Customers.reduce((sum, c) => sum + c.overall_revenue, 0) /
						  churn0Customers.length
						: 0,
				avgCltv:
					churn0Customers.length > 0
						? churn0Customers.reduce((sum, c) => sum + c.cltv, 0) /
						  churn0Customers.length
						: 0,
				topBrands: churn0Brands.top,
				bottomBrands: churn0Brands.bottom,
			} as ChurnStats,
			churn1: {
				count: churn1Customers.length,
				avgChurnRate:
					churn1Customers.length > 0
						? churn1Customers.reduce((sum, c) => sum + c.churn_probability, 0) /
						  churn1Customers.length
						: 0,
				avgRevenue:
					churn1Customers.length > 0
						? churn1Customers.reduce((sum, c) => sum + c.overall_revenue, 0) /
						  churn1Customers.length
						: 0,
				avgCltv:
					churn1Customers.length > 0
						? churn1Customers.reduce((sum, c) => sum + c.cltv, 0) /
						  churn1Customers.length
						: 0,
				topBrands: churn1Brands.top,
				bottomBrands: churn1Brands.bottom,
			} as ChurnStats,
		};
	}, [customers]);
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="w-full bg-gray-800 rounded-lg p-6"
		>
			<h3 className="text-lg font-semibold text-white mb-6">
				🔍 Churn Analysis
			</h3>

			<div className="space-y-6">
				{/* Churn = 0 (Retained Customers) */}
				<div className="bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-lg p-5 border border-green-700/30">
					<h4 className="text-base font-semibold text-green-400 mb-4 flex items-center">
						✅ Retained Customers (Churn = 0)
						<span className="ml-2 text-xs bg-green-700/30 px-2 py-1 rounded">
							{((churnStats.churn0.count / customers.length) * 100).toFixed(1)}%
						</span>
					</h4>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
						<div className="bg-gray-700/40 rounded-lg p-3 text-center">
							<p className="text-gray-400 text-xs">Total Customers</p>
							<p className="font-bold text-green-400 text-lg">
								{churnStats.churn0.count.toLocaleString()}
							</p>
						</div>

						<div className="bg-gray-700/40 rounded-lg p-3 text-center">
							<p className="text-gray-400 text-xs">Avg Revenue</p>
							<p className="font-bold text-green-400 text-lg">
								${churnStats.churn0.avgRevenue.toFixed(0)}
							</p>
						</div>

						<div className="bg-gray-700/40 rounded-lg p-3 text-center">
							<p className="text-gray-400 text-xs">Avg CLTV</p>
							<p className="font-bold text-green-400 text-lg">
								${churnStats.churn0.avgCltv.toFixed(0)}
							</p>
						</div>

						<div className="bg-gray-700/40 rounded-lg p-3 text-center">
							<p className="text-gray-400 text-xs">Churn Risk</p>
							<p className="font-bold text-green-400 text-lg">
								{churnStats.churn0.avgChurnRate.toFixed(2)}%
							</p>
						</div>
					</div>

					{/* Top Brands for Retained Customers */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="bg-gray-700/30 rounded-lg p-3">
							<h5 className="text-xs font-semibold text-green-300 mb-2">
								Top Performing Brands
							</h5>
							{churnStats.churn0.topBrands.map((brand, index) => (
								<div
									key={index}
									className="flex justify-between items-center py-1"
								>
									<span className="text-gray-300 text-xs capitalize">
										{brand.brand}
									</span>
									<span className="text-green-400 text-xs font-semibold">
										${brand.revenue.toFixed(0)}
									</span>
								</div>
							))}
						</div>

						<div className="bg-gray-700/30 rounded-lg p-3">
							<h5 className="text-xs font-semibold text-green-300 mb-2">
								Growth Opportunities
							</h5>
							{churnStats.churn0.bottomBrands.map((brand, index) => (
								<div
									key={index}
									className="flex justify-between items-center py-1"
								>
									<span className="text-gray-300 text-xs capitalize">
										{brand.brand}
									</span>
									<span className="text-yellow-400 text-xs font-semibold">
										${brand.revenue.toFixed(0)}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Churn = 1 (Lost Customers) */}
				<div className="bg-gradient-to-r from-red-900/20 to-red-800/20 rounded-lg p-5 border border-red-700/30">
					<h4 className="text-base font-semibold text-red-400 mb-4 flex items-center">
						❌ Lost Customers (Churn = 1)
						<span className="ml-2 text-xs bg-red-700/30 px-2 py-1 rounded">
							{((churnStats.churn1.count / customers.length) * 100).toFixed(1)}%
						</span>
					</h4>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
						<div className="bg-gray-700/40 rounded-lg p-3 text-center">
							<p className="text-gray-400 text-xs">Total Customers</p>
							<p className="font-bold text-red-400 text-lg">
								{churnStats.churn1.count.toLocaleString()}
							</p>
						</div>

						<div className="bg-gray-700/40 rounded-lg p-3 text-center">
							<p className="text-gray-400 text-xs">Avg Revenue</p>
							<p className="font-bold text-red-400 text-lg">
								${churnStats.churn1.avgRevenue.toFixed(0)}
							</p>
						</div>

						<div className="bg-gray-700/40 rounded-lg p-3 text-center">
							<p className="text-gray-400 text-xs">Avg CLTV</p>
							<p className="font-bold text-red-400 text-lg">
								${churnStats.churn1.avgCltv.toFixed(0)}
							</p>
						</div>

						<div className="bg-gray-700/40 rounded-lg p-3 text-center">
							<p className="text-gray-400 text-xs">Churn Probability</p>
							<p className="font-bold text-red-400 text-lg">
								{(churnStats.churn1.avgChurnRate * 100).toFixed(1)}%
							</p>
						</div>
					</div>

					{/* Analysis for Lost Customers */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="bg-gray-700/30 rounded-lg p-3">
							<h5 className="text-xs font-semibold text-red-300 mb-2">
								Revenue Impact Brands
							</h5>
							{churnStats.churn1.topBrands.map((brand, index) => (
								<div
									key={index}
									className="flex justify-between items-center py-1"
								>
									<span className="text-gray-300 text-xs capitalize">
										{brand.brand}
									</span>
									<span className="text-red-400 text-xs font-semibold">
										-${brand.revenue.toFixed(0)}
									</span>
								</div>
							))}
						</div>

						<div className="bg-gray-700/30 rounded-lg p-3">
							<h5 className="text-xs font-semibold text-red-300 mb-2">
								Lower Risk Brands
							</h5>
							{churnStats.churn1.bottomBrands.map((brand, index) => (
								<div
									key={index}
									className="flex justify-between items-center py-1"
								>
									<span className="text-gray-300 text-xs capitalize">
										{brand.brand}
									</span>
									<span className="text-orange-400 text-xs font-semibold">
										-${brand.revenue.toFixed(0)}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Summary Insights */}
				<div className="bg-gray-700/20 rounded-lg p-4 border border-gray-600/30">
					<h5 className="text-sm font-semibold text-blue-400 mb-3">
						📊 Key Insights
					</h5>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
						<div className="text-center">
							<p className="text-gray-400">Revenue Loss</p>
							<p className="font-bold text-red-400 text-sm">
								$
								{(
									churnStats.churn1.avgRevenue * churnStats.churn1.count -
									churnStats.churn0.avgRevenue * churnStats.churn0.count
								).toFixed(0)}
							</p>
						</div>
						<div className="text-center">
							<p className="text-gray-400">CLTV Difference</p>
							<p className="font-bold text-yellow-400 text-sm">
								$
								{(
									churnStats.churn0.avgCltv - churnStats.churn1.avgCltv
								).toFixed(0)}
							</p>
						</div>
						<div className="text-center">
							<p className="text-gray-400">Retention Rate</p>
							<p className="font-bold text-green-400 text-sm">
								{((churnStats.churn0.count / customers.length) * 100).toFixed(
									1
								)}
								%
							</p>
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
};
