import React from "react";
import { ProductGroupMetrics } from "../services/dataService";
import { MetricCard } from "./MetricCard";

interface TotalVisitsMetricProps {
	metrics: ProductGroupMetrics;
	delay?: number;
}

export const TotalVisitsMetric: React.FC<TotalVisitsMetricProps> = ({
	metrics,
	delay = 0,
}) => {
	const formatNumber = (value: number) => {
		return new Intl.NumberFormat("en-US").format(value);
	};

	return (
		<MetricCard
			title="Total Visits"
			value={formatNumber(metrics.total_visits)}
			subtitle={`${formatNumber(metrics.customer_count)} customers`}
			gradient="bg-gradient-to-br from-blue-600 to-blue-700"
			icon="👥"
			delay={delay}
		/>
	);
};
