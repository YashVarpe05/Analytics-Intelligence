import React from "react";
import { ProductGroupMetrics } from "../services/dataService";
import { MetricCard } from "./MetricCard";

interface CLTVMetricsProps {
	metrics: ProductGroupMetrics;
	delay?: number;
}

export const CLTVMetrics: React.FC<CLTVMetricsProps> = ({
	metrics,
	delay = 0,
}) => {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	};

	return (
		<>
			{/* Average CLTV */}
			<MetricCard
				title="Avg CLTV"
				value={formatCurrency(metrics.avg_cltv)}
				subtitle={`Total: ${formatCurrency(metrics.total_cltv)}`}
				gradient="bg-gradient-to-br from-purple-600 to-purple-700"
				icon="📊"
				delay={delay}
			/>

			{/* Total CLTV */}
			<MetricCard
				title="Total CLTV"
				value={formatCurrency(metrics.total_cltv)}
				subtitle="lifetime value"
				gradient="bg-gradient-to-br from-indigo-600 to-indigo-700"
				icon="💎"
				delay={delay + 0.1}
			/>
		</>
	);
};
