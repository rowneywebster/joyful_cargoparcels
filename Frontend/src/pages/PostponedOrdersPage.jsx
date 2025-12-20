import React, { useState, useEffect } from 'react';
import './PostponedOrdersPage.css';
import { getPostponedOrders, updatePostponedOrder, resolvePostponedOrder } from '../api/postponedOrders';

const PostponedOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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
        await resolvePostponedOrder(orderId);
        fetchPostponedOrders();
      } catch (err) {
        setError('Failed to mark order as resolved.');
        console.error('Error marking order as resolved:', err);
      }
    }
  };

  const openRescheduleModal = (order) => {
    setSelectedOrder(order);
    setNewRescheduleDate(order.new_delivery_date);
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
      await updatePostponedOrder(selectedOrder.id, { new_delivery_date: newRescheduleDate });
      setIsRescheduleModalOpen(false);
      setSelectedOrder(null);
      setNewRescheduleDate('');
      fetchPostponedOrders();
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
      order.parcel.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.parcel.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

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

      <div className="top-action-bar">
        <input
          type="text"
          placeholder="Search by tracking # or customer..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td><a href={`/parcels/${order.parcel.id}`} className="tracking-link">{order.parcel.tracking_number}</a></td>
                  <td>{order.parcel.customer_name}</td>
                  <td>{order.parcel.phone_number}</td>
                  <td>{order.original_delivery_date}</td>
                  <td className="new-delivery-date">{order.new_delivery_date}</td>
                  <td>{order.reason || 'N/A'}</td>
                  <td>
                    <button className="action-button edit" onClick={() => openRescheduleModal(order)}>Reschedule</button>
                    <button className="action-button resolve" onClick={() => handleMarkAsResolved(order.id)}>Mark as Resolved</button>
                  </td>
                </tr>
              ))}
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

const RescheduleModal = ({ order, newRescheduleDate, setNewRescheduleDate, onClose, onSave }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Reschedule Order: {order.parcel.tracking_number}</h2>
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

