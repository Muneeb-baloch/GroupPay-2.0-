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

  getDepositById: (token, id) =>
    apiCall(API_ENDPOINTS.depositById(id), 'GET', null, token),

  createDeposit: (token, payload) =>
    apiCall(API_ENDPOINTS.deposits, 'POST', payload, token),

  updateDeposit: (token, id, { amount, deposit_type, description, attachment_url }) =>
    apiCall(API_ENDPOINTS.updateDeposit(id), 'PATCH', { amount, deposit_type, description, attachment_url }, token),

  updateDepositStatus: (token, id, status) =>
    apiCall(API_ENDPOINTS.updateDepositStatus(id), 'PATCH', { status }, token),
};