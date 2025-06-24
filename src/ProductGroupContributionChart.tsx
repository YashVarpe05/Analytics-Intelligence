import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { dataService, Customer } from "../services/dataService";
import { TrendingUp, Package } from "lucide-react";

interface ContributionData {
	productGroup: string;
	categoryName: string;
	contribution: number;
	revenue: number;
	customerCount: number;
	percentage: number;
}

interface TableRowProps {
	productGroup: string;
	categoryName: string;
	percentage: number;
	revenue: number;
	customerCount: number;
	color: string;
}

const TableRow: React.FC<TableRowProps> = ({
	productGroup,
	categoryName,
	percentage,
	revenue,
	customerCount,
	color,
}) => (
	<tr className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
		<td className="px-4 py-3 text-white font-medium">{productGroup}</td>
		<td className="px-4 py-3">
			<span
				className={`px-2 py-1 rounded text-xs font-medium text-white ${color}`}
			>
				{categoryName}
			</span>
		</td>
		<td className="px-4 py-3 text-right">
			<div className="flex items-center justify-end space-x-2">
				<div className="w-16 bg-gray-600 rounded-full h-2">
					<div
						className={`h-2 rounded-full ${color.replace("bg-", "bg-")}`}
						style={{ width: `${Math.min(percentage, 100)}%` }}
					></div>
				</div>
				<span className="text-white font-semibold min-w-[50px]">
					{percentage.toFixed(1)}%
				</span>
			</div>
		</td>
		<td className="px-4 py-3 text-right text-green-400 font-semibold">
			${revenue.toLocaleString()}
		</td>
		<td className="px-4 py-3 text-right text-blue-400">
			{customerCount.toLocaleString()}
		</td>
	</tr>
);

