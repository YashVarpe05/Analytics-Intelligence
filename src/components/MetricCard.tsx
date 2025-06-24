import React from "react";
import { motion } from "framer-motion";

interface MetricCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	gradient: string;
	icon?: string;
	delay?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({
	title,
	value,
	subtitle,
	gradient,
	icon,
	delay = 0,
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay }}
			className={`${gradient} p-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200`}
		>
			<div className="flex items-center justify-between mb-2">
				<h3 className="text-white text-sm font-medium">{title}</h3>
				{icon && <span className="text-white text-lg">{icon}</span>}
			</div>
			<p className="text-white text-2xl font-bold mb-1">{value}</p>
			{subtitle && <p className="text-white/80 text-xs">{subtitle}</p>}
		</motion.div>
	);
};
