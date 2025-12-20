import api from './api';

export const getPostponedOrders = async () => {
  const response = await api.get('/postponed');
  return response.data;
};

export const getPostponedOrder = async (id) => {
  const response = await api.get(`/postponed/${id}`);
  return response.data;
};

export const updatePostponedOrder = async (id, orderData) => {
  const response = await api.put(`/postponed/${id}`, orderData);
  return response.data;
};

export const resolvePostponedOrder = async (id) => {
  const response = await api.patch(`/postponed/${id}/resolve`);
  return response.data;
};

export const getPostponedOrderStats = async () => {
  const response = await api.get('/postponed/stats');
  return response.data;
};
