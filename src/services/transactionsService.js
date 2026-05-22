// ============================================================
// Transactions Service — group ledger and financial summary
// ============================================================

import { API_ENDPOINTS, apiCall } from '../config/api';

export const transactionsService = {
  /**
   * Get transactions (ledger)
   * Params: groupId, personId, page, pageSize
   */
  getTransactions: (token, { groupId, personId, page = 1, pageSize = 20 } = {}) => {
    const params = new URLSearchParams();
    if (groupId)  params.append('groupId', groupId);
    if (personId) params.append('personId', personId);
    params.append('page', page);
    params.append('pageSize', pageSize);
    return apiCall(`${API_ENDPOINTS.transactions}?${params.toString()}`, 'GET', null, token);
  },

  /**
   * Get group financial summary (who owes what)
   */
  getGroupSummary: (token, groupId) =>
    apiCall(API_ENDPOINTS.transactionSummary(groupId), 'GET', null, token),
};
