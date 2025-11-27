export const chatbotApi = {
  sendMessage: async (message: string, conversationHistory: any[] = []) => {
    const response = await api.post('/chatbot/conversation', {
      message,
      conversationHistory
    });
    return response.data;
  },

  getContext: async () => {
    const response = await api.get('/chatbot/context');
    return response.data;
  },

  getSuggestions: async () => {
    const response = await api.get('/chatbot/suggestions');
    return response.data;
  }
};
