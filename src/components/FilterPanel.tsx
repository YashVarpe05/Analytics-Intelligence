import React, { useState, useEffect } from "react";
import { dataService, Filters } from "../services/dataService";

interface FilterPanelProps {
	onFilterChange: (filters: {
		segment: string;
		churn_risk: string;
		cltv_segment: string;
		category: string;
	}) => void;
	className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
	onFilterChange,
	className = "",
}) => {
	const [filters, setFilters] = useState<Filters | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const [selectedSegment, setSelectedSegment] = useState<string>("all");
	const [selectedChurnRisk, setSelectedChurnRisk] = useState<string>("all");
	const [selectedCltvSegment, setSelectedCltvSegment] = useState<string>("all");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");

	useEffect(() => {
		const fetchFilters = async () => {
			try {
				setLoading(true);
				const filtersData = await dataService.getFilters();
				setFilters(filtersData);
				setError(null);
			} catch (err) {
				setError("Failed to load filters");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchFilters();
	}, []);
	useEffect(() => {
		// Only update filters when we have valid data
		if (!loading && !error) {
			onFilterChange({
				segment: selectedSegment,
				churn_risk: selectedChurnRisk,
				cltv_segment: selectedCltvSegment,
				category: selectedCategory,
			});
		}
	}, [
		selectedSegment,
		selectedChurnRisk,
		selectedCltvSegment,
		selectedCategory,
		loading,
		error,
		onFilterChange,
	]);

	if (loading) {
		return <div className="text-center p-4">Loading filters...</div>;
	}

	if (error) {
		return <div className="text-center text-red-500 p-4">{error}</div>;
	}

	return (
		<div className={`bg-gray-800 p-4 rounded-lg ${className}`}>
			<h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Customer Segment Filter */}
				<div className="space-y-2">
					<label
						htmlFor="segment-filter"
						className="block text-sm font-medium text-gray-400"
					>
						Customer Segment
					</label>
					<select
						id="segment-filter"
						value={selectedSegment}
						onChange={(e) => setSelectedSegment(e.target.value)}
						className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
					>
						<option value="all">All Segments</option>
						{filters?.segments.map((segment) => (
							<option key={segment} value={segment}>
								{segment}
							</option>
						))}
					</select>
				</div>

				{/* Churn Risk Filter */}
				<div className="space-y-2">
					<label
						htmlFor="churn-risk-filter"
						className="block text-sm font-medium text-gray-400"
					>
						Churn Risk
					</label>
					<select
						id="churn-risk-filter"
						value={selectedChurnRisk}
						onChange={(e) => setSelectedChurnRisk(e.target.value)}
						className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
					>
						<option value="all">All Risk Levels</option>
						{filters?.churn_risks.map((risk) => (
							<option key={risk} value={risk}>
								{risk.charAt(0).toUpperCase() + risk.slice(1)}
							</option>
						))}
					</select>
				</div>

				{/* CLTV Segment Filter */}
				<div className="space-y-2">
					<label
						htmlFor="cltv-segment-filter"
						className="block text-sm font-medium text-gray-400"
					>
						CLTV Segment
					</label>
					<select
						id="cltv-segment-filter"
						value={selectedCltvSegment}
						onChange={(e) => setSelectedCltvSegment(e.target.value)}
						className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
					>
						<option value="all">All CLTV Segments</option>
						{filters?.cltv_segments.map((segment) => (
							<option key={segment} value={segment}>
								{segment.charAt(0).toUpperCase() + segment.slice(1)}
							</option>
						))}
					</select>
				</div>

				{/* Product Category Filter */}
				<div className="space-y-2">
					<label
						htmlFor="category-filter"
						className="block text-sm font-medium text-gray-400"
					>
						Product Category
					</label>
					<select
						id="category-filter"
						value={selectedCategory}
						onChange={(e) => setSelectedCategory(e.target.value)}
						className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
					>
						<option value="all">All Categories</option>
						{filters?.product_categories.map((category) => (
							<option key={category} value={category}>
								{category.replace("_", " ")}
							</option>
						))}
					</select>
				</div>
			</div>
		</div>
	);
};
