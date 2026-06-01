// ============================================================
// GroupPay API Configuration
// Backend: Express + Node.js | Database: Supabase Postgres
// Auth: JWT Identity Provider
// ============================================================

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || '';

export const API_ENDPOINTS = {
  login:          `${BASE_URL}/api/up/auth/login`,
  signup:         `${BASE_URL}/api/up/auth/signup`,
  verifyEmail:    `${BASE_URL}/api/up/auth/verify-email`,
  forgotPassword: `${BASE_URL}/api/up/auth/forgot-password`,
  resetPassword:  `${BASE_URL}/api/up/auth/reset-password`,
  profile:        `${BASE_URL}/api/up/auth/profile`,
  // Groups
  groups:              `${BASE_URL}/api/up/groups`,
  groupById:           (id) => `${BASE_URL}/api/up/groups/${id}`,
  updateGroup:         (id) => `${BASE_URL}/api/up/groups/${id}`,
  toggleGroupStar:     (id) => `${BASE_URL}/api/up/groups/${id}/star`,
  leaveGroup:          (id) => `${BASE_URL}/api/up/groups/${id}/leave`,
  // Invites
  invitesReceived:     `${BASE_URL}/api/up/invites/received`,
  invitesSent:         `${BASE_URL}/api/up/invites/sent`,
  sendInvite:          `${BASE_URL}/api/up/invites`,
  cancelSentInvite:    (id) => `${BASE_URL}/api/up/invites/${id}`,
  updateInviteStatus:  (id) => `${BASE_URL}/api/up/invites/${id}/status`,
  // Deposits
  deposits:            `${BASE_URL}/api/up/deposits`,
  updateDepositStatus: (id) => `${BASE_URL}/api/up/deposits/${id}/status`,
  // Transactions
  transactions:        `${BASE_URL}/api/up/transactions`,
  transactionSummary:  (groupId) => `${BASE_URL}/api/up/transactions/summary/${groupId}`,
  // Scenes
  scenes:              `${BASE_URL}/api/up/scenes`,
  sceneById:           (id) => `${BASE_URL}/api/up/scenes/${id}`,
  calculateScene:      `${BASE_URL}/api/up/scenes/calculate`,
  // Files
  fileUpload:          `${BASE_URL}/api/up/files/upload`,
  // Notifications
  notifications:           `${BASE_URL}/api/up/notifications`,
  markNotificationRead:    (id) => `${BASE_URL}/api/up/notifications/${id}/read`,
  markAllNotificationsRead: `${BASE_URL}/api/up/notifications/read-all`,
};

// Generic API call helper
export const apiCall = async (url, method = 'GET', body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const options = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  };

  const response = await fetch(url, options);

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Server returned an invalid response');
  }

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || data?.msg || `Request failed (${response.status})`
    );
  }

  return data;
};
