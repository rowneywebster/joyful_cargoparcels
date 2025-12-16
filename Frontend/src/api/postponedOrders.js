// src/api/postponedOrders.js
// This is a dummy API for demonstration purposes.
// In a real application, these would be actual API calls to a backend.

let DUMMY_POSTPONED_ORDERS = [
  {
    id: 'PO001',
    trackingNumber: 'JC004',
    customerName: 'Diana Prince',
    phoneNumber: '111-222-3333',
    originalDeliveryDate: '2025-11-30',
    newDeliveryDate: '2025-12-05',
    postponeReason: 'Customer requested later delivery.',
  },
  {
    id: 'PO002',
    trackingNumber: 'JC006',
    customerName: 'Frank Green',
    phoneNumber: '777-888-9999',
    originalDeliveryDate: '2025-11-28',
    newDeliveryDate: '2025-12-01',
    postponeReason: 'Weather delay.',
  },
  {
    id: 'PO003',
    trackingNumber: 'JC007',
    customerName: 'Grace Hopper',
    phoneNumber: '123-123-1234',
    originalDeliveryDate: '2025-12-01',
    newDeliveryDate: '2025-12-08',
    postponeReason: 'Recipient unavailable.',
  },
];

export const getPostponedOrders = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(DUMMY_POSTPONED_ORDERS);
    }, 500);
  });
};

export const getPostponedOrderById = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const order = DUMMY_POSTPONED_ORDERS.find((o) => o.id === id);
      if (order) {
        resolve(order);
      } else {
        throw new Error('Postponed order not found');
      }
    }, 300);
  });
};

export const addPostponedOrder = async (newOrder) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const id = `PO${String(DUMMY_POSTPONED_ORDERS.length + 1).padStart(3, '0')}`;
      const orderWithId = { ...newOrder, id };
      DUMMY_POSTPONED_ORDERS.push(orderWithId);
      resolve(orderWithId);
    }, 500);
  });
};

export const updatePostponedOrder = async (id, updatedOrder) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = DUMMY_POSTPONED_ORDERS.findIndex((o) => o.id === id);
      if (index !== -1) {
        DUMMY_POSTPONED_ORDERS[index] = { ...DUMMY_POSTPONED_ORDERS[index], ...updatedOrder };
        resolve(DUMMY_POSTPONED_ORDERS[index]);
      } else {
        throw new Error('Postponed order not found');
      }
    }, 500);
  });
};

export const deletePostponedOrder = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const initialLength = DUMMY_POSTPONED_ORDERS.length;
      DUMMY_POSTPONED_ORDERS = DUMMY_POSTPONED_ORDERS.filter((o) => o.id !== id);
      if (DUMMY_POSTPONED_ORDERS.length < initialLength) {
        resolve({ success: true });
      } else {
        throw new Error('Postponed order not found');
      }
    }, 500);
  });
};
