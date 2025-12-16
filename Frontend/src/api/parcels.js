// src/api/parcels.js
// This is a dummy API for demonstration purposes.
// In a real application, these would be actual API calls to a backend.

let DUMMY_PARCELS = [
  {
    id: 'JC001',
    trackingNumber: 'JC001',
    customerName: 'Alice Smith',
    phoneNumber: '123-456-7890',
    deliveryAddress: '123 Main St, Anytown, USA',
    parcelDescription: 'Electronics package',
    parcelValue: 150.00,
    codAmount: 0.00, // Added COD field
    codCollected: false, // Added COD field
    orderDate: '2025-11-20',
    expectedDeliveryDate: '2025-11-28',
    actualDeliveryDate: null,
    status: 'Pending',
    notes: 'Fragile item',
  },
  {
    id: 'JC002',
    trackingNumber: 'JC002',
    customerName: 'Bob Johnson',
    phoneNumber: '098-765-4321',
    deliveryAddress: '456 Oak Ave, Otherville, USA',
    parcelDescription: 'Documents',
    parcelValue: 25.50,
    codAmount: 25.50, // Added COD field
    codCollected: true, // Added COD field
    orderDate: '2025-11-15',
    expectedDeliveryDate: '2025-11-22',
    actualDeliveryDate: '2025-11-21',
    status: 'Paid',
    notes: '',
  },
  {
    id: 'JC003',
    trackingNumber: 'JC003',
    customerName: 'Charlie Brown',
    phoneNumber: '555-123-4567',
    deliveryAddress: '789 Pine Ln, Somewhere, USA',
    parcelDescription: 'Clothing',
    parcelValue: 75.00,
    codAmount: 75.00, // Added COD field
    codCollected: false, // Added COD field
    orderDate: '2025-11-10',
    expectedDeliveryDate: '2025-11-18',
    actualDeliveryDate: null,
    status: 'Overdue',
    notes: 'Customer not available on first attempt.',
  },
  {
    id: 'JC004',
    trackingNumber: 'JC004',
    customerName: 'Diana Prince',
    phoneNumber: '111-222-3333',
    deliveryAddress: '101 Amazon Way, Themyscira',
    parcelDescription: 'Gadgets',
    parcelValue: 500.00,
    codAmount: 0.00, // Added COD field
    codCollected: false, // Added COD field
    orderDate: '2025-11-22',
    expectedDeliveryDate: '2025-11-30',
    actualDeliveryDate: null,
    status: 'Postponed',
    notes: 'Customer requested later delivery.',
  },
  {
    id: 'JC005',
    trackingNumber: 'JC005',
    customerName: 'Eve Adams',
    phoneNumber: '444-555-6666',
    deliveryAddress: '202 Elm St, Villageton, USA',
    parcelDescription: 'Books',
    parcelValue: 40.00,
    codAmount: 40.00, // Added COD field
    codCollected: false, // Added COD field
    orderDate: '2025-11-25',
    expectedDeliveryDate: '2025-12-02',
    actualDeliveryDate: null,
    status: 'Pending',
    notes: '',
  },
];

export const getParcels = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(DUMMY_PARCELS);
    }, 500);
  });
};

export const getParcelById = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const parcel = DUMMY_PARCELS.find((p) => p.id === id);
      if (parcel) {
        resolve(parcel);
      } else {
        throw new Error('Parcel not found');
      }
    }, 300);
  });
};

export const addParcel = async (newParcel) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const id = `JC${String(DUMMY_PARCELS.length + 1).padStart(3, '0')}`;
      const parcelWithId = { ...newParcel, id, trackingNumber: id };
      DUMMY_PARCELS.push(parcelWithId);
      resolve(parcelWithId);
    }, 500);
  });
};

export const updateParcel = async (id, updatedParcel) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = DUMMY_PARCELS.findIndex((p) => p.id === id);
      if (index !== -1) {
        DUMMY_PARCELS[index] = { ...DUMMY_PARCELS[index], ...updatedParcel };
        resolve(DUMMY_PARCELS[index]);
      } else {
        throw new Error('Parcel not found');
      }
    }, 500);
  });
};

export const deleteParcel = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const initialLength = DUMMY_PARCELS.length;
      DUMMY_PARCELS = DUMMY_PARCELS.filter((p) => p.id !== id);
      if (DUMMY_PARCELS.length < initialLength) {
        resolve({ success: true });
      } else {
        throw new Error('Parcel not found');
      }
    }, 500);
  });
};
