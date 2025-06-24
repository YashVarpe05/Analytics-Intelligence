const API_BASE_URL = "http://localhost:5000/api";

export interface Customer {
	customer_id: string;
	overall_visits: number;
	overall_revenue: number;
	overall_units: number;
	avg_day_gap: number;
	recency: number;
	churn: number;
	churn_probability: number;
	churn_risk: string;
	segment: string;
	cltv: number;
	cltv_segment: string;
	[key: string]: string | number; // For dynamic product category fields
}

export interface Filters {
	product_categories: string[];
	segments: string[];
	churn_risks: string[];
	cltv_segments: string[];
}

export interface Summary {
	total_customers: number;
	avg_churn_rate: number;
	high_risk_customers: number;
	total_revenue: number;
	avg_cltv: number;
}

export interface ProductGroupMetrics {
	group: string;
	total_visits: number;
	total_revenue: number;
	total_units: number;
	avg_recency: number;
	total_cltv: number;
	avg_cltv: number;
	high_cltv_count: number;
	medium_cltv_count: number;
	low_cltv_count: number;
	customer_count: number;
	error?: string;
}

export interface ProductBrandContribution {
	category: string;
	revenue: number;
	revenue_percentage: number;
	customers: number;
	customer_percentage: number;
	visits: number;
	units: number;
	avg_revenue_per_customer: number;
}

export interface ProductBrandContributionsResponse {
	contributions: ProductBrandContribution[];
	total_revenue: number;
	total_customers: number;
	filters_applied: {
		segment?: string;
		churn_risk?: string;
		cltv_segment?: string;
	};
}

class DataService {
	private async fetchData<T>(endpoint: string): Promise<T> {
		try {
			console.log(`Fetching: ${API_BASE_URL}${endpoint}`);
			const response = await fetch(`${API_BASE_URL}${endpoint}`);
			if (!response.ok) {
				console.error(
					`HTTP error! status: ${response.status}, url: ${API_BASE_URL}${endpoint}`
				);
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			console.log(`Success fetching ${endpoint}:`, data);
			return data;
		} catch (error) {
			console.error(`Error fetching ${endpoint}:`, error);
			throw error;
		}
	}

	async getFilters(): Promise<Filters> {
		return this.fetchData<Filters>("/filters");
	}

	async getSummary(): Promise<Summary> {
		return this.fetchData<Summary>("/summary");
	}

	async getCustomers(
		filters: {
			segment?: string;
			churn_risk?: string;
			cltv_segment?: string;
			category?: string;
			limit?: number;
		} = {}
	): Promise<{
		customers: Customer[];
		total_count: number;
		total_available: number;
	}> {
		const params = new URLSearchParams();
		Object.entries(filters).forEach(([key, value]) => {
			if (value && value !== "all") params.append(key, value.toString());
		});
		const endpoint = `/customers${
			params.toString() ? `?${params.toString()}` : ""
		}`;
		return this.fetchData(endpoint);
	}
	async getProductGroupMetrics(
		group: string = ""
	): Promise<ProductGroupMetrics> {
		return this.fetchData<ProductGroupMetrics>(
			`/product-group-metrics?group=${group}`
		);
	}

	async getProductBrandContributions(
		filters: {
			segment?: string;
			churn_risk?: string;
			cltv_segment?: string;
			category?: string;
		} = {}
	): Promise<ProductBrandContributionsResponse> {
		const params = new URLSearchParams();
		Object.entries(filters).forEach(([key, value]) => {
			if (value && value !== "all" && value !== "")
				params.append(key, value.toString());
		});
		const endpoint = `/product-brand-contributions${
			params.toString() ? `?${params.toString()}` : ""
		}`;
		return this.fetchData(endpoint);
	}
}

export const dataService = new DataService();
