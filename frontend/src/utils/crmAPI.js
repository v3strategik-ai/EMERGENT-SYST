import api from './api';

export const crmAPI = {
  // Leads
  createLead: (data) => api.post('/crm/leads', data),
  getLeads: () => api.get('/crm/leads'),
  updateLead: (id, data) => api.put(`/crm/leads/${id}`, data),
  deleteLead: (id) => api.delete(`/crm/leads/${id}`),
};

export const workflowAPI = {
  createWorkflow: (data) => api.post('/automation/workflows', data),
  getWorkflows: () => api.get('/automation/workflows'),
  updateWorkflow: (id, data) => api.put(`/automation/workflows/${id}`, data),
  deleteWorkflow: (id) => api.delete(`/automation/workflows/${id}`),
};

export const quoteAPI = {
  createQuote: (data) => api.post('/cpq/quotes', data),
  getQuotes: () => api.get('/cpq/quotes'),
  updateQuote: (id, data) => api.put(`/cpq/quotes/${id}`, data),
  deleteQuote: (id) => api.delete(`/cpq/quotes/${id}`),
};

export const documentAPI = {
  createDocument: (data) => api.post('/documents', data),
  getDocuments: () => api.get('/documents'),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
};

export const paymentAPI = {
  createTransaction: (data) => api.post('/payments/transactions', data),
  getTransactions: () => api.get('/payments/transactions'),
};

export const salesAPI = {
  createDeal: (data) => api.post('/sales/deals', data),
  getDeals: () => api.get('/sales/deals'),
  updateDeal: (id, data) => api.put(`/sales/deals/${id}`, data),
  deleteDeal: (id) => api.delete(`/sales/deals/${id}`),
};

export const financeAPI = {
  createReport: (data) => api.post('/finance/reports', data),
  getReports: () => api.get('/finance/reports'),
  updateReport: (id, data) => api.put(`/finance/reports/${id}`, data),
  deleteReport: (id) => api.delete(`/finance/reports/${id}`),
};

export const analyticsAPI = {
  createDashboard: (data) => api.post('/analytics/dashboards', data),
  getDashboards: () => api.get('/analytics/dashboards'),
  getAnalyticsData: (type) => api.get(`/analytics/data/${type}`),
};
