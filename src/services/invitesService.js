// ============================================================
// Invites Service — group invitation system
// ============================================================

import { API_ENDPOINTS, apiCall } from '../config/api';

export const invitesService = {
  /**
   * Get received invites for current user
   */
  getReceivedInvites: (token, { page = 1, pageSize = 20 } = {}) => {
    const params = new URLSearchParams({ page, pageSize });
    return apiCall(`${API_ENDPOINTS.invitesReceived}?${params.toString()}`, 'GET', null, token);
  },

  /**
   * Send a group invite
   * Body: { group_id, receiver_id }
   */
  sendInvite: (token, groupId, receiverId) =>
    apiCall(API_ENDPOINTS.sendInvite, 'POST', { group_id: groupId, receiver_id: receiverId }, token),

  /**
   * Accept or decline an invite
   * status: "ACCEPTED" | "DECLINED"
   */
  updateInviteStatus: (token, inviteId, status) =>
    apiCall(API_ENDPOINTS.updateInviteStatus(inviteId), 'PATCH', { status }, token),
};
