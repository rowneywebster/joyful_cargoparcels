import React, { useState, useEffect } from 'react';
import './PostponedOrdersPage.css';
import { getPostponedOrders, updatePostponedOrder, deletePostponedOrder } from '../api/postponedOrders';
import { getParcelById } from '../api/parcels'; // To link back to parcel details

const PostponedOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDateRange, setFilterDateRange] = useState('All'); // e.g., 'All', 'Today', 'ThisWeek', 'ThisMonth'
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState('');

  useEffect(() => {
    fetchPostponedOrders();
  }, []);

  const fetchPostponedOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPostponedOrders();
      setOrders(data);
    } catch (err) {
      setError('Failed to fetch postponed orders.');
      console.error('Error fetching postponed orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsResolved = async (orderId) => {
    if (window.confirm('Are you sure you want to mark this order as resolved? This will update the original parcel status.')) {
      setError(null);
      try {
        await deletePostponedOrder(orderId); // In dummy API, resolving means removing from this list
        fetchPostponedOrders(); // Refresh list
        // In a real app, this would also trigger an update on the original parcel's status
      } catch (err) {
        setError('Failed to mark order as resolved.');
        console.error('Error marking order as resolved:', err);
      }
    }
  };

  const openRescheduleModal = (order) => {
    setSelectedOrder(order);
    setNewRescheduleDate(order.newDeliveryDate); // Pre-fill with current new date
    setIsRescheduleModalOpen(true);
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !newRescheduleDate) {
      setError('Please select a new delivery date.');
      return;
    }
    setError(null);
    try {
      await updatePostponedOrder(selectedOrder.id, { newDeliveryDate: newRescheduleDate });
      setIsRescheduleModalOpen(false);
      setSelectedOrder(null);
      setNewRescheduleDate('');
      fetchPostponedOrders(); // Refresh list
    } catch (err) {
      setError('Failed to reschedule order.');
      console.error('Error rescheduling order:', err);
    }
  };

  const closeModal = () => {
    setIsRescheduleModalOpen(false);
    setSelectedOrder(null);
    setNewRescheduleDate('');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' ||
      order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    // Basic date range filtering (can be expanded)
    const today = new Date().toISOString().split('T')[0];
    const matchesDateRange = true; // Placeholder for now

    return matchesSearch && matchesDateRange;
  });

  // Calculate summary metrics
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date to start of day

  const totalPostponed = filteredOrders.length;
  const dueToday = filteredOrders.filter(order => {
    const newDeliveryDate = new Date(order.newDeliveryDate);
    newDeliveryDate.setHours(0, 0, 0, 0);
    return newDeliveryDate.getTime() === today.getTime();
  }).length;
  const pastDue = filteredOrders.filter(order => {
    const newDeliveryDate = new Date(order.newDeliveryDate);
    newDeliveryDate.setHours(0, 0, 0, 0);
    return newDeliveryDate.getTime() < today.getTime();
  }).length;


  if (loading) {
    return <div className="loading-message">Loading postponed orders...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="postponed-orders-page-container">
      <h1 className="postponed-orders-title">Postponed Orders</h1>
      <p className="page-description">Orders automatically synced from parcels marked as postponed</p>

      <div className="summary-cards-container">
        <div className="summary-card">
          <h3>Total Postponed</h3>
          <p className="metric-value">{totalPostponed}</p>
        </div>
        <div className="summary-card">
          <h3>Due Today</h3>
          <p className="metric-value">{dueToday}</p>
        </div>
        <div className="summary-card warning">
          <h3>Past Due</h3>
          <p className="metric-value">{pastDue}</p>
        </div>
      </div>

      <div className="top-action-bar">
        <input
          type="text"
          placeholder="Search by tracking # or customer..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterDateRange}
          onChange={(e) => setFilterDateRange(e.target.value)}
        >
          <option value="All">All Dates</option>
          <option value="Today">Due Today</option>
          <option value="ThisWeek">Due This Week</option>
          <option value="ThisMonth">Due This Month</option>
        </select>
        <button className="primary-button">Send Reminders</button> {/* New button */}
        <a href="/parcels" className="secondary-button">View All Parcels</a>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="no-orders-message">No postponed orders found.</p>
      ) : (
        <div className="table-responsive">
          <table className="postponed-orders-table">
            <thead>
              <tr>
                <th>Tracking Number</th>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>Original Delivery Date</th>
                <th>New Delivery Date</th>
                <th>Postpone Reason</th>
                <th>Days Postponed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const originalDate = new Date(order.originalDeliveryDate);
                const newDate = new Date(order.newDeliveryDate);
                const diffTime = Math.abs(newDate - originalDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const isApproaching = (newDate - new Date()) / (1000 * 60 * 60 * 24) <= 3 && (newDate - new Date()) > 0;
                const isPastDue = newDate < new Date();

                return (
                  <tr key={order.id} className={`${isApproaching ? 'approaching-due' : ''} ${isPastDue ? 'past-due' : ''}`}>
                    <td><a href={`/parcels/${order.trackingNumber}`} className="tracking-link">{order.trackingNumber}</a></td>
                    <td>{order.customerName}</td>
                    <td>{order.phoneNumber}</td>
                    <td>{order.originalDeliveryDate}</td>
                    <td className="new-delivery-date">{order.newDeliveryDate}</td>
                    <td>{order.postponeReason || 'N/A'}</td>
                    <td>{diffDays}</td>
                    <td>
                      <button className="action-button edit" onClick={() => openRescheduleModal(order)}>Reschedule</button>
                      <button className="action-button resolve" onClick={() => handleMarkAsResolved(order.id)}>Mark as Resolved</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isRescheduleModalOpen && selectedOrder && (
        <RescheduleModal
          order={selectedOrder}
          newRescheduleDate={newRescheduleDate}
          setNewRescheduleDate={setNewRescheduleDate}
          onClose={closeModal}
          onSave={handleReschedule}
        />
      )}
    </div>
  );
};

// Reschedule Modal Component
const RescheduleModal = ({ order, newRescheduleDate, setNewRescheduleDate, onClose, onSave }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Reschedule Order: {order.trackingNumber}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={onSave}>
          <div className="form-group">
            <label htmlFor="rescheduleDate">New Delivery Date *</label>
            <input
              type="date"
              id="rescheduleDate"
              name="rescheduleDate"
              value={newRescheduleDate}
              onChange={(e) => setNewRescheduleDate(e.target.value)}
              required
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button">Reschedule</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostponedOrdersPage;
