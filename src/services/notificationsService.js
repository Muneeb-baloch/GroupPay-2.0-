// ============================================================
// Notifications Service
// ============================================================

import { API_ENDPOINTS, apiCall } from '../config/api';

export const notificationsService = {
  getNotifications: (token, { page = 1, pageSize = 20 } = {}) => {
    const params = new URLSearchParams({ page, pageSize });
    return apiCall(`${API_ENDPOINTS.notifications}?${params.toString()}`, 'GET', null, token);
  },

  markAsRead: (token, id) =>
    apiCall(API_ENDPOINTS.markNotificationRead(id), 'PATCH', null, token),

  markAllAsRead: (token) =>
    apiCall(API_ENDPOINTS.markAllNotificationsRead, 'PATCH', null, token),
};
