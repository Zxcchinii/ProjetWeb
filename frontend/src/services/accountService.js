import api from './api';

const accountService = {
  getAccounts: async () => {
    const response = await api.get('/accounts');
    return response.data;
  },
  getAccountDetails: async (id) => {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  },
  createAccount: async (type) => {
    const response = await api.post('/accounts', { type });
    return response.data;
  },
  deleteAccount: async (id) => {
    const response = await api.delete(`/accounts/${id}`);
    return response.data;
  },
  updateAccount: async (id, data) => {
    const response = await api.patch(`/accounts/${id}`, data);
    return response.data;
  }
};
export default accountService;