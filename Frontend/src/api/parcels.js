import api from './api';

export const getParcels = async (params) => {
  const response = await api.get('/parcels', { params });
  return response.data;
};

export const getParcel = async (id) => {
  const response = await api.get(`/parcels/${id}`);
  return response.data;
};

export const createParcel = async (parcelData) => {
  const response = await api.post('/parcels', parcelData);
  return response.data;
};

export const updateParcel = async (id, parcelData) => {
  const response = await api.put(`/parcels/${id}`, parcelData);
  return response.data;
};

export const updateParcelStatus = async (id, status) => {
  const response = await api.patch(`/parcels/${id}/status`, { status });
  return response.data;
};

export const deleteParcel = async (id) => {
  const response = await api.delete(`/parcels/${id}`);
  return response.data;
};

export const getOverdueParcels = async () => {
  const response = await api.get('/parcels/overdue');
  return response.data;
};

export const getParcelStats = async () => {
  const response = await api.get('/parcels/stats');
  return response.data;
};
