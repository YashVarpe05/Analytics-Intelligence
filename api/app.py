from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app, origins=[
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175',
    'http://127.0.0.1:5173', 
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175'
])  # Enable CORS for React dev servers

# Load data from CSV file
csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'final_data.csv')
df = pd.read_csv(csv_path)

# Extract unique values for filters
product_categories = sorted({col.split('_')[0] for col in df.columns if col.endswith('_visits') and col != 'overall_visits'})
segments = sorted(df['segment'].unique().tolist())
churn_risks = sorted(df['churn_risk'].unique().tolist())
cltv_segments = sorted(df['cltv_segment'].unique().tolist())

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"})

@app.route('/api/filters', methods=['GET'])
def get_filters():
    """Return all filter options for the frontend"""
    return jsonify({
        "product_categories": product_categories,
        "segments": segments,
        "churn_risks": churn_risks,
        "cltv_segments": cltv_segments
    })

@app.route('/api/summary', methods=['GET'])
def get_summary():
    """Return summary statistics"""
    total_customers = len(df)
    avg_churn_rate = df['churn_probability'].mean() * 100
    high_risk_customers = len(df[df['churn_risk'] == 'high'])
    total_revenue = df['overall_revenue'].sum()
    avg_cltv = df['cltv'].mean()
    
    return jsonify({
        "total_customers": total_customers,
        "avg_churn_rate": round(avg_churn_rate, 2),
        "high_risk_customers": high_risk_customers,
        "total_revenue": round(total_revenue, 2),
        "avg_cltv": round(avg_cltv, 2)
    })

@app.route('/api/customers', methods=['GET'])
def get_customers():
    """Return filtered customers based on query parameters"""
    segment = request.args.get('segment')
    churn_risk = request.args.get('churn_risk')
    cltv_segment = request.args.get('cltv_segment')
    category = request.args.get('category')
    limit = request.args.get('limit', default=100, type=int)
    
    # Start with full dataset
    filtered_df = df.copy()
    
    # Apply filters
    if segment and segment != 'all':
        filtered_df = filtered_df[filtered_df['segment'] == segment]
    
    if churn_risk and churn_risk != 'all':
        filtered_df = filtered_df[filtered_df['churn_risk'] == churn_risk]
        
    if cltv_segment and cltv_segment != 'all':
        filtered_df = filtered_df[filtered_df['cltv_segment'] == cltv_segment]
    
    if category and category != 'all':
        # Filter by customers who visited the specific category
        visit_col = f"{category}_visits"
        if visit_col in filtered_df.columns:
            filtered_df = filtered_df[filtered_df[visit_col] > 0]
    
    # Convert to dict for JSON serialization and limit results
    result = filtered_df.head(limit).to_dict('records')
    
    return jsonify({
        "customers": result,
        "total_count": len(result),
        "total_available": len(filtered_df)
    })

@app.route('/api/segment-stats', methods=['GET'])
def get_segment_stats():
    """Return statistics by customer segment"""
    stats = df.groupby('segment').agg({
        'customer_id': 'count',
        'overall_revenue': 'sum',
        'overall_visits': 'mean',
        'churn_probability': 'mean',
        'cltv': 'mean'
    }).reset_index()
    
    stats.columns = ['segment', 'count', 'total_revenue', 'avg_visits', 'avg_churn_probability', 'avg_cltv']
    stats['avg_churn_probability'] = stats['avg_churn_probability'] * 100  # Convert to percentage
    
    # Round numeric columns for better readability
    numeric_cols = ['total_revenue', 'avg_visits', 'avg_churn_probability', 'avg_cltv']
    for col in numeric_cols:
        stats[col] = stats[col].round(2)
    
    return jsonify(stats.to_dict('records'))

@app.route('/api/category-revenue', methods=['GET'])
def get_category_revenue():
    """Return revenue by product category"""
    revenue_data = []
    
    for category in product_categories:
        revenue_col = f"{category}_revenue"
        if revenue_col in df.columns:
            total = df[revenue_col].sum()
            avg = df[df[revenue_col] > 0][revenue_col].mean()
            revenue_data.append({
                "category": category,
                "total_revenue": round(total, 2),
                "avg_revenue": round(avg, 2),
                "customer_count": int((df[revenue_col] > 0).sum())
            })
    
    # Sort by total revenue
    revenue_data = sorted(revenue_data, key=lambda x: x["total_revenue"], reverse=True)
    
    return jsonify(revenue_data)

@app.route('/api/churn-risk', methods=['GET'])
def get_churn_risk():
    """Return churn risk statistics"""
    churn_stats = df.groupby('churn_risk').agg({
        'customer_id': 'count',
        'churn_probability': 'mean',
        'cltv': 'mean',
        'overall_revenue': 'mean'
    }).reset_index()
    
    churn_stats.columns = ['risk_level', 'customer_count', 'avg_probability', 'avg_cltv', 'avg_revenue']
    churn_stats['avg_probability'] = churn_stats['avg_probability'] * 100  # Convert to percentage
    
    # Round numeric columns
    numeric_cols = ['avg_probability', 'avg_cltv', 'avg_revenue']
    for col in numeric_cols:
        churn_stats[col] = churn_stats[col].round(2)
    
    return jsonify(churn_stats.to_dict('records'))

