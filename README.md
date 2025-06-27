# Customer Analytics Dashboard

A modern, responsive React dashboard for customer analytics with advanced visualizations and dynamic metrics. Built with React, TypeScript, and Flask backend serving real customer data.

## 🚀 Features

- **Real-time Customer Analytics** - Live data visualization from CSV data source
- **Advanced Visualizations** - Interactive charts and graphs using Chart.js
- **Dynamic Filtering** - Multi-select and single-select filters for Churn Risk, Customer Segment, and CLTV Segment
- **Comprehensive Insights** - Including:
  - Customer overview and summary metrics
  - Product group analysis with contribution metrics
  - Segment-wise bar charts with checkbox filters
  - Churn analysis (retained vs lost customers)
  - Product brand contributions by segment
  - Executive summary and recommendations
- **Responsive Design** - Fully responsive layout that works on all devices
- **Modern UI** - Dark theme with beautiful gradients and animations using Framer Motion
- **Fast Deployment** - Quickly install and deploy with minimal configuration

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Chart.js** with React-ChartJS-2 for data visualization
- **Framer Motion** for smooth animations
- **Lucide React** for icons

### Backend

- **Flask** (Python) API server
- **Pandas** for data processing
- **Flask-CORS** for cross-origin requests

## 📊 Dashboard Sections

1. **Customer Overview** - Key metrics and summary statistics
2. **Product Group Overview** - Product performance metrics with dropdown selection
3. **Segment Summary** - Bar chart visualization of customer segments
4. **Product Brand Contributions** - Segment-wise analysis with interactive filters
5. **Churn Analysis** - Comprehensive analysis of customer retention vs churn
6. **Customer Segment Analysis** - Distribution by churn risk across segments
7. **Insights & Recommendations** - Executive summary and actionable insights

## 🏗️ Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── CustomerDashboard.tsx      # Main dashboard component
│   │   ├── ProductGroupOverview.tsx   # Product group metrics
│   │   ├── SegmentSummaryBarChart.tsx # Segment bar chart
│   │   ├── ProductBrandContributions.tsx # Brand analysis
│   │   ├── ChurnAnalytics.tsx         # Churn analysis
│   │   ├── DarkSegmentChart.tsx       # Segment analysis chart
│   │   └── InsightsRecommendations.tsx # Executive insights
│   ├── services/
│   │   └── dataService.ts             # API client service
│   ├── App.tsx                        # Root component
│   └── main.tsx                       # Entry point
├── api/
│   └── app.py                         # Flask backend server
├── final_data.csv                     # Customer data source
└── package.json                       # Dependencies and scripts
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/customer-analytics-dashboard.git
   cd customer-analytics-dashboard
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   pip install flask flask-cors pandas
   ```

### Running the Application

1. **Start the Flask backend** (in one terminal):

   ```bash
   python api/app.py
   ```

   The API will be available at `http://localhost:5000`

2. **Start the React frontend** (in another terminal):
   ```bash
   npm run dev
   ```
   The dashboard will be available at `http://localhost:5173`

## 📈 Data Source

The dashboard uses `final_data.csv` which contains customer data with the following key fields:

- Customer demographics and segments
- Revenue and CLTV metrics
- Churn probability and risk levels
- Product category revenue breakdowns
- Geographic and behavioral data

## ⚡ Performance Tips

- Preprocess CSV data to reduce data loading time
- Use caching for frequently accessed endpoints
- Optimize images and static assets for faster rendering

## 🎨 UI/UX Features

- **Dark Theme** - Professional dark color scheme
- **Responsive Grid Layouts** - Adapts to different screen sizes
- **Interactive Charts** - Hover effects and tooltips
- **Smooth Animations** - Framer Motion powered transitions
- **Loading States** - Skeleton loaders and loading indicators
- **Error Handling** - Graceful error states and fallbacks

## 🔧 API Endpoints

- `GET /api/customers` - Get customer data with optional filters
- `GET /api/filters` - Get available filter options
- `GET /api/summary` - Get dashboard summary metrics
- `GET /api/group-metrics` - Get product group metrics
- `GET /api/product-brand-contributions` - Get brand contribution data

## 📱 Responsive Design

The dashboard is fully responsive with breakpoints:

- **Mobile**: Single column layout, compact spacing
- **Tablet**: Two column grid, medium spacing
- **Desktop**: Multi-column layout, full features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chart.js for excellent charting capabilities
- Tailwind CSS for rapid UI development
- Framer Motion for smooth animations
- React community for amazing ecosystem

## 📞 Support

If you have any questions or need help, please open an issue or contact the maintainers.

---

Built with ❤️ using React, TypeScript, and Flask
