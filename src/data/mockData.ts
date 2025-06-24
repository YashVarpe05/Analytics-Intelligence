// Mock data for dynamic dashboard
export const customerSegments = [
  { name: 'High Value', count: 2847, percentage: 23.5, color: '#10B981', revenue: 1250000 },
  { name: 'Medium Value', count: 4521, percentage: 37.2, color: '#F59E0B', revenue: 850000 },
  { name: 'Low Value', count: 3892, percentage: 32.1, color: '#EF4444', revenue: 320000 },
  { name: 'At Risk', count: 891, percentage: 7.2, color: '#8B5CF6', revenue: 180000 }
];

export const churnPredictions = [
  { segment: 'Enterprise', risk: 'Low', count: 145, probability: 0.12 },
  { segment: 'SMB', risk: 'Medium', count: 892, probability: 0.34 },
  { name: 'Startup', risk: 'High', count: 234, probability: 0.67 },
  { segment: 'Individual', risk: 'Medium', count: 1205, probability: 0.28 }
];

export const revenueData = Array.from({ length: 20 }, (_, i) => ({
  time: new Date(Date.now() - (19 - i) * 60000).toLocaleTimeString(),
  value: 45000 + Math.random() * 15000,
  change: (Math.random() - 0.5) * 2000
}));

export const customerData = Array.from({ length: 20 }, (_, i) => ({
  time: new Date(Date.now() - (19 - i) * 60000).toLocaleTimeString(),
  value: 12500 + Math.random() * 2000,
  change: (Math.random() - 0.5) * 200
}));

export const churnData = Array.from({ length: 20 }, (_, i) => ({
  time: new Date(Date.now() - (19 - i) * 60000).toLocaleTimeString(),
  value: 3.2 + (Math.random() - 0.5) * 1.5,
  change: (Math.random() - 0.5) * 0.3
}));

export const topCustomers = [
  { name: 'TechCorp Inc.', value: 125000, risk: 'low', trend: 'up', segment: 'Enterprise' },
  { name: 'Digital Solutions', value: 98000, risk: 'medium', trend: 'up', segment: 'SMB' },
  { name: 'Innovation Labs', value: 87000, risk: 'high', trend: 'down', segment: 'Startup' },
  { name: 'Global Systems', value: 156000, risk: 'low', trend: 'up', segment: 'Enterprise' },
  { name: 'Smart Analytics', value: 67000, risk: 'medium', trend: 'neutral', segment: 'SMB' }
];

export const insights = [
  {
    title: 'Churn Risk Alert',
    message: '234 customers showing high churn probability',
    type: 'warning',
    action: 'Review retention strategy',
    impact: 'Potential revenue loss: $1.2M'
  },
  {
    title: 'Revenue Opportunity',
    message: 'Enterprise segment showing 23% growth',
    type: 'success',
    action: 'Expand enterprise offerings',
    impact: 'Projected increase: $450K'
  },
  {
    title: 'Customer Behavior',
    message: 'Usage patterns indicate upsell potential',
    type: 'info',
    action: 'Launch targeted campaigns',
    impact: 'Expected conversion: 15%'
  }
];