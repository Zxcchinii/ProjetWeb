import api from './api';

const transactionService = {
  getTransactions: async () => {
    const response = await api.get('/transactions');
    return response.data;
  },
  
  getTransaction: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },
  
  createTransaction: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  }
};

export default transactionService;