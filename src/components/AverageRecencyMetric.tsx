import React from "react";
import { ProductGroupMetrics } from "../services/dataService";
import { MetricCard } from "./MetricCard";

interface AverageRecencyMetricProps {
	metrics: ProductGroupMetrics;
	delay?: number;
}

export const AverageRecencyMetric: React.FC<AverageRecencyMetricProps> = ({
	metrics,
	delay = 0,
}) => {
	return (
		<MetricCard
			title="Avg Recency"
			value={`${metrics.avg_recency} days`}
			subtitle="since last visit"
			gradient="bg-gradient-to-br from-orange-600 to-orange-700"
			icon="⏰"
			delay={delay}
		/>
	);
};
