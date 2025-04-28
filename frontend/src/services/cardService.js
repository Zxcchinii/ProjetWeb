import api from './api';

const cardService = {
  // Get all cards
  getAll: async () => {
    const response = await api.get('/cards');
    return response.data;
  },
  // Create a new card
  create: async (cardData) => {
    const response = await api.post('/cards', cardData);
    return response.data;
  },
  // Update card status
  updateStatus: async (id, status) => {
    const response = await api.patch(`/cards/${id}/status`, { status });
    return response.data;
  },
  // Update card limit
  updateLimit: async (id, limit) => {
    const response = await api.patch(`/cards/${id}/limit`, { daily_limit: limit });
    return response.data;
  },
  // Delete a card - Add this method
  deleteCard: async (id) => {
    try {
      const response = await api.delete(`/cards/${id}`);
      return response.data;
    } catch (error) {
      console.error('API error in deleteCard:', error.response || error.message || error);
      throw error; // Re-throw to be handled by the component
    }
  }
};

export default cardService;