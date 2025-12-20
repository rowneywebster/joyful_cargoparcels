import React, { useState, useEffect, useCallback } from 'react';
import './ParcelsPage.css';
import { getParcels, createParcel, updateParcel, deleteParcel, updateParcelStatus } from '../api/parcels';

const ParcelsPage = () => {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentParcel, setCurrentParcel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const itemsPerPageOptions = [10, 20, 30];

  useEffect(() => {
    
    fetchParcels();
  }, [fetchParcels]);

  const fetchParcels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: searchTerm,
        status: filterStatus,
      };
      const data = await getParcels(params);
      setParcels(data);
    } catch (err) {
      setError('Failed to fetch parcels.');
      console.error('Error fetching parcels:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, filterStatus, setParcels, setLoading, setError]);

  const handleAddEditParcel = async (parcelData) => {
    setError(null);
    try {
      if (currentParcel) {
        await updateParcel(currentParcel.id, parcelData);
      } else {
        await createParcel(parcelData);
      }
      setIsModalOpen(false);
      setCurrentParcel(null);
      fetchParcels();
    } catch (err) {
      setError('Failed to save parcel.');
      console.error('Error saving parcel:', err);
    }
  };

  const handleDeleteParcel = async (id) => {
    if (window.confirm('Are you sure you want to delete this parcel?')) {
      setError(null);
      try {
        await deleteParcel(id);
        fetchParcels();
      } catch (err) {
        setError('Failed to delete parcel.');
        console.error('Error deleting parcel:', err);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setError(null);
    try {
      await updateParcelStatus(id, newStatus);
      fetchParcels();
    } catch (err) {
      setError('Failed to update parcel status.');
      console.error('Error updating status:', err);
    }
  };

  const openAddModal = () => {
    setCurrentParcel(null);
    setIsModalOpen(true);
  };

  const openEditModal = (parcel) => {
    setCurrentParcel(parcel);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentParcel(null);
  };

  const totalPages = parcels.total ? Math.ceil(parcels.total / itemsPerPage) : 0;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="loading-message">Loading parcels...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="parcels-page-container">
      <h1 className="parcels-title">Parcels</h1>

      <div className="top-action-bar">
        <button className="primary-button" onClick={openAddModal}>Add New Parcel</button>
        <input
          type="text"
          placeholder="Search parcels..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Postponed">Postponed</option>
          <option value="Overdue">Overdue</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <button className="secondary-button">Export</button>
      </div>

      {parcels.items?.length === 0 ? (
        <p className="no-parcels-message">No parcels found.</p>
      ) : (
        <div className="table-responsive">
          <table className="parcels-table">
            <thead>
              <tr>
                <th>Tracking Number</th>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>Delivery Address</th>
                <th>Parcel Value</th>
                <th>Status</th>
                <th>Order Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {parcels.items?.map((parcel) => (
                <tr key={parcel.id}>
                  <td>{parcel.tracking_number}</td>
                  <td>{parcel.customer_name}</td>
                  <td>{parcel.phone_number}</td>
                  <td>{parcel.delivery_address}</td>
                  <td>KES {parcel.parcel_value.toFixed(2)}</td>
                  <td>
                    <select
                      value={parcel.status}
                      onChange={(e) => handleStatusChange(parcel.id, e.target.value)}
                      className={`status-badge ${parcel.status.toLowerCase()}`}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Postponed">Postponed</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{parcel.order_date}</td>
                  <td>
                    <button className="action-button edit" onClick={() => openEditModal(parcel)}>Edit</button>
                    <button className="action-button delete" onClick={() => handleDeleteParcel(parcel.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {parcels.total > itemsPerPageOptions[0] && (
        <div className="pagination-controls">
          <div className="items-per-page">
            Show
            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            entries
          </div>
          <div className="page-buttons">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={currentPage === index + 1 ? 'active' : ''}
              >
                {index + 1}
              </button>
            ))}
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <ParcelModal
          parcel={currentParcel}
          onClose={closeModal}
          onSave={handleAddEditParcel}
        />
      )}
    </div>
  );
};

const ParcelModal = ({ parcel, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    phone_number: '',
    delivery_address: '',
    parcel_description: '',
    parcel_value: '',
    order_date: '',
    status: 'Pending',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});


  useEffect(() => {
    if (parcel) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        customer_name: parcel.customer_name || '',
        phone_number: parcel.phone_number || '',
        delivery_address: parcel.delivery_address || '',
        parcel_description: parcel.parcel_description || '',
        parcel_value: parcel.parcel_value || '',
        order_date: parcel.order_date || '',
        status: parcel.status || 'Pending',
        notes: parcel.notes || '',
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        order_date: today,
      }));
    }
  }, [parcel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.customer_name) errors.customer_name = 'Customer Name is required';
    if (!formData.phone_number) errors.phone_number = 'Phone Number is required';
    if (!formData.delivery_address) errors.delivery_address = 'Delivery Address is required';
    if (!formData.parcel_value || isNaN(formData.parcel_value) || parseFloat(formData.parcel_value) <= 0) {
      errors.parcel_value = 'Valid Parcel Value is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const parcelToSave = {
      ...formData,
      parcel_value: parseFloat(formData.parcel_value),
    };
    onSave(parcelToSave);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{parcel ? 'Edit Parcel' : 'Add New Parcel'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="customer_name">Customer Name *</label>
            <input type="text" id="customer_name" name="customer_name" value={formData.customer_name} onChange={handleChange} />
            {formErrors.customer_name && <p className="form-error">{formErrors.customer_name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="phone_number">Phone Number *</label>
            <input type="text" id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} />
            {formErrors.phone_number && <p className="form-error">{formErrors.phone_number}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="delivery_address">Delivery Address *</label>
            <textarea id="delivery_address" name="delivery_address" value={formData.delivery_address} onChange={handleChange}></textarea>
            {formErrors.delivery_address && <p className="form-error">{formErrors.delivery_address}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="parcel_description">Parcel Description</label>
            <input type="text" id="parcel_description" name="parcel_description" value={formData.parcel_description} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="parcel_value">Parcel Value *</label>
            <input type="number" id="parcel_value" name="parcel_value" value={formData.parcel_value} onChange={handleChange} step="0.01" />
            {formErrors.parcel_value && <p className="form-error">{formErrors.parcel_value}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="order_date">Order Date</label>
            <input type="date" id="order_date" name="order_date" value={formData.order_date} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange}>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Postponed">Postponed</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange}></textarea>
          </div>
          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button">Save Parcel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParcelsPage;
