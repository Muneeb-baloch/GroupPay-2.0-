// ============================================================
// Deposits Service — deposit request management
// ============================================================

import { API_ENDPOINTS, apiCall } from '../config/api';

export const depositsService = {
  getDeposits: (token, { page = 1, pageSize = 20, groupId, status } = {}) => {
    const params = new URLSearchParams({ page, pageSize });

    if (groupId != null && groupId !== '') {
      params.append('groupId', groupId);
    }

    if (status) {
      params.append('status', status);
    }

    return apiCall(`${API_ENDPOINTS.deposits}?${params.toString()}`, 'GET', null, token);
  },

  createDeposit: (token, payload) =>
    apiCall(API_ENDPOINTS.deposits, 'POST', payload, token),

  updateDepositStatus: (token, id, status) =>
    apiCall(API_ENDPOINTS.updateDepositStatus(id), 'PATCH', { status }, token),
};