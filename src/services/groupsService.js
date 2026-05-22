// ============================================================
// Groups Service — all group-related API calls
// ============================================================

import { API_ENDPOINTS, apiCall } from '../config/api';
import { extractGroupsFromResponse, normalizeGroup } from '../utils/helpers';

export const groupsService = {
  /**
   * Fetch all groups for the current user
   * Returns normalized groups split into admin/member
   */
  fetchGroups: async (token) => {
    const data = await apiCall(API_ENDPOINTS.groups, 'GET', null, token);
    const raw = extractGroupsFromResponse(data);

    const adminGroups = raw.filter(g => {
      const role = g.role || g.user_role;
      return !role || role === 'admin' || role === 'owner';
    });

    const memberGroups = raw.filter(g => {
      const role = g.role || g.user_role;
      return role && role !== 'admin' && role !== 'owner';
    });

    return {
      your: adminGroups.map((g, i) => normalizeGroup(g, i)),
      member: memberGroups.map((g, i) => normalizeGroup(g, i)),
      all: raw.map((g, i) => normalizeGroup(g, i)),
    };
  },

  /**
   * Create a new group
   */
  createGroup: (token, name) =>
    apiCall(API_ENDPOINTS.groups, 'POST', { name }, token),

  /**
   * Get a single group by ID
   */
  getGroup: (token, id) =>
    apiCall(API_ENDPOINTS.groupById(id), 'GET', null, token),

  /**
   * Update a group
   */
  updateGroup: (token, id, { name, is_active }) =>
    apiCall(API_ENDPOINTS.updateGroup(id), 'PATCH', { name, is_active }, token),

  /**
   * Toggle star/favorite status
   */
  toggleStar: (token, id, starred) =>
    apiCall(API_ENDPOINTS.toggleGroupStar(id), 'POST', { starred }, token),

  /**
   * Leave a group
   */
  leaveGroup: (token, id) =>
    apiCall(API_ENDPOINTS.leaveGroup(id), 'DELETE', null, token),
};
