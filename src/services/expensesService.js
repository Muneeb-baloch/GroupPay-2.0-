import { API_ENDPOINTS, apiCall } from '../config/api';

export const expensesService = {
  getExpenses: (token, { page = 1, pageSize = 20, type, startDate, endDate } = {}) => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (type) params.append('type', type);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiCall(`${API_ENDPOINTS.expenses}?${params.toString()}`, 'GET', null, token);
  },

  getStats: (token, { startDate, endDate } = {}) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const qs = params.toString();
    return apiCall(`${API_ENDPOINTS.expenseStats}${qs ? '?' + qs : ''}`, 'GET', null, token);
  },

  getExpenseById: (token, id) =>
    apiCall(API_ENDPOINTS.expenseById(id), 'GET', null, token),

  createExpense: (token, { amount, type, location, note, date_time, img_url = [] }) =>
    apiCall(API_ENDPOINTS.expenses, 'POST', { amount, type, location, note, date_time, img_url }, token),

  updateExpense: (token, id, { amount, type, location, note, date_time, img_url = [] }) =>
    apiCall(API_ENDPOINTS.expenseById(id), 'PUT', { amount, type, location, note, date_time, img_url }, token),

  deleteExpense: (token, id) =>
    apiCall(API_ENDPOINTS.expenseById(id), 'DELETE', null, token),
};
