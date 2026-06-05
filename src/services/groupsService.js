// ============================================================
// Groups Service — all group-related API calls
// ============================================================

import { API_ENDPOINTS, apiCall } from '../config/api';
import { extractGroupsFromResponse, normalizeGroup } from '../utils/helpers';

const toBool = (v) => v === true || v === 1 || v === '1' || v === 'true';

const isAdminRoleText = (role) => {
  const value = (role || '').toString().toLowerCase();
  return value === 'admin' || value === 'owner' || value === 'creator';
};

const hasRoleText = (role) => {
  const value = (role || '').toString().trim();
  return value.length > 0;
};

const isAdminForGroup = (rawGroup, currentUserId) => {
  const roleText = rawGroup?.role || rawGroup?.user_role || rawGroup?.member_role || rawGroup?.my_role;
  if (hasRoleText(roleText)) return isAdminRoleText(roleText);

  if (rawGroup?.is_admin !== undefined || rawGroup?.is_owner !== undefined) {
    return toBool(rawGroup?.is_admin) || toBool(rawGroup?.is_owner);
  }

  const creatorId =
    rawGroup?.created_by ||
    rawGroup?.creator_id ||
    rawGroup?.owner_id ||
    rawGroup?.admin_id ||
    rawGroup?.group?.created_by ||
    rawGroup?.group?.creator_id ||
    rawGroup?.group?.owner_id;

  if (currentUserId && creatorId != null) {
    return String(creatorId) === String(currentUserId);
  }

  const participants = rawGroup?.participants || rawGroup?.members || rawGroup?.group?.participants || [];
  if (currentUserId && Array.isArray(participants)) {
    const me = participants.find((p) => String(p?.person_id || p?.person?.id || p?.id) === String(currentUserId));
    if (me) {
      const pRole = me?.role || me?.user_role;
      if (hasRoleText(pRole)) return isAdminRoleText(pRole);
      if (me?.is_admin !== undefined || me?.is_owner !== undefined) {
        return toBool(me?.is_admin) || toBool(me?.is_owner);
      }
      return false;
    }
  }

  return false;
};

const isVisibleGroup = (rawGroup) => {
  const status = (rawGroup?.status || rawGroup?.group_status || '').toString().toLowerCase();
  const deleted =
    toBool(rawGroup?.is_deleted) ||
    toBool(rawGroup?.deleted) ||
    rawGroup?.deleted_at != null ||
    rawGroup?.group?.deleted_at != null;
  const inactive = rawGroup?.is_active === false || status === 'inactive' || status === 'deleted' || status === 'archived';

  return !deleted && !inactive;
};

export const groupsService = {
  /**
   * Fetch all groups for the current user
   * Returns normalized groups split into admin/member
   */
  fetchGroups: async (token, currentUserId = null) => {
    const data = await apiCall(API_ENDPOINTS.groups, 'GET', null, token);
    const raw = extractGroupsFromResponse(data).filter(isVisibleGroup);
    if (raw.length > 0) {
      console.warn('[fetchGroups] first group raw keys:', Object.keys(raw[0]));
      console.warn('[fetchGroups] first group sample:', JSON.stringify({
        name: raw[0]?.name || raw[0]?.group_name,
        participant_count: raw[0]?.participant_count,
        members_count: raw[0]?.members_count,
        member_count: raw[0]?.member_count,
        participants_len: (raw[0]?.participants || raw[0]?.members || []).length,
      }));
    }
    const normalized = raw.map((g, i) => {
      const normalizedGroup = normalizeGroup(g, i);
      const admin = isAdminForGroup(g, currentUserId);
      return {
        ...normalizedGroup,
        role: admin ? 'admin' : 'member',
      };
    });

    const adminGroups = normalized.filter((g) => g.role === 'admin');
    const memberGroups = normalized.filter((g) => g.role !== 'admin');

    return {
      your: adminGroups,
      member: memberGroups,
      all: normalized,
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

  /**
   * Get active members for a group (dedicated endpoint — more reliable than getGroup participants)
   */
  getGroupMembers: (token, id) =>
    apiCall(API_ENDPOINTS.groupMembers(id), 'GET', null, token),

  /**
   * Get current user's net balance in a specific group
   * Positive = owed to them, negative = they owe
   */
  getMyGroupBalance: (token, groupId) =>
    apiCall(API_ENDPOINTS.groupMyBalance(groupId), 'GET', null, token),

  /**
   * Change a member's role (admin only)
   */
  changeMemberRole: (token, groupId, personId, role) =>
    apiCall(API_ENDPOINTS.groupMemberRole(groupId, personId), 'PATCH', { role }, token),
};
