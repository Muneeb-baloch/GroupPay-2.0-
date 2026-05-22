// ============================================================
// Shared Helper Utilities
// ============================================================

import { COLORS } from '../constants/theme';

/**
 * Format a balance number to Rs currency string
 * e.g. 1234.56 → "+Rs 1,234.56"
 */
export const formatBalance = (balance) => {
  const isNegative = balance < 0;
  const formatted = Math.abs(balance).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? '-' : '+'}Rs ${formatted}`;
};

/**
 * Format a number as Rs currency (no sign)
 * e.g. 1234.56 → "Rs 1,234.56"
 */
export const formatCurrency = (amount) => {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `Rs ${formatted}`;
};

/**
 * Get status color for group/transaction status
 */
export const getStatusColor = (status) => {
  const colors = {
    active: COLORS.success,
    inactive: '#6b7280',
    pending: COLORS.warning,
    completed: COLORS.success,
    failed: COLORS.error,
  };
  return colors[status?.toLowerCase()] || '#6b7280';
};

/**
 * Format a date string to a readable format
 * e.g. "2026-05-22T09:49:30.054Z" → "May 22, 2026"
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'Recently';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recently';
  }
};

/**
 * Format a date string to relative time
 * e.g. "2026-05-22T09:49:30.054Z" → "2 hours ago"
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Recently';
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  } catch {
    return 'Recently';
  }
};

/**
 * Get initials from a full name
 * e.g. "Muneeb Ur Rehman" → "MU"
 */
export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

/**
 * Pick a color from the group colors palette by index
 */
export const getGroupColor = (index) => {
  return COLORS.groupColors[index % COLORS.groupColors.length];
};

/**
 * Normalize a group object from the API response
 */
export const normalizeGroup = (g, index = 0) => ({
  id: g.group_id || g.id,
  name: g.group_name || g.name || 'Unnamed Group',
  status: g.is_active === false ? 'inactive' : 'active',
  role: g.role || g.user_role || 'admin',
  members: g.participants?.length || g.member_count || 1,
  totalBalance: parseFloat(g.balance || g.total_balance || 0),
  lastActivity: formatRelativeTime(g.created_at || g.updated_at),
  memberInitials: (g.participants || []).slice(0, 3).map(p =>
    getInitials(p.person?.fullname || p.person?.username || 'U')
  ),
  color: g.color || getGroupColor(index),
  isFavorite: g.is_starred || false,
});

/**
 * Extract groups array from various API response shapes
 */
export const extractGroupsFromResponse = (data) => {
  if (Array.isArray(data?.data?.data)) return data.data.data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
};
