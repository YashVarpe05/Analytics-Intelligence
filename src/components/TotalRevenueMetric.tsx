import React from "react";
import { ProductGroupMetrics } from "../services/dataService";
import { MetricCard } from "./MetricCard";

interface TotalRevenueMetricProps {
	metrics: ProductGroupMetrics;
	delay?: number;
}

export const TotalRevenueMetric: React.FC<TotalRevenueMetricProps> = ({
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

	const formatNumber = (value: number) => {
		return new Intl.NumberFormat("en-US").format(value);
	};

	return (
		<MetricCard
			title="Total Revenue"
			value={formatCurrency(metrics.total_revenue)}
			subtitle={`${formatNumber(metrics.total_units)} units sold`}
			gradient="bg-gradient-to-br from-green-600 to-green-700"
			icon="💰"
			delay={delay}
		/>
	);
};
