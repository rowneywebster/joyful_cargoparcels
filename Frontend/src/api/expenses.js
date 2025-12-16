// src/api/expenses.js
// This is a dummy API for demonstration purposes.
// In a real application, these would be actual API calls to a backend.

let DUMMY_EXPENSES = [
  {
    id: 'EXP001',
    date: '2025-11-20',
    category: 'Stock Purchase',
    description: 'Purchase of new inventory for delivery',
    amount: 500.00,
    paymentMethod: 'Bank Transfer',
    reference: 'INV-2025-001',
    addedBy: 'Admin User',
    notes: 'Bulk purchase of electronics',
  },
  {
    id: 'EXP002',
    date: '2025-11-21',
    category: 'Rider Payout',
    description: 'Weekly payout for John Doe',
    amount: 120.00,
    paymentMethod: 'Cash',
    reference: 'RIDER-JD-WK47',
    addedBy: 'Admin User',
    notes: '',
  },
  {
    id: 'EXP003',
    date: '2025-11-22',
    category: 'Packaging',
    description: 'Purchase of bubble wrap and boxes',
    amount: 45.50,
    paymentMethod: 'Card',
    reference: 'PACK-SUP-1122',
    addedBy: 'Admin User',
    notes: '',
  },
  {
    id: 'EXP004',
    date: '2025-10-15', // Last month expense
    category: 'Courier Freight',
    description: 'Monthly freight charges from partner',
    amount: 300.00,
    paymentMethod: 'Bank Transfer',
    reference: 'FREIGHT-OCT',
    addedBy: 'Admin User',
    notes: 'October charges',
  },
  {
    id: 'EXP005',
    date: '2025-11-25',
    category: 'Other',
    description: 'Office supplies purchase',
    amount: 20.00,
    paymentMethod: 'Cash',
    reference: 'OFFICE-SUP-1125',
    addedBy: 'Admin User',
    notes: '',
  },
];

export const getExpenses = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(DUMMY_EXPENSES);
    }, 500);
  });
};

export const getExpenseById = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const expense = DUMMY_EXPENSES.find((e) => e.id === id);
      if (expense) {
        resolve(expense);
      } else {
        throw new Error('Expense not found');
      }
    }, 300);
  });
};

export const addExpense = async (newExpense) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const id = `EXP${String(DUMMY_EXPENSES.length + 1).padStart(3, '0')}`;
      const expenseWithId = { ...newExpense, id };
      DUMMY_EXPENSES.push(expenseWithId);
      resolve(expenseWithId);
    }, 500);
  });
};

export const updateExpense = async (id, updatedExpense) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = DUMMY_EXPENSES.findIndex((e) => e.id === id);
      if (index !== -1) {
        DUMMY_EXPENSES[index] = { ...DUMMY_EXPENSES[index], ...updatedExpense };
        resolve(DUMMY_EXPENSES[index]);
      } else {
        throw new Error('Expense not found');
      }
    }, 500);
  });
};

export const deleteExpense = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const initialLength = DUMMY_EXPENSES.length;
      DUMMY_EXPENSES = DUMMY_EXPENSES.filter((e) => e.id !== id);
      if (DUMMY_EXPENSES.length < initialLength) {
        resolve({ success: true });
      } else {
        throw new Error('Expense not found');
      }
    }, 500);
  });
};
