import { API_ENDPOINTS, apiCall } from '../config/api';

export const balancesService = {
  getAllGroupBalances: (token) =>
    apiCall(API_ENDPOINTS.balancesGroups, 'GET', null, token),

  getGroupBalance: (token, groupId) =>
    apiCall(API_ENDPOINTS.balanceByGroup(groupId), 'GET', null, token),
};
