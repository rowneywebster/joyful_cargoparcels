import React, { useState, useEffect } from 'react';
import './ParcelsPage.css';
import { getParcels, addParcel, updateParcel, deleteParcel } from '../api/parcels';
import { useAuth } from '../hooks/useAuth';

const ParcelsPage = () => {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentParcel, setCurrentParcel] = useState(null); // For edit mode
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const { user } = useAuth();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const itemsPerPageOptions = [10, 20, 30];

  useEffect(() => {
    fetchParcels();
  }, []);

  const fetchParcels = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getParcels();
      setParcels(data);
    } catch (err) {
      setError('Failed to fetch parcels.');
      console.error('Error fetching parcels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEditParcel = async (parcelData) => {
    setError(null);
    try {
      if (currentParcel) {
        // Update existing parcel
        await updateParcel(currentParcel.id, parcelData);
      } else {
        // Add new parcel
        await addParcel(parcelData);
      }
      setIsModalOpen(false);
      setCurrentParcel(null);
      fetchParcels(); // Refresh list
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
        fetchParcels(); // Refresh list
      } catch (err) {
        setError('Failed to delete parcel.');
        console.error('Error deleting parcel:', err);
      }
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

  const filteredParcels = parcels.filter(parcel => {
    const matchesSearch = searchTerm === '' ||
      parcel.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.phoneNumber.includes(searchTerm);

    const matchesStatus = filterStatus === 'All' || parcel.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredParcels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredParcels.length / itemsPerPage);

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

      {filteredParcels.length === 0 ? (
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
              {currentItems.map((parcel) => (
                <tr key={parcel.id}>
                  <td>{parcel.trackingNumber}</td>
                  <td>{parcel.customerName}</td>
                  <td>{parcel.phoneNumber}</td>
                  <td>{parcel.deliveryAddress}</td>
                  <td>KES {parcel.parcelValue.toFixed(2)}</td>
                  <td><span className={`status-badge ${parcel.status.toLowerCase()}`}>{parcel.status}</span></td>
                  <td>{parcel.orderDate}</td>
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

      {/* Pagination Controls */}
      {filteredParcels.length > itemsPerPageOptions[0] && (
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

// Parcel Modal Component
const ParcelModal = ({ parcel, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    deliveryAddress: '',
    parcelDescription: '',
    parcelValue: '',
    orderDate: '',
    status: 'Pending',
    notes: '',
    newDeliveryDate: '', // For postponed status
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (parcel) {
      setFormData({
        customerName: parcel.customerName || '',
        phoneNumber: parcel.phoneNumber || '',
        deliveryAddress: parcel.deliveryAddress || '',
        parcelDescription: parcel.parcelDescription || '',
        parcelValue: parcel.parcelValue || '',
        orderDate: parcel.orderDate || '',
        status: parcel.status || 'Pending',
        notes: parcel.notes || '',
        newDeliveryDate: '', // Not stored in parcel directly, used for update
      });
    } else {
      // Set defaults for new parcel
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        orderDate: today,
      }));
    }
  }, [parcel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.customerName) errors.customerName = 'Customer Name is required';
    if (!formData.phoneNumber) errors.phoneNumber = 'Phone Number is required';
    if (!formData.deliveryAddress) errors.deliveryAddress = 'Delivery Address is required';
    if (!formData.parcelValue || isNaN(formData.parcelValue) || parseFloat(formData.parcelValue) <= 0) {
      errors.parcelValue = 'Valid Parcel Value is required';
    }
    if (formData.status === 'Postponed' && !formData.newDeliveryDate) {
      errors.newDeliveryDate = 'New Delivery Date is required for postponed parcels';
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
      parcelValue: parseFloat(formData.parcelValue),
      // Logic for postponed status handling will be in the backend or a service
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
            <label htmlFor="customerName">Customer Name *</label>
            <input type="text" id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} />
            {formErrors.customerName && <p className="form-error">{formErrors.customerName}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number *</label>
            <input type="text" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
            {formErrors.phoneNumber && <p className="form-error">{formErrors.phoneNumber}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="deliveryAddress">Delivery Address *</label>
            <textarea id="deliveryAddress" name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange}></textarea>
            {formErrors.deliveryAddress && <p className="form-error">{formErrors.deliveryAddress}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="parcelDescription">Parcel Description</label>
            <input type="text" id="parcelDescription" name="parcelDescription" value={formData.parcelDescription} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="parcelValue">Parcel Value *</label>
            <input type="number" id="parcelValue" name="parcelValue" value={formData.parcelValue} onChange={handleChange} step="0.01" />
            {formErrors.parcelValue && <p className="form-error">{formErrors.parcelValue}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="orderDate">Order Date</label>
            <input type="date" id="orderDate" name="orderDate" value={formData.orderDate} onChange={handleChange} />
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
          {formData.status === 'Postponed' && (
            <div className="form-group">
              <label htmlFor="newDeliveryDate">New Delivery Date *</label>
              <input type="date" id="newDeliveryDate" name="newDeliveryDate" value={formData.newDeliveryDate} onChange={handleChange} />
              {formErrors.newDeliveryDate && <p className="form-error">{formErrors.newDeliveryDate}</p>}
            </div>
          )}
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
