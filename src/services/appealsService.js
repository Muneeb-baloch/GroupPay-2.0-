// ============================================================
// Appeals Service — group appeals management
// ============================================================

import { API_ENDPOINTS, apiCall } from '../config/api';

export const appealsService = {
  // List all appeals for the current user (optionally filter by groupId)
  getAppeals: (token, { groupId } = {}) => {
    const params = new URLSearchParams();
    if (groupId) params.append('groupId', String(groupId));
    const qs = params.toString();
    return apiCall(`${API_ENDPOINTS.appeals}${qs ? '?' + qs : ''}`, 'GET', null, token);
  },

  getAppealById: (token, id) =>
    apiCall(API_ENDPOINTS.appealById(id), 'GET', null, token),

  // Submit a new appeal (group_id + message required)
  createAppeal: (token, { group_id, message, attachment_url }) =>
    apiCall(API_ENDPOINTS.appeals, 'POST', { group_id, message, ...(attachment_url ? { attachment_url } : {}) }, token),

  // Update appeal — admin can update status/comment; sender can update message while OPEN
  updateAppeal: (token, id, { message, status, admin_comment }) =>
    apiCall(API_ENDPOINTS.appealById(id), 'PATCH', {
      ...(message      !== undefined ? { message }       : {}),
      ...(status       !== undefined ? { status }        : {}),
      ...(admin_comment !== undefined ? { admin_comment } : {}),
    }, token),

  // Cancel/delete appeal (owner only, OPEN status)
  deleteAppeal: (token, id) =>
    apiCall(API_ENDPOINTS.appealById(id), 'DELETE', null, token),
};
