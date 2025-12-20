import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getDashboardOverview, getDashboardStats } from '../api/settings';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewData, statsData] = await Promise.all([
          getDashboardOverview(),
          getDashboardStats(),
        ]);
        setOverview(overviewData);
        setStats(statsData);
      } catch (err) {
        setError('Failed to load dashboard data.');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="loading-message">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard-page-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="welcome-message">Welcome back, {user?.name || 'User'}!</p>

      {overview && (
        <section className="dashboard-section">
          <h2 className="section-title">Current Month Overview</h2>
          <div className="grid-container">
            <div className="card">
              <h3>Total Parcels This Month</h3>
              <p className="metric-value">{overview.total_parcels_this_month}</p>
            </div>
            <div className="card">
              <h3>Revenue This Month</h3>
              <p className="metric-value">KES {overview.revenue_this_month}</p>
            </div>
            <div className="card">
              <h3>Expenses This Month</h3>
              <p className="metric-value">KES {overview.expenses_this_month}</p>
            </div>
            <div className="card">
              <h3>Net Profit This Month</h3>
              <p className="metric-value">KES {overview.net_profit_this_month}</p>
            </div>
          </div>
        </section>
      )}

      {stats && (
        <section className="dashboard-section">
          <h2 className="section-title">Parcel Status Breakdown</h2>
          <div className="quick-stats-row">
            {Object.entries(stats.parcel_status_breakdown).map(([status, count]) => (
              <div key={status} className="status-pill">
                <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
                <span className="status-count">{count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {user?.role === 'admin' && stats && (
        <section className="dashboard-section">
          <h2 className="section-title">Complete Business Overview (All-Time)</h2>
          <div className="grid-container">
            <div className="card">
              <h3>Total Parcels (All-Time)</h3>
              <p className="metric-value">{stats.total_parcels}</p>
            </div>
            <div className="card">
              <h3>Total Revenue (All-Time)</h3>
              <p className="metric-value">KES {stats.total_revenue}</p>
            </div>
            <div className="card">
              <h3>Total Expenses (All-Time)</h3>
              <p className="metric-value">KES {stats.total_expenses}</p>
            </div>
            <div className="card">
              <h3>Total Net Profit (All-Time)</h3>
              <p className="metric-value">KES {stats.total_net_profit}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default DashboardPage;
