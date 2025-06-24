import React, { useState, useEffect } from "react";

const ApiTest: React.FC = () => {
	const [apiStatus, setApiStatus] = useState<string>("Testing...");
	const [filters, setFilters] = useState<{
		segments?: string[];
		product_categories?: string[];
		churn_risks?: string[];
		cltv_segments?: string[];
	} | null>(null);

	useEffect(() => {
		const testApi = async () => {
			try {
				// Test health endpoint
				const healthResponse = await fetch("http://localhost:5000/api/health");
				if (!healthResponse.ok) {
					setApiStatus("Failed to connect to API");
					return;
				}

				// Test filters endpoint
				const filtersResponse = await fetch(
					"http://localhost:5000/api/filters"
				);
				if (!filtersResponse.ok) {
					setApiStatus("Health OK, but filters failed");
					return;
				}

				const filtersData = await filtersResponse.json();
				setFilters(filtersData);
				setApiStatus("API Connection Successful!");
			} catch (error) {
				setApiStatus(`API Error: ${error}`);
			}
		};

		testApi();
	}, []);

	return (
		<div className="bg-gray-800 p-4 rounded-lg mb-4">
			<h3 className="text-lg font-semibold text-white mb-2">
				API Connection Test
			</h3>
			<p className="text-gray-300 mb-2">Status: {apiStatus}</p>
			{filters && (
				<div className="text-sm text-gray-400">
					<p>Segments: {filters.segments?.length || 0}</p>
					<p>Categories: {filters.product_categories?.length || 0}</p>
					<p>Churn Risks: {filters.churn_risks?.length || 0}</p>
				</div>
			)}
		</div>
	);
};

export default ApiTest;