@app.route('/api/top-customers', methods=['GET'])
def get_top_customers():
    """Return top customers by different metrics"""
    metric = request.args.get('metric', default='cltv')
    limit = request.args.get('limit', default=10, type=int)
    
    valid_metrics = ['cltv', 'overall_revenue', 'overall_visits']
    if metric not in valid_metrics:
        metric = 'cltv'
    
    # Sort by the requested metric and get top N
    top_df = df.sort_values(by=metric, ascending=False).head(limit)
    
    # Select relevant columns
    result = top_df[['customer_id', metric, 'segment', 'churn_risk', 'churn_probability']].to_dict('records')
    
    return jsonify(result)

@app.route('/api/product-group-metrics', methods=['GET'])
def get_product_group_metrics():
    """Return metrics for a specific product group"""
    group = request.args.get('group', default='')
    
    if not group:
        # Return empty/default metrics when no group is selected
        result = {
            "group": "",
            "message": "Please select a product group to view metrics",
            "total_visits": 0,
            "total_revenue": 0.0,
            "total_units": 0,
            "avg_recency": 0.0,
            "total_cltv": 0.0,
            "avg_cltv": 0.0,
            "high_cltv_count": 0,
            "medium_cltv_count": 0,
            "low_cltv_count": 0,
            "customer_count": 0
        }
    else:
        # Filter customers who visited this product group
        visits_col = f"{group}_visits"
        revenue_col = f"{group}_revenue"
        units_col = f"{group}_units"
        recency_col = f"{group}_recency"
        
        if visits_col in df.columns:
            # Filter to customers who visited this category
            group_df = df[df[visits_col] > 0]
            
            result = {
                "group": group,
                "total_visits": int(group_df[visits_col].sum()),
                "total_revenue": round(group_df[revenue_col].sum(), 2),
                "total_units": int(group_df[units_col].sum()),
                "avg_recency": round(group_df[recency_col].mean(), 1),
                "total_cltv": round(group_df['cltv'].sum(), 2),
                "avg_cltv": round(group_df['cltv'].mean(), 2),
                "high_cltv_count": int((group_df['cltv_segment'] == 'high').sum()),
                "medium_cltv_count": int((group_df['cltv_segment'] == 'medium').sum()),
                "low_cltv_count": int((group_df['cltv_segment'] == 'low').sum()),
                "customer_count": len(group_df)
            }
        else:
            # Invalid category
            result = {
                "group": group,
                "error": "Invalid product group"
            }
    
    return jsonify(result)

@app.route('/api/product-brand-contributions', methods=['GET'])
def get_product_brand_contributions():
    """Return product brand contributions with filtering"""
    segment = request.args.get('segment')
    churn_risk = request.args.get('churn_risk')
    cltv_segment = request.args.get('cltv_segment')
    
    # Start with full dataset
    filtered_df = df.copy()
    
    # Apply filters
    if segment and segment != 'all':
        filtered_df = filtered_df[filtered_df['segment'] == segment]
    
    if churn_risk and churn_risk != 'all':
        filtered_df = filtered_df[filtered_df['churn_risk'] == churn_risk]
        
    if cltv_segment and cltv_segment != 'all':
        filtered_df = filtered_df[filtered_df['cltv_segment'] == cltv_segment]
    
    # Calculate product brand contributions
    contributions = []
    total_revenue = filtered_df['overall_revenue'].sum()
    total_customers = len(filtered_df)
    
    for category in product_categories:
        revenue_col = f"{category}_revenue"
        visits_col = f"{category}_visits"
        units_col = f"{category}_units"
        
        if revenue_col in filtered_df.columns:
            category_revenue = filtered_df[revenue_col].sum()
            category_customers = (filtered_df[visits_col] > 0).sum()
            category_visits = filtered_df[visits_col].sum()
            category_units = filtered_df[units_col].sum()
            
            revenue_percentage = (category_revenue / total_revenue * 100) if total_revenue > 0 else 0
            customer_percentage = (category_customers / total_customers * 100) if total_customers > 0 else 0
            
            contributions.append({
                'category': category,
                'revenue': round(category_revenue, 2),
                'revenue_percentage': round(revenue_percentage, 2),
                'customers': int(category_customers),
                'customer_percentage': round(customer_percentage, 2),
                'visits': int(category_visits),
                'units': int(category_units),
                'avg_revenue_per_customer': round(category_revenue / category_customers, 2) if category_customers > 0 else 0
            })
    
    # Sort by revenue percentage
    contributions.sort(key=lambda x: x['revenue_percentage'], reverse=True)
    
    return jsonify({
        'contributions': contributions,
        'total_revenue': round(total_revenue, 2),
        'total_customers': total_customers,
        'filters_applied': {
            'segment': segment,
            'churn_risk': churn_risk,
            'cltv_segment': cltv_segment
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
