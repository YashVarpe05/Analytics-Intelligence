import React, { useState, useEffect } from "react";
import { BarChart3, Brain } from "lucide-react";
import { CustomerDashboard } from "./components/CustomerDashboard";

const App: React.FC = () => {
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => setCurrentTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	return (
		<div className="min-h-screen bg-gray-900 text-white">
			{/* Header */}
			<header className="bg-black/40 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40">
				<div className="max-w-7xl mx-auto px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
								<BarChart3 className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
									Analytics Intelligence
								</h1>
								<p className="text-sm text-gray-400">
									Real-time Customer Insights Dashboard
								</p>
							</div>
						</div>

						<div className="flex items-center space-x-4">
							<div className="text-right">
								<div className="text-sm text-gray-400">Live Data</div>
								<div className="text-sm font-mono text-green-400">
									{currentTime.toLocaleTimeString()}
								</div>
							</div>
							<div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
						</div>
					</div>
				</div>
			</header>

			{/* Main Dashboard Content */}
			<main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
				{/* Key Insights Banner */}
				<div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
					<div className="flex items-center space-x-3 mb-4">
						<Brain className="w-6 h-6 text-purple-400" />
						<h2 className="text-xl font-bold text-white">
							Dynamic Customer Dashboard
						</h2>
						<span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
							Data-Driven Analytics
						</span>
					</div>
					<p className="text-gray-300">
						This dashboard provides real-time analytics with filtering
						capabilities. Use the filters below to analyze customer segments,
						churn risk, CLTV segments, and product categories.
					</p>
				</div>

				{/* Customer Dashboard Component */}
				<CustomerDashboard />
			</main>

			{/* Footer */}
			<footer className="border-t border-white/10 py-6 px-6 mt-12">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<div className="text-sm text-gray-400">
						Data updated in real-time • Last refresh:{" "}
						{currentTime.toLocaleString()}
					</div>
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-2">
							<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
							<span className="text-sm text-gray-400">Live Data Feed</span>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default App;
