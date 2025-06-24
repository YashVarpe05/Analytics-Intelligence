import React from "react";
import { motion } from "framer-motion";
import { Customer } from "../services/dataService";

interface InsightsRecommendationsProps {
	customers: Customer[];
}

export const InsightsRecommendations: React.FC<
	InsightsRecommendationsProps
> = ({ customers }) => {
	// Calculate key metrics for insights
	const totalCustomers = customers.length;
	const churnedCustomers = customers.filter((c) => c.churn === 1).length;
	const churnRate = ((churnedCustomers / totalCustomers) * 100).toFixed(1);
	const avgRevenue =
		customers.reduce((sum, c) => sum + c.overall_revenue, 0) / totalCustomers;
	const highValueCustomers = customers.filter(
		(c) => c.cltv_segment === "high"
	).length;
	const atRiskCustomers = customers.filter(
		(c) => c.churn_risk === "high"
	).length;

	const insights = [
		{
			icon: "🎯",
			title: "Customer Health Check",
			insight: `${churnRate}% churn rate detected`,
			recommendation: "Focus on retention strategies for at-risk segments",
			color: "from-red-500 to-pink-600",
			urgency: "HIGH",
		},
		{
			icon: "💎",
			title: "High-Value Opportunities",
			insight: `${highValueCustomers} customers in high CLTV segment`,
			recommendation: "Implement VIP programs and personalized experiences",
			color: "from-emerald-500 to-teal-600",
			urgency: "MEDIUM",
		},
		{
			icon: "⚠️",
			title: "Risk Alert",
			insight: `${atRiskCustomers} customers at high churn risk`,
			recommendation: "Deploy immediate intervention campaigns",
			color: "from-amber-500 to-orange-600",
			urgency: "HIGH",
		},
		{
			icon: "📈",
			title: "Revenue Optimization",
			insight: `$${avgRevenue.toFixed(0)} average revenue per customer`,
			recommendation: "Cross-sell and upsell to underperforming segments",
			color: "from-blue-500 to-indigo-600",
			urgency: "MEDIUM",
		},
	];

	const actionItems = [
		{
			priority: "🔥",
			action: "Launch retention campaign for high-risk customers",
			impact: "Reduce churn by 15-20%",
			timeline: "Immediate",
		},
		{
			priority: "⭐",
			action: "Create loyalty program for high CLTV segments",
			impact: "Increase customer lifetime value",
			timeline: "2-4 weeks",
		},
		{
			priority: "💡",
			action: "Optimize product mix for underperforming categories",
			impact: "Boost overall revenue by 10-15%",
			timeline: "1-2 months",
		},
		{
			priority: "🎪",
			action: "Personalize marketing for each customer segment",
			impact: "Improve engagement and conversion",
			timeline: "Ongoing",
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8 }}
			className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl"
		>
			{/* Header */}
			<div className="text-center mb-8">
				<motion.h2
					initial={{ scale: 0.9 }}
					animate={{ scale: 1 }}
					transition={{ duration: 0.5 }}
					className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-3"
				>
					🚀 Executive Dashboard Summary
				</motion.h2>
				<p className="text-gray-300 text-lg">
					Key insights and strategic recommendations based on your customer
					analytics
				</p>
			</div>

			{/* Key Insights Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				{insights.map((item, index) => (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: index * 0.1 }}
						className={`bg-gradient-to-br ${item.color} p-6 rounded-xl shadow-lg border border-gray-600 hover:scale-105 transition-transform duration-300`}
					>
						<div className="flex items-center justify-between mb-3">
							<span className="text-3xl">{item.icon}</span>
							<span
								className={`px-2 py-1 rounded-full text-xs font-bold ${
									item.urgency === "HIGH"
										? "bg-red-500/20 text-red-300"
										: "bg-yellow-500/20 text-yellow-300"
								}`}
							>
								{item.urgency}
							</span>
						</div>
						<h3 className="text-white font-semibold text-lg mb-2">
							{item.title}
						</h3>
						<p className="text-white/90 text-sm mb-3 font-medium">
							{item.insight}
						</p>
						<p className="text-white/80 text-xs">{item.recommendation}</p>
					</motion.div>
				))}
			</div>

			{/* Strategic Action Items */}
			<div className="bg-gray-800/50 rounded-xl p-6 mb-8">
				<h3 className="text-xl font-bold text-white mb-4 flex items-center">
					🎯 Strategic Action Plan
				</h3>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{actionItems.map((item, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							className="bg-gray-700/30 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-colors duration-300"
						>
							<div className="flex items-start space-x-3">
								<span className="text-2xl mt-1">{item.priority}</span>
								<div className="flex-1">
									<h4 className="text-white font-semibold mb-2">
										{item.action}
									</h4>
									<p className="text-green-400 text-sm mb-1">
										💰 Impact: {item.impact}
									</p>
									<p className="text-blue-400 text-sm">
										⏰ Timeline: {item.timeline}
									</p>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>

			{/* Bottom Summary Stats */}
			<div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/30">
				<h3 className="text-lg font-bold text-white mb-4 text-center">
					📊 Dashboard Snapshot
				</h3>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
					<div>
						<p className="text-gray-400 text-sm">Total Customers</p>
						<p className="text-white text-xl font-bold">
							{totalCustomers.toLocaleString()}
						</p>
					</div>
					<div>
						<p className="text-gray-400 text-sm">Churn Rate</p>
						<p className="text-red-400 text-xl font-bold">{churnRate}%</p>
					</div>
					<div>
						<p className="text-gray-400 text-sm">High-Value Customers</p>
						<p className="text-green-400 text-xl font-bold">
							{highValueCustomers}
						</p>
					</div>
					<div>
						<p className="text-gray-400 text-sm">At-Risk Customers</p>
						<p className="text-yellow-400 text-xl font-bold">
							{atRiskCustomers}
						</p>
					</div>
				</div>
			</div>

			{/* Call to Action */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.8 }}
				className="text-center mt-8"
			>
				<div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6">
					<h3 className="text-white text-xl font-bold mb-2">
						🎪 Ready to Take Action?
					</h3>
					<p className="text-white/90 mb-4">
						Your data tells a story. Now it's time to write the next chapter
						with strategic customer engagement.
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						<span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
							📧 Retention Campaigns
						</span>
						<span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
							🎁 Loyalty Programs
						</span>
						<span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
							🔮 Predictive Analytics
						</span>
						<span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
							💎 VIP Experiences
						</span>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
};
