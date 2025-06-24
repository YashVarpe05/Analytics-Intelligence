import React, { useState, useEffect } from "react";
import {
	dataService,
	ProductGroupMetrics,
	Filters,
} from "../services/dataService";
import { motion } from "framer-motion";
import { TotalVisitsMetric } from "./TotalVisitsMetric";
import { TotalRevenueMetric } from "./TotalRevenueMetric";
import { AverageRecencyMetric } from "./AverageRecencyMetric";
import { CLTVMetrics } from "./CLTVMetrics";
import { CLTVDistribution } from "./CLTVDistribution";

export const ProductGroupOverview: React.FC = () => {
	const [selectedGroup, setSelectedGroup] = useState<string>("");
	const [groupMetrics, setGroupMetrics] = useState<ProductGroupMetrics | null>(
		null
	);
	const [filters, setFilters] = useState<Filters | null>(null);
	const [loading, setLoading] = useState(false);

	// Fetch available product categories
	useEffect(() => {
		const fetchFilters = async () => {
			try {
				const filtersData = await dataService.getFilters();
				setFilters(filtersData);
			} catch (err) {
				console.error("Failed to fetch filters:", err);
			}
		};
		fetchFilters();
	}, []);
	// Fetch metrics when selected group changes
	useEffect(() => {
		const fetchGroupMetrics = async () => {
			if (!selectedGroup) {
				// If no group selected, show default empty state
				setGroupMetrics({
					group: "",
					total_visits: 0,
					total_revenue: 0,
					total_units: 0,
					avg_recency: 0,
					total_cltv: 0,
					avg_cltv: 0,
					high_cltv_count: 0,
					medium_cltv_count: 0,
					low_cltv_count: 0,
					customer_count: 0,
				});
				return;
			}

			setLoading(true);
			try {
				const metrics = await dataService.getProductGroupMetrics(selectedGroup);
				setGroupMetrics(metrics);
			} catch (err) {
				console.error("Failed to fetch group metrics:", err);
				setGroupMetrics(null);
			} finally {
				setLoading(false);
			}
		};
		fetchGroupMetrics();
	}, [selectedGroup]);

	if (!filters) return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
		>
			<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
				<h2 className="text-xl font-semibold text-white mb-4 md:mb-0">
					📊 Product Group Overview
				</h2>

				{/* Product Group Selector */}
				<div className="w-full md:w-64">
					<label className="block text-sm text-gray-300 mb-2">
						Select Product Group
					</label>{" "}
					<select
						value={selectedGroup}
						onChange={(e) => setSelectedGroup(e.target.value)}
						className="w-full bg-gray-700 border border-gray-600 rounded-md text-white p-2"
					>
						<option value="">Select a Product Group</option>
						{filters.product_categories.map((category) => (
							<option key={category} value={category}>
								{category.replace(/_/g, " ")}
							</option>
						))}
					</select>
				</div>
			</div>{" "}
			{loading && (
				<div className="text-center py-8">
					<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
					<p className="text-gray-300 mt-2">Loading metrics...</p>
				</div>
			)}
			{!selectedGroup && !loading && (
				<div className="text-center py-8">
					<p className="text-gray-400 text-lg">
						Please select a product group to view metrics
					</p>
				</div>
			)}
			{groupMetrics && !loading && !groupMetrics.error && selectedGroup && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
					<TotalVisitsMetric metrics={groupMetrics} delay={0.1} />
					<TotalRevenueMetric metrics={groupMetrics} delay={0.2} />
					<AverageRecencyMetric metrics={groupMetrics} delay={0.3} />
					<CLTVMetrics metrics={groupMetrics} delay={0.4} />
				</div>
			)}
			{groupMetrics && !loading && !groupMetrics.error && (
				<div className="mt-6">
					<CLTVDistribution metrics={groupMetrics} delay={0.6} />
				</div>
			)}
			{groupMetrics?.error && (
				<div className="text-center py-8">
					<p className="text-red-400">Error: {groupMetrics.error}</p>
				</div>
			)}
		</motion.div>
	);
};
