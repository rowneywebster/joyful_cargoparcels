import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getParcels } from '../api/parcels'; // Import parcels API
import './DashboardPage.css'; // Import DashboardPage specific styles

const DashboardPage = () => {
  const { user } = useAuth();
  const [parcels, setParcels] = useState([]);
  const [loadingParcels, setLoadingParcels] = useState(true);
  const [errorParcels, setErrorParcels] = useState(null);

  useEffect(() => {
    const fetchParcelsData = async () => {
      try {
        const data = await getParcels();
        setParcels(data);
      } catch (err) {
        setErrorParcels('Failed to load parcel data for dashboard.');
        console.error('Dashboard parcel fetch error:', err);
      } finally {
        setLoadingParcels(false);
      }
    };
    fetchParcelsData();
  }, []);

  // Calculate dashboard metrics
  const totalParcelsThisMonth = parcels.filter(p => new Date(p.orderDate).getMonth() === new Date().getMonth()).length;
  const overdueParcelsCount = parcels.filter(p => p.status === 'Overdue').length;
  const postponedOrdersCount = parcels.filter(p => p.status === 'Postponed').length;

  const totalUnpaidParcelsValue = parcels
    .filter(p => p.status === 'Pending' || p.status === 'Overdue')
    .reduce((sum, p) => sum + p.parcelValue, 0);

  const parcelStatusBreakdown = {
    Paid: parcels.filter(p => p.status === 'Paid').length,
    Pending: parcels.filter(p => p.status === 'Pending').length,
    Postponed: parcels.filter(p => p.status === 'Postponed').length,
    Overdue: parcels.filter(p => p.status === 'Overdue').length,
    Cancelled: parcels.filter(p => p.status === 'Cancelled').length,
  };

  if (loadingParcels) {
    return <div className="loading-message">Loading dashboard data...</div>;
  }

  if (errorParcels) {
    return <div className="error-message">{errorParcels}</div>;
  }

  return (
    <div className="dashboard-page-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="welcome-message">Welcome back, {user?.name || 'User'}!</p>

      {/* Current Month Overview */}
      <section className="dashboard-section">
        <h2 className="section-title">Current Month Overview (November 2025)</h2>
        <div className="grid-container">
          <div className="card">
            <h3>Total Parcels This Month</h3>
            <p className="metric-value">{totalParcelsThisMonth}</p>
            <p className="trend-indicator green">↑ 10% vs last month</p>
          </div>
          <div className="card">
            <h3>Revenue This Month</h3>
            <p className="metric-value">KES 15,000</p> {/* Placeholder */}
            <p className="trend-indicator green">↑ 5% vs last month</p>
          </div>
          <div className="card">
            <h3>Expenses This Month</h3>
            <p className="metric-value">KES 3,000</p> {/* Placeholder */}
            <p className="trend-indicator red">↑ 2% vs last month</p>
          </div>
          <div className="card">
            <h3>Net Profit This Month</h3>
            <p className="metric-value">KES 12,000</p> {/* Placeholder */}
            <p className="trend-indicator green">↑ 8% vs last month</p>
          </div>
          <div className="card">
            <h3>Postponed Orders This Month</h3>
            <p className="metric-value">{postponedOrdersCount}</p>
            <p className="trend-indicator red">↑ 1 vs last month</p> {/* Placeholder */}
          </div>
          <div className="card warning">
            <h3>Overdue Parcels</h3>
            <p className="metric-value">{overdueParcelsCount}</p>
            <p className="trend-indicator">Action Required!</p>
          </div>
          {user?.role === 'admin' && (
            <div className="card info">
              <h3>Total Unpaid Parcels Value</h3>
              <p className="metric-value">KES {totalUnpaidParcelsValue.toFixed(2)}</p>
              <p className="trend-indicator">Pending & Overdue</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Stats Row - Parcel breakdown by status */}
      <section className="dashboard-section">
        <h2 className="section-title">Parcel Status Breakdown</h2>
        <div className="quick-stats-row">
          {Object.entries(parcelStatusBreakdown).map(([status, count]) => (
            <div key={status} className="status-pill">
              <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
              <span className="status-count">{count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Admin-only section for Complete Business Overview */}
      {user?.role === 'admin' && (
        <section className="dashboard-section">
          <h2 className="section-title">Complete Business Overview (All-Time)</h2>
          <div className="grid-container">
            <div className="card">
              <h3>Total Parcels (All-Time)</h3>
              <p className="metric-value">5,000</p> {/* Placeholder */}
            </div>
            <div className="card">
              <h3>Total Revenue (All-Time)</h3>
              <p className="metric-value">KES 500,000</p> {/* Placeholder */}
            </div>
            <div className="card">
              <h3>Total Expenses (All-Time)</h3>
              <p className="metric-value">KES 100,000</p> {/* Placeholder */}
            </div>
            <div className="card">
              <h3>Total Net Profit (All-Time)</h3>
              <p className="metric-value">KES 400,000</p> {/* Placeholder */}
            </div>
            <div className="card">
              <h3>Total Customers</h3>
              <p className="metric-value">1,200</p> {/* Placeholder */}
            </div>
          </div>
        </section>
      )}

      {/* Placeholder for Recent Activity */}
      <section className="dashboard-section">
        <h2 className="section-title">Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-timestamp">2025-11-25 14:30</span>
            <span className="activity-description">Parcel #JC12345 status updated to Paid</span>
          </div>
          <div className="activity-item">
            <span className="activity-timestamp">2025-11-25 10:00</span>
            <span className="activity-description">New expense: Rider Payout - KES 50</span>
          </div>
          <div className="activity-item">
            <span className="activity-timestamp">2025-11-24 18:00</span>
            <span className="activity-description">Parcel #JC12346 postponed to 2025-12-01</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
