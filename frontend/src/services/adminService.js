import api from './api';

const adminService = {
  // Dashboard stats
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  
  // User management
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  
  getUserDetails: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },
  
  // Account management
  getAccounts: async () => {
    const response = await api.get('/admin/accounts');
    return response.data;
  },
  
  getAccountDetails: async (accountId) => {
    const response = await api.get(`/admin/accounts/${accountId}`);
    return response.data;
  },
  
  creditAccount: async (accountId, amount) => {
    const response = await api.post(`/admin/accounts/${accountId}/credit`, { amount });
    return response.data;
  },
  
  debitAccount: async (accountId, amount) => {
    const response = await api.post(`/admin/accounts/${accountId}/debit`, { amount });
    return response.data;
  },
  
  deleteAccount: async (accountId) => {
    const response = await api.delete(`/admin/accounts/${accountId}`);
    return response.data;
  },

  // Transaction management
  getTransactions: async () => {
    const response = await api.get('/admin/transactions');
    return response.data;
  },

  cancelTransaction: async (transactionId) => {
    const response = await api.post(`/admin/transactions/${transactionId}/cancel`);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

promoteToAdmin: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/promote`, {
        role: 'admin'
    });
    return response.data;
},
};

export default adminService;