import React, { useState, useEffect, useCallback } from 'react';
import './ExpensesPage.css';
import { getExpenses, createExpense, updateExpense, deleteExpense, getExpenseCategories } from '../api/expenses';
import { useAuth } from '../hooks/useAuth';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDateRange, setFilterDateRange] = useState('ThisMonth');
  const { user } = useAuth();

  useEffect(() => {
    
    fetchData();
  }, [fetchData]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [expensesData, categoriesData] = await Promise.all([
        getExpenses({ category: filterCategory, date_range: filterDateRange }),
        getExpenseCategories(),
      ]);
      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (err) {
      setError('Failed to fetch expenses.');
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterDateRange, setExpenses, setCategories, setLoading, setError]);

  const handleAddEditExpense = async (expenseData) => {
    setError(null);
    try {
      if (currentExpense) {
        await updateExpense(currentExpense.id, expenseData);
      } else {
        await createExpense({ ...expenseData, addedBy: user?.name || 'Unknown' });
      }
      setIsModalOpen(false);
      setCurrentExpense(null);
      fetchData();
    } catch (err) {
      setError('Failed to save expense.');
      console.error('Error saving expense:', err);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setError(null);
      try {
        await deleteExpense(id);
        fetchData();
      } catch (err) {
        setError('Failed to delete expense.');
        console.error('Error deleting expense:', err);
      }
    }
  };

  const openAddModal = () => {
    setCurrentExpense(null);
    setIsModalOpen(true);
  };

  const openEditModal = (expense) => {
    setCurrentExpense(expense);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentExpense(null);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (loading) {
    return <div className="loading-message">Loading expenses...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="expenses-page-container">
      <h1 className="expenses-title">Expenses</h1>

      <div className="top-action-bar">
        <button className="primary-button" onClick={openAddModal}>Add New Expense</button>
        <select
          className="filter-select"
          value={filterDateRange}
          onChange={(e) => setFilterDateRange(e.target.value)}
        >
          <option value="ThisMonth">This Month</option>
          <option value="LastMonth">Last Month</option>
          <option value="ThisYear">This Year</option>
          <option value="All">All Time</option>
        </select>
        <select
          className="filter-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <button className="secondary-button">Export to CSV</button>
      </div>

      <div className="summary-cards">
        <div className="card">
          <h3>Total Expenses ({filterDateRange})</h3>
          <p className="metric-value">KES {totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <p className="no-expenses-message">No expenses found for the selected filters.</p>
      ) : (
        <div className="table-responsive">
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Reference</th>
                <th>Added By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.date}</td>
                  <td><span className={`category-tag ${expense.category.toLowerCase().replace(/\s/g, '-')}`}>{expense.category}</span></td>
                  <td>{expense.description}</td>
                  <td>KES {expense.amount.toFixed(2)}</td>
                  <td>{expense.payment_method}</td>
                  <td>{expense.reference || 'N/A'}</td>
                  <td>{expense.added_by}</td>
                  <td>
                    <button className="action-button edit" onClick={() => openEditModal(expense)}>Edit</button>
                    <button className="action-button delete" onClick={() => handleDeleteExpense(expense.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <ExpenseModal
          expense={currentExpense}
          onClose={closeModal}
          onSave={handleAddEditExpense}
          categories={categories}
        />
      )}
    </div>
  );
};

const ExpenseModal = ({ expense, onClose, onSave, categories }) => {
  const [formData, setFormData] = useState({
    date: '',
    category: categories[0]?.name || '',
    description: '',
    amount: '',
    payment_method: 'Cash',
    reference: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});


  useEffect(() => {
    if (expense) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        date: expense.date || '',
        category: expense.category || categories[0]?.name,
        description: expense.description || '',
        amount: expense.amount || '',
        payment_method: expense.payment_method || 'Cash',
        reference: expense.reference || '',
        notes: expense.notes || '',
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: today }));
    }
  }, [expense, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Valid Amount is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    onSave({ ...formData, amount: parseFloat(formData.amount) });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{expense ? 'Edit Expense' : 'Add New Expense'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} />
            {formErrors.date && <p className="form-error">{formErrors.date}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select id="category" name="category" value={formData.category} onChange={handleChange}>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            {formErrors.category && <p className="form-error">{formErrors.category}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange}></textarea>
            {formErrors.description && <p className="form-error">{formErrors.description}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="amount">Amount *</label>
            <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} step="0.01" />
            {formErrors.amount && <p className="form-error">{formErrors.amount}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="payment_method">Payment Method</label>
            <select id="payment_method" name="payment_method" value={formData.payment_method} onChange={handleChange}>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Card</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="reference">Receipt/Reference Number</label>
            <input type="text" id="reference" name="reference" value={formData.reference} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange}></textarea>
          </div>
          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button">Save Expense</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpensesPage;
