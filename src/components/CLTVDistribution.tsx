import React from "react";
import { ProductGroupMetrics } from "../services/dataService";
import { motion } from "framer-motion";

interface CLTVDistributionProps {
	metrics: ProductGroupMetrics;
	delay?: number;
}

export const CLTVDistribution: React.FC<CLTVDistributionProps> = ({
	metrics,
	delay = 0,
}) => {
	const formatNumber = (value: number) => {
		return new Intl.NumberFormat("en-US").format(value);
	};

	const total =
		metrics.high_cltv_count +
		metrics.medium_cltv_count +
		metrics.low_cltv_count;
	const highPercentage =
		total > 0 ? ((metrics.high_cltv_count / total) * 100).toFixed(1) : 0;
	const mediumPercentage =
		total > 0 ? ((metrics.medium_cltv_count / total) * 100).toFixed(1) : 0;
	const lowPercentage =
		total > 0 ? ((metrics.low_cltv_count / total) * 100).toFixed(1) : 0;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay }}
			className="col-span-1 md:col-span-2 lg:col-span-3 bg-gray-700 p-4 rounded-lg shadow-lg"
		>
			<div className="flex items-center justify-between mb-4">
				<h4 className="text-white font-medium flex items-center">
					<span className="mr-2">🎯</span>
					CLTV Segment Distribution
				</h4>
				<span className="text-gray-300 text-sm">
					{formatNumber(total)} total customers
				</span>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{/* High CLTV */}
				<motion.div
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.3, delay: delay + 0.1 }}
					className="flex flex-col p-4 bg-green-600/20 rounded-lg border border-green-600/30 hover:bg-green-600/30 transition-colors duration-200"
				>
					<div className="flex items-center justify-between mb-2">
						<span className="text-green-400 font-medium flex items-center">
							<span className="mr-2">🟢</span>
							High CLTV
						</span>
						<span className="text-green-300 text-sm">{highPercentage}%</span>
					</div>
					<span className="text-white font-bold text-xl">
						{formatNumber(metrics.high_cltv_count)}
					</span>
				</motion.div>

				{/* Medium CLTV */}
				<motion.div
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.3, delay: delay + 0.2 }}
					className="flex flex-col p-4 bg-yellow-600/20 rounded-lg border border-yellow-600/30 hover:bg-yellow-600/30 transition-colors duration-200"
				>
					<div className="flex items-center justify-between mb-2">
						<span className="text-yellow-400 font-medium flex items-center">
							<span className="mr-2">🟡</span>
							Medium CLTV
						</span>
						<span className="text-yellow-300 text-sm">{mediumPercentage}%</span>
					</div>
					<span className="text-white font-bold text-xl">
						{formatNumber(metrics.medium_cltv_count)}
					</span>
				</motion.div>

				{/* Low CLTV */}
				<motion.div
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.3, delay: delay + 0.3 }}
					className="flex flex-col p-4 bg-red-600/20 rounded-lg border border-red-600/30 hover:bg-red-600/30 transition-colors duration-200"
				>
					<div className="flex items-center justify-between mb-2">
						<span className="text-red-400 font-medium flex items-center">
							<span className="mr-2">🔴</span>
							Low CLTV
						</span>
						<span className="text-red-300 text-sm">{lowPercentage}%</span>
					</div>
					<span className="text-white font-bold text-xl">
						{formatNumber(metrics.low_cltv_count)}
					</span>
				</motion.div>
			</div>
		</motion.div>
	);
};