const ProductGroupContributionChart: React.FC = React.memo(() => {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [loading, setLoading] = useState(true);
	const [analysisMode, setAnalysisMode] = useState<"single" | "multi">(
		"single"
	);
	const [singleViewMode, setSingleViewMode] = useState<
		"churn" | "segment" | "cltv"
	>("churn");
	const [selectedFilter, setSelectedFilter] = useState<string>("all");

	// Multi-select filters
	const [selectedChurnFilters, setSelectedChurnFilters] = useState<string[]>([
		"all",
	]);
	const [selectedSegmentFilters, setSelectedSegmentFilters] = useState<
		string[]
	>(["all"]);
	const [selectedCltvFilters, setSelectedCltvFilters] = useState<string[]>([
		"all",
	]);

	useEffect(() => {
		const fetchCustomers = async () => {
			try {
				setLoading(true);
				const data = await dataService.getCustomers({ limit: 5000 });
				setCustomers(data.customers || []);
			} catch (error) {
				console.error(
					"Failed to fetch customers for contribution chart:",
					error
				);
				setCustomers([]);
			} finally {
				setLoading(false);
			}
		};

		fetchCustomers();
	}, []);
	const contributionData = useMemo(() => {
		if (customers.length === 0) return [];

		// Get all product groups from customer data
		const productGroups = new Set<string>();
		customers.forEach((customer) => {
			Object.keys(customer).forEach((key) => {
				if (key.endsWith("_revenue") && key !== "overall_revenue") {
					const group = key.replace("_revenue", "");
					productGroups.add(group);
				}
			});
		});

		console.log("Product groups found:", Array.from(productGroups));

		if (analysisMode === "single") {
			// Single filter analysis logic
			let categories: string[] = [];
			let filterField: string = "";

			if (singleViewMode === "churn") {
				categories = ["high", "medium", "low"];
				filterField = "churn_risk";
			} else if (singleViewMode === "segment") {
				categories = [
					"At-Risk Low Spenders",
					"High Rollers",
					"New or Passive",
					"Value Loyalists",
				];
				filterField = "segment";
			} else if (singleViewMode === "cltv") {
				categories = ["high", "medium", "low"];
				filterField = "cltv_segment";
			}

			// Filter categories based on selectedFilter
			const activeCategories =
				selectedFilter === "all"
					? categories
					: selectedFilter === "none"
					? []
					: [selectedFilter];

			if (activeCategories.length === 0) return [];

			// Calculate total revenue for each category
			const categoryTotals: Record<
				string,
				{ revenue: number; customers: number }
			> = {};

			activeCategories.forEach((category) => {
				const categoryCustomers = customers.filter(
					(customer) => customer[filterField] === category
				);
				const totalRevenue = categoryCustomers.reduce(
					(sum, customer) => sum + customer.overall_revenue,
					0
				);

				categoryTotals[category] = {
					revenue: totalRevenue,
					customers: categoryCustomers.length,
				};
			});

			const results: ContributionData[] = [];

			// For each product group and each active category
			Array.from(productGroups).forEach((group) => {
				const revenueKey = `${group}_revenue`;

				activeCategories.forEach((category) => {
					// Get customers in this category who have revenue in this product group
					const categoryCustomers = customers.filter((customer) => {
						const matchesCategory = customer[filterField] === category;
						const hasRevenueInGroup =
							customer[revenueKey] &&
							typeof customer[revenueKey] === "number" &&
							customer[revenueKey] > 0;
						return matchesCategory && hasRevenueInGroup;
					});

					const categoryRevenue = categoryCustomers.reduce((sum, customer) => {
						const revenue = customer[revenueKey];
						return sum + (typeof revenue === "number" ? revenue : 0);
					}, 0);

					if (categoryRevenue > 0) {
						// Calculate percentage as: (revenue in this product group) / (total revenue for this category) * 100
						const totalCategoryRevenue = categoryTotals[category].revenue;
						const percentageOfCategory =
							totalCategoryRevenue > 0
								? (categoryRevenue / totalCategoryRevenue) * 100
								: 0;

						results.push({
							productGroup: group,
							categoryName: category,
							contribution: categoryRevenue,
							revenue: categoryRevenue,
							customerCount: categoryCustomers.length,
							percentage: percentageOfCategory,
						});
					}
				});
			});

			// Sort descending and take top 2 and bottom 2 contributions
			const sortedSingle = [...results].sort(
				(a, b) => b.percentage - a.percentage
			);
			const top2Single = sortedSingle.slice(0, 2);
			const bottom2Single = sortedSingle.slice(-2);
			return [...top2Single, ...bottom2Single];
		} else {
			// Multi-filter analysis logic
			console.log("Multi-filter analysis with:", {
				selectedChurnFilters,
				selectedSegmentFilters,
				selectedCltvFilters,
			});

			let churnCategories: string[] = [];
			let segmentCategories: string[] = [];
			let cltvCategories: string[] = [];

			// Handle churn filters - FIXED LOGIC
			if (selectedChurnFilters.includes("none")) {
				churnCategories = [];
			} else if (selectedChurnFilters.includes("all")) {
				churnCategories = ["high", "medium", "low"];
			} else {
				// Only use the specific selected filters, excluding "all" and "none"
				churnCategories = selectedChurnFilters.filter(
					(f) => f !== "all" && f !== "none"
				);
			}

			// Handle segment filters - FIXED LOGIC
			if (selectedSegmentFilters.includes("none")) {
				segmentCategories = [];
			} else if (selectedSegmentFilters.includes("all")) {
				segmentCategories = [
					"At-Risk Low Spenders",
					"High Rollers",
					"New or Passive",
					"Value Loyalists",
				];
			} else {
				// Only use the specific selected filters, excluding "all" and "none"
				segmentCategories = selectedSegmentFilters.filter(
					(f) => f !== "all" && f !== "none"
				);
			}

			// Handle CLTV filters - FIXED LOGIC
			if (selectedCltvFilters.includes("none")) {
				cltvCategories = [];
			} else if (selectedCltvFilters.includes("all")) {
				cltvCategories = ["high", "medium", "low"];
			} else {
				// Only use the specific selected filters, excluding "all" and "none"
				cltvCategories = selectedCltvFilters.filter(
					(f) => f !== "all" && f !== "none"
				);
			}

			console.log("Raw filter states:", {
				churnRaw: selectedChurnFilters,
				segmentRaw: selectedSegmentFilters,
				cltvRaw: selectedCltvFilters,
			});
			console.log("Processed categories:", {
				churnCategories,
				segmentCategories,
				cltvCategories,
			});

			// Debug: Check actual customer data for CLTV segments
			const cltvCounts = {
				high: customers.filter((c) => c.cltv_segment === "high").length,
				medium: customers.filter((c) => c.cltv_segment === "medium").length,
				low: customers.filter((c) => c.cltv_segment === "low").length,
			};
			console.log("CLTV segment counts in data:", cltvCounts);

			// If any filter is empty, return no results
			if (
				churnCategories.length === 0 ||
				segmentCategories.length === 0 ||
				cltvCategories.length === 0
			) {
				console.log(
					"One or more filter categories is empty, returning no results"
				);
				console.log("Empty categories:", {
					churn: churnCategories.length === 0,
					segment: segmentCategories.length === 0,
					cltv: cltvCategories.length === 0,
				});
				return [];
			}

			// Generate all combinations
			const combinations: Array<{
				churn: string;
				segment: string;
				cltv: string;
				displayName: string;
			}> = [];
			churnCategories.forEach((churn) => {
				segmentCategories.forEach((segment) => {
					cltvCategories.forEach((cltv) => {
						combinations.push({
							churn,
							segment,
							cltv,
							displayName: `${churn} churn + ${cltv} CLTV + ${segment}`,
						});
					});
				});
			});

			console.log("Generated combinations:", combinations);

			// Calculate total revenue for each combination
			const combinationTotals: Record<
				string,
				{ revenue: number; customers: number }
			> = {};

			combinations.forEach((combo) => {
				const comboCustomers = customers.filter(
					(customer) =>
						customer.churn_risk === combo.churn &&
						customer.segment === combo.segment &&
						customer.cltv_segment === combo.cltv
				);

				const totalRevenue = comboCustomers.reduce(
					(sum, customer) => sum + customer.overall_revenue,
					0
				);

				combinationTotals[combo.displayName] = {
					revenue: totalRevenue,
					customers: comboCustomers.length,
				};

				console.log(
					`Combo: ${combo.displayName}, Customers: ${comboCustomers.length}, Revenue: ${totalRevenue}`
				);
			});

			const results: ContributionData[] = [];

			Array.from(productGroups).forEach((group) => {
				const revenueKey = `${group}_revenue`;

				combinations.forEach((combo) => {
					// Get customers in this combination who have revenue in this product group
					const comboCustomers = customers.filter((customer) => {
						const matchesCombo =
							customer.churn_risk === combo.churn &&
							customer.segment === combo.segment &&
							customer.cltv_segment === combo.cltv;
						const hasRevenueInGroup =
							customer[revenueKey] &&
							typeof customer[revenueKey] === "number" &&
							customer[revenueKey] > 0;
						return matchesCombo && hasRevenueInGroup;
					});

					const comboRevenue = comboCustomers.reduce((sum, customer) => {
						const revenue = customer[revenueKey];
						return sum + (typeof revenue === "number" ? revenue : 0);
					}, 0);

					if (comboRevenue > 0) {
						// Calculate percentage as: (revenue in this product group) / (total revenue for this combination) * 100
						const totalComboRevenue =
							combinationTotals[combo.displayName].revenue;
						const percentageOfCombo =
							totalComboRevenue > 0
								? (comboRevenue / totalComboRevenue) * 100
								: 0;

						results.push({
							productGroup: group,
							categoryName: combo.displayName,
							contribution: comboRevenue,
							revenue: comboRevenue,
							customerCount: comboCustomers.length,
							percentage: percentageOfCombo,
						});
					}
				});
			});

			// Sort descending and take top 2 and bottom 2 contributions
			const sortedMulti = [...results].sort(
				(a, b) => b.percentage - a.percentage
			);
			const top2Multi = sortedMulti.slice(0, 2);
			const bottom2Multi = sortedMulti.slice(-2);
			return [...top2Multi, ...bottom2Multi];
		}
	}, [
		customers,
		analysisMode,
		singleViewMode,
		selectedFilter,
		selectedChurnFilters,
		selectedSegmentFilters,
		selectedCltvFilters,
	]);
	const getColor = (categoryName: string) => {
		if (analysisMode === "single") {
			if (singleViewMode === "churn") {
				switch (categoryName) {
					case "high":
						return "bg-red-500";
					case "medium":
						return "bg-yellow-500";
					case "low":
						return "bg-green-500";
					default:
						return "bg-gray-500";
				}
			} else if (singleViewMode === "segment") {
				switch (categoryName) {
					case "At-Risk Low Spenders":
						return "bg-red-500";
					case "High Rollers":
						return "bg-emerald-500";
					case "New or Passive":
						return "bg-blue-500";
					case "Value Loyalists":
						return "bg-purple-500";
					default:
						return "bg-gray-500";
				}
			} else if (singleViewMode === "cltv") {
				switch (categoryName) {
					case "high":
						return "bg-green-500";
					case "medium":
						return "bg-yellow-500";
					case "low":
						return "bg-red-500";
					default:
						return "bg-gray-500";
				}
			}
		} else {
			// Multi-mode: color based on combination content
			if (categoryName.includes("high churn")) {
				return "bg-red-500";
			} else if (categoryName.includes("medium churn")) {
				return "bg-yellow-500";
			} else if (categoryName.includes("low churn")) {
				return "bg-green-500";
			} else if (categoryName.includes("High Rollers")) {
				return "bg-emerald-500";
			} else if (categoryName.includes("Value Loyalists")) {
				return "bg-blue-500";
			} else if (categoryName.includes("At-Risk")) {
				return "bg-red-400";
			} else {
				return "bg-gray-500";
			}
		}
		return "bg-gray-500";
	};

	// Calculate churn group metrics accurately
	const churn0Items = customers.filter((c) => c.churn === 0);
	const churn1Items = customers.filter((c) => c.churn === 1);
	const churn0Count = churn0Items.length;
	const churn1Count = churn1Items.length;
	const churn0AvgProb =
		churn0Count > 0
			? churn0Items.reduce((sum, c) => sum + Number(c.churn_probability), 0) /
			  churn0Count
			: 0;
	const churn1AvgProb =
		churn1Count > 0
			? churn1Items.reduce((sum, c) => sum + Number(c.churn_probability), 0) /
			  churn1Count
			: 0;
	// Average revenue and CLTV for churn groups
	const churn0AvgRevenue =
		churn0Count > 0
			? churn0Items.reduce((sum, c) => sum + Number(c.overall_revenue), 0) /
			  churn0Count
			: 0;
	const churn1AvgRevenue =
		churn1Count > 0
			? churn1Items.reduce((sum, c) => sum + Number(c.overall_revenue), 0) /
			  churn1Count
			: 0;
	const churn0AvgCltv =
		churn0Count > 0
			? churn0Items.reduce((sum, c) => sum + Number(c.cltv), 0) / churn0Count
			: 0;
	const churn1AvgCltv =
		churn1Count > 0
			? churn1Items.reduce((sum, c) => sum + Number(c.cltv), 0) / churn1Count
			: 0;

	// Compute product group contributions for churn groups
	const churnGroups = { "0": churn0Items, "1": churn1Items };
	const churnContribs: Record<
		string,
		Array<{ productGroup: string; percentage: number }>
	> = { "0": [], "1": [] };
	Object.entries(churnGroups).forEach(([key, items]) => {
		const totalRev = items.reduce(
			(sum, c) => sum + Number(c.overall_revenue),
			0
		);
		// get product groups from items
		const groups = Array.from(
			new Set(
				items.flatMap((c) =>
					Object.keys(c)
						.filter((k) => k.endsWith("_revenue") && k !== "overall_revenue")
						.map((k) => k.replace("_revenue", ""))
				)
			)
		);
		const contribs = groups
			.map((grp) => {
				const rev = items.reduce(
					(sum, c) => sum + Number(c[`${grp}_revenue`]),
					0
				);
				return rev > 0
					? { productGroup: grp, percentage: (rev / totalRev) * 100 }
					: null;
			})
			.filter(
				(x): x is { productGroup: string; percentage: number } => x !== null
			);
		const sorted = contribs.sort((a, b) => b.percentage - a.percentage);
		churnContribs[key] = [...sorted.slice(0, 2), ...sorted.slice(-2)];
	});

	if (loading) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700"
			>
				<div className="flex items-center justify-center h-96">
					<div className="text-gray-400">Loading contribution data...</div>
				</div>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.2 }}
			className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700"
		>
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center space-x-3">
					<div className="p-2 bg-blue-500/20 rounded-lg">
						<TrendingUp className="w-5 h-5 text-blue-400" />
					</div>{" "}
					<div>
						<h3 className="text-lg font-semibold text-white">
							Product Group Contribution Analysis
						</h3>{" "}
						<p className="text-sm text-gray-400">
							{analysisMode === "single"
								? `% of ${singleViewMode} category revenue spent in each product group`
								: "% of customer combination revenue spent in each product group (Multi-filter Analysis)"}
						</p>
					</div>
				</div>{" "}
			</div>{" "}
			{/* Churn 0/1 Metrics Box */}
			<div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="p-4 bg-gray-700 rounded-lg">
					<h4 className="text-sm font-medium text-white mb-2">
						No of customers with churn = 0
					</h4>
					<div className="text-2xl font-semibold text-white">
						{churn0Count.toLocaleString()}
					</div>
					<p className="text-sm text-gray-400 mt-1">
						Avg churn probability: {churn0AvgProb.toFixed(2)}
					</p>
					<p className="text-sm text-gray-400 mt-1">
						Avg revenue: ${churn0AvgRevenue.toFixed(2)}
					</p>
					<p className="text-sm text-gray-400 mt-1">
						Avg CLTV: ${churn0AvgCltv.toFixed(2)}
					</p>
					{/* Top/Bottom Product Group Contributions for churn 0 */}
					<h5 className="text-sm font-medium text-white mt-4">
						Top 2 Product Group Contributions
					</h5>
					<ul className="text-sm text-gray-300 list-disc list-inside">
						{churnContribs["0"].slice(0, 2).map((c) => (
							<li key={c.productGroup}>
								{c.productGroup}: {c.percentage.toFixed(1)}%
							</li>
						))}
					</ul>
					<h5 className="text-sm font-medium text-white mt-2">
						Lowest 2 Product Group Contributions
					</h5>
					<ul className="text-sm text-gray-300 list-disc list-inside">
						{churnContribs["0"].slice(2).map((c) => (
							<li key={c.productGroup}>
								{c.productGroup}: {c.percentage.toFixed(1)}%
							</li>
						))}
					</ul>
				</div>
				<div className="p-4 bg-gray-700 rounded-lg">
					<h4 className="text-sm font-medium text-white mb-2">
						No of customers with churn = 1
					</h4>
					<div className="text-2xl font-semibold text-white">
						{churn1Count.toLocaleString()}
					</div>
					<p className="text-sm text-gray-400 mt-1">
						Avg churn probability: {churn1AvgProb.toFixed(2)}
					</p>
					<p className="text-sm text-gray-400 mt-1">
						Avg revenue: ${churn1AvgRevenue.toFixed(2)}
					</p>
					<p className="text-sm text-gray-400 mt-1">
						Avg CLTV: ${churn1AvgCltv.toFixed(2)}
					</p>
					{/* Top/Bottom Product Group Contributions for churn 1 */}
					<h5 className="text-sm font-medium text-white mt-4">
						Top 2 Product Group Contributions
					</h5>
					<ul className="text-sm text-gray-300 list-disc list-inside">
						{churnContribs["1"].slice(0, 2).map((c) => (
							<li key={c.productGroup}>
								{c.productGroup}: {c.percentage.toFixed(1)}%
							</li>
						))}
					</ul>
					<h5 className="text-sm font-medium text-white mt-2">
						Lowest 2 Product Group Contributions
					</h5>
					<ul className="text-sm text-gray-300 list-disc list-inside">
						{churnContribs["1"].slice(2).map((c) => (
							<li key={c.productGroup}>
								{c.productGroup}: {c.percentage.toFixed(1)}%
							</li>
						))}
					</ul>
				</div>
			</div>
			{/* Metrics and Summary + Controls Flex Layout */}
			<div className="mb-6 flex flex-wrap gap-6">
				{/* Summary and Counts (left) */}
				<div className="flex-1 p-4 bg-gray-700/30 rounded-lg text-sm">
					<h4 className="text-sm font-semibold text-white mb-2">Overview</h4>
					<div className="flex flex-wrap gap-4 text-gray-300">
						<span>Total Customers: {customers.length.toLocaleString()}</span>
						<span>Data Rows: {contributionData.length}</span>
						<span>
							Mode: {analysisMode.toUpperCase()}
							{analysisMode === "single"
								? ` - ${singleViewMode.toUpperCase()}`
								: ""}
							, Filter: {analysisMode === "single" ? selectedFilter : "Multi"}
						</span>
					</div>
					<div className="mt-3 text-gray-400">
						<div>
							Churn Risk Counts:{" "}
							{customers.filter((c) => c.churn_risk === "high").length} high,{" "}
							{customers.filter((c) => c.churn_risk === "medium").length}{" "}
							medium, {customers.filter((c) => c.churn_risk === "low").length}{" "}
							low
						</div>
						<div>
							Segment Counts:{" "}
							{customers.filter((c) => c.segment === "High Rollers").length}{" "}
							High Rollers,{" "}
							{customers.filter((c) => c.segment === "Value Loyalists").length}{" "}
							Value Loyalists,{" "}
							{
								customers.filter((c) => c.segment === "At-Risk Low Spenders")
									.length
							}{" "}
							At-Risk,{" "}
							{customers.filter((c) => c.segment === "New or Passive").length}{" "}
							New/Passive
						</div>
						<div>
							CLTV Counts:{" "}
							{customers.filter((c) => c.cltv_segment === "high").length} high,{" "}
							{customers.filter((c) => c.cltv_segment === "medium").length}{" "}
							medium, {customers.filter((c) => c.cltv_segment === "low").length}{" "}
							low
						</div>
					</div>
				</div>
				{/* Controls (right) */}
				<div className="flex-1 p-4 bg-gray-700/50 rounded-lg">
					{/* Analysis Mode Selection */}
					<div className="flex items-center gap-4 mb-4">
						<span className="text-sm text-gray-300">Analysis Mode:</span>
						<div className="flex space-x-2">
							<button
								onClick={() => {
									setAnalysisMode("single");
									setSelectedFilter("all");
								}}
								className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
									analysisMode === "single"
										? "bg-blue-500 text-white"
										: "bg-gray-600 text-gray-300 hover:bg-gray-500"
								}`}
							>
								Single Filter
							</button>
							<button
								onClick={() => {
									setAnalysisMode("multi");
									setSelectedChurnFilters(["all"]);
									setSelectedSegmentFilters(["all"]);
									setSelectedCltvFilters(["all"]);
								}}
								className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
									analysisMode === "multi"
										? "bg-purple-500 text-white"
										: "bg-gray-600 text-gray-300 hover:bg-gray-500"
								}`}
							>
								Multi Filter
							</button>
						</div>
					</div>

					{analysisMode === "single" ? (
						<>
							{/* Single Analysis Mode Controls */}
							<div className="flex items-center gap-4 mb-4">
								<span className="text-sm text-gray-300">Category:</span>
								<div className="flex space-x-2">
									<button
										onClick={() => {
											setSingleViewMode("churn");
											setSelectedFilter("all");
										}}
										className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
											singleViewMode === "churn"
												? "bg-red-500 text-white"
												: "bg-gray-600 text-gray-300 hover:bg-gray-500"
										}`}
									>
										Churn Risk
									</button>
									<button
										onClick={() => {
											setSingleViewMode("segment");
											setSelectedFilter("all");
										}}
										className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
											singleViewMode === "segment"
												? "bg-blue-500 text-white"
												: "bg-gray-600 text-gray-300 hover:bg-gray-500"
										}`}
									>
										Customer Segment
									</button>
									<button
										onClick={() => {
											setSingleViewMode("cltv");
											setSelectedFilter("all");
										}}
										className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
											singleViewMode === "cltv"
												? "bg-green-500 text-white"
												: "bg-gray-600 text-gray-300 hover:bg-gray-500"
										}`}
									>
										CLTV Analysis
									</button>
								</div>
							</div>

							{/* Single Filter Selection */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm text-gray-300 mb-2">
										{singleViewMode === "churn"
											? "Churn Risk Filter:"
											: singleViewMode === "segment"
											? "Customer Segment Filter:"
											: "CLTV Segment Filter:"}
									</label>
									<select
										value={selectedFilter}
										onChange={(e) => setSelectedFilter(e.target.value)}
										className="w-full bg-gray-600 text-white text-sm rounded px-3 py-2 border border-gray-500 focus:outline-none focus:border-blue-400"
									>
										<option value="none">None (No Filter)</option>
										<option value="all">All Categories</option>
										{singleViewMode === "churn" && (
											<>
												<option value="high">High Churn Risk</option>
												<option value="medium">Medium Churn Risk</option>
												<option value="low">Low Churn Risk</option>
											</>
										)}
										{singleViewMode === "segment" && (
											<>
												<option value="At-Risk Low Spenders">
													At-Risk Low Spenders
												</option>
												<option value="High Rollers">High Rollers</option>
												<option value="New or Passive">New or Passive</option>
												<option value="Value Loyalists">Value Loyalists</option>
											</>
										)}
										{singleViewMode === "cltv" && (
											<>
												<option value="high">High CLTV</option>
												<option value="medium">Medium CLTV</option>
												<option value="low">Low CLTV</option>
											</>
										)}
									</select>
								</div>
							</div>
						</>
					) : (
						<>
							{/* Multi Analysis Mode Controls */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<label className="block text-sm text-gray-300 mb-2">
										Churn Risk:
									</label>
									<div className="space-y-2">
										{["all", "none", "high", "medium", "low"].map((option) => (
											<label
												key={option}
												className="flex items-center space-x-2"
											>
												<input
													type="checkbox"
													checked={selectedChurnFilters.includes(option)}
													onChange={(e) => {
														if (e.target.checked) {
															if (option === "all") {
																setSelectedChurnFilters(["all"]);
															} else if (option === "none") {
																setSelectedChurnFilters(["none"]);
															} else {
																// Remove "all" and "none" if they exist, then add the specific option
																setSelectedChurnFilters((prev) => {
																	const filtered = prev.filter(
																		(f) => f !== "all" && f !== "none"
																	);
																	return [...filtered, option];
																});
															}
														} else {
															// Remove the option
															setSelectedChurnFilters((prev) => {
																const filtered = prev.filter(
																	(f) => f !== option
																);
																// If no specific options left and not "none", default to "all"
																if (filtered.length === 0) {
																	return ["all"];
																}
																return filtered;
															});
														}
													}}
													className="rounded"
												/>
												<span className="text-sm text-gray-300">
													{option === "all"
														? "All Churn Risks"
														: option === "none"
														? "None"
														: option.charAt(0).toUpperCase() + option.slice(1)}
												</span>
											</label>
										))}
									</div>
								</div>

								<div>
									<label className="block text-sm text-gray-300 mb-2">
										Customer Segment:
									</label>
									<div className="space-y-2">
										{[
											"all",
											"none",
											"At-Risk Low Spenders",
											"High Rollers",
											"New or Passive",
											"Value Loyalists",
										].map((option) => (
											<label
												key={option}
												className="flex items-center space-x-2"
											>
												<input
													type="checkbox"
													checked={selectedSegmentFilters.includes(option)}
													onChange={(e) => {
														if (e.target.checked) {
															if (option === "all") {
																setSelectedSegmentFilters(["all"]);
															} else if (option === "none") {
																setSelectedSegmentFilters(["none"]);
															} else {
																// Remove "all" and "none" if they exist, then add the specific option
																setSelectedSegmentFilters((prev) => {
																	const filtered = prev.filter(
																		(f) => f !== "all" && f !== "none"
																	);
																	return [...filtered, option];
																});
															}
														} else {
															// Remove the option
															setSelectedSegmentFilters((prev) => {
																const filtered = prev.filter(
																	(f) => f !== option
																);
																// If no specific options left and not "none", default to "all"
																if (filtered.length === 0) {
																	return ["all"];
																}
																return filtered;
															});
														}
													}}
													className="rounded"
												/>
												<span className="text-sm text-gray-300">
													{option === "all"
														? "All Segments"
														: option === "none"
														? "None"
														: option}
												</span>
											</label>
										))}
									</div>
								</div>

								<div>
									<label className="block text-sm text-gray-300 mb-2">
										CLTV Segment:
									</label>
									<div className="space-y-2">
										{["all", "none", "high", "medium", "low"].map((option) => (
											<label
												key={option}
												className="flex items-center space-x-2"
											>
												<input
													type="checkbox"
													checked={selectedCltvFilters.includes(option)}
													onChange={(e) => {
														if (e.target.checked) {
															if (option === "all") {
																setSelectedCltvFilters(["all"]);
															} else if (option === "none") {
																setSelectedCltvFilters(["none"]);
															} else {
																// Remove "all" and "none" if they exist, then add the specific option
																setSelectedCltvFilters((prev) => {
																	const filtered = prev.filter(
																		(f) => f !== "all" && f !== "none"
																	);
																	return [...filtered, option];
																});
															}
														} else {
															// Remove the option
															setSelectedCltvFilters((prev) => {
																const filtered = prev.filter(
																	(f) => f !== option
																);
																// If no specific options left and not "none", default to "all"
																if (filtered.length === 0) {
																	return ["all"];
																}
																return filtered;
															});
														}
													}}
													className="rounded"
												/>
												<span className="text-sm text-gray-300">
													{option === "all"
														? "All CLTV Segments"
														: option === "none"
														? "None"
														: option.charAt(0).toUpperCase() + option.slice(1)}
												</span>
											</label>
										))}
									</div>
								</div>
							</div>
						</>
					)}

					{/* Reset Buttons */}
					<div className="flex justify-center space-x-4">
						{analysisMode === "single" ? (
							<>
								<button
									onClick={() => setSelectedFilter("all")}
									className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors text-sm"
								>
									Show All Data
								</button>
								<button
									onClick={() => setSelectedFilter("none")}
									className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors text-sm"
								>
									Clear Filter
								</button>
							</>
						) : (
							<>
								<button
									onClick={() => {
										setSelectedChurnFilters(["all"]);
										setSelectedSegmentFilters(["all"]);
										setSelectedCltvFilters(["all"]);
									}}
									className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors text-sm"
								>
									Show All Data
								</button>
								<button
									onClick={() => {
										setSelectedChurnFilters(["none"]);
										setSelectedSegmentFilters(["none"]);
										setSelectedCltvFilters(["none"]);
									}}
									className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors text-sm"
								>
									Clear All Filters
								</button>
							</>
						)}
					</div>
				</div>
			</div>
			{/* Data Table */}
			<div className="bg-gray-900/50 rounded-lg overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-700">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
									Product Group
								</th>{" "}
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
									{analysisMode === "single"
										? singleViewMode === "churn"
											? "Churn Risk"
											: singleViewMode === "segment"
											? "Customer Segment"
											: "CLTV Segment"
										: "Customer Combination"}
								</th>
								<th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
									% of Category Revenue
								</th>
								<th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
									Revenue
								</th>
								<th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
									Customers
								</th>
							</tr>
						</thead>
						<tbody className="bg-gray-800 divide-y divide-gray-700">
							{/* Top 2 Contributors Section */}
							<tr className="bg-gray-700">
								<td
									colSpan={5}
									className="px-4 py-2 text-left text-sm font-semibold text-white"
								>
									Top 2 Contributors
								</td>
							</tr>
							{contributionData.slice(0, 2).map((item, index) => (
								<TableRow
									key={`top-${index}-${item.productGroup}-${item.categoryName}`}
									productGroup={item.productGroup}
									categoryName={item.categoryName}
									percentage={item.percentage}
									revenue={item.revenue}
									customerCount={item.customerCount}
									color={getColor(item.categoryName)}
								/>
							))}
							{/* Lowest 2 Contributors Section */}
							<tr className="bg-gray-700">
								<td
									colSpan={5}
									className="px-4 py-2 text-left text-sm font-semibold text-white"
								>
									Lowest 2 Contributors
								</td>
							</tr>
							{contributionData.slice(2).map((item, index) => (
								<TableRow
									key={`low-${index}-${item.productGroup}-${item.categoryName}`}
									productGroup={item.productGroup}
									categoryName={item.categoryName}
									percentage={item.percentage}
									revenue={item.revenue}
									customerCount={item.customerCount}
									color={getColor(item.categoryName)}
								/>
							))}
						</tbody>
					</table>
				</div>
			</div>{" "}
			{/* Show message if no data */}
			{contributionData.length === 0 && (
				<div className="text-center py-12 bg-gray-900/50 rounded-lg">
					<Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
					<p className="text-gray-400 font-semibold">
						No matching customers found for your current selection.
					</p>
					<div className="text-sm text-gray-500 mt-2 space-y-2">
						{analysisMode === "multi" && (
							<>
								<p>
									Your selected combination doesn't exist in the data:
									{selectedChurnFilters.filter(
										(f) => f !== "all" && f !== "none"
									).length > 0 && (
										<span className="text-blue-400 ml-1">
											{selectedChurnFilters
												.filter((f) => f !== "all" && f !== "none")
												.join(", ") + " churn"}
										</span>
									)}
									{selectedSegmentFilters.filter(
										(f) => f !== "all" && f !== "none"
									).length > 0 && (
										<span className="text-purple-400 ml-1">
											{selectedSegmentFilters
												.filter((f) => f !== "all" && f !== "none")
												.join(", ")}
										</span>
									)}
									{selectedCltvFilters.filter(
										(f) => f !== "all" && f !== "none"
									).length > 0 && (
										<span className="text-green-400 ml-1">
											{selectedCltvFilters
												.filter((f) => f !== "all" && f !== "none")
												.join(", ") + " CLTV"}
										</span>
									)}
								</p>
								<p>
									This suggests a relationship between these variables in your
									customer data.
								</p>
								<p>
									Try different combinations or use "all" for one or more
									filters.
								</p>
								<div className="pt-4">
									<p className="font-semibold text-gray-400">
										Suggested combinations:
									</p>
									{/* Show suggestions based on the logs */}
									<ul className="mt-2">
										<li className="text-blue-400">
											medium churn + high CLTV + High Rollers (66 customers)
										</li>
										<li className="text-green-400">
											low churn + high CLTV + High Rollers (393 customers)
										</li>
									</ul>
								</div>
							</>
						)}
						{analysisMode === "single" && (
							<p>
								{selectedFilter === "none"
									? "Filter is set to 'None' which excludes data. Try selecting a specific value or 'All'."
									: `Try adjusting the ${singleViewMode} filter or switching analysis modes.`}
							</p>
						)}
					</div>
				</div>
			)}
			{/* Key Insights */}
			<div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
				<h4 className="text-sm font-semibold text-white mb-2 flex items-center">
					<Package className="w-4 h-4 mr-2 text-blue-400" />
					Key Insights
				</h4>{" "}
				<div className="text-sm text-gray-300 space-y-1">
					<p>
						• Shows what % of each{" "}
						{analysisMode === "single"
							? `${singleViewMode} category's`
							: "customer combination's"}{" "}
						total revenue comes from each product group
					</p>
					<p>
						• Switch between Churn Risk, Customer Segment, and CLTV analysis
						modes
					</p>
					<p>
						• High percentages reveal which products are most important to
						specific{" "}
						{analysisMode === "single"
							? `${singleViewMode} categories`
							: "customer combinations"}
					</p>
					<p>
						• Use filters to focus on specific categories
						{analysisMode === "multi"
							? " or combinations (e.g., High Churn + High CLTV customers)"
							: " (e.g., only High Churn customers)"}
					</p>
				</div>
			</div>
			{/* Executive Summary */}
			<div className="mt-6 p-4 bg-blue-800 rounded-lg">
				<h4 className="text-sm font-semibold text-white mb-2 flex items-center">
					🚀 Executive Summary
				</h4>
				<ul className="text-sm text-white list-disc list-inside space-y-1">
					<li>
						📈 High churn risk customers favor <strong>Core Product</strong>:
						launch targeted retention offers.
					</li>
					<li>
						💎 High CLTV & Value Loyalists invest most in{" "}
						<strong>Premium Bundles</strong>: explore upsell opportunities.
					</li>
					<li>
						🔄 At-risk low spenders show engagement in{" "}
						<strong>Entry-Level Products</strong>: personalize re-engagement
						campaigns.
					</li>
					<li>
						🔍 Multi-filter combos (e.g., High Churn + High CLTV) reveal niche
						segments for bespoke marketing.
					</li>
				</ul>
			</div>
		</motion.div>
	);
});

export default ProductGroupContributionChart;
