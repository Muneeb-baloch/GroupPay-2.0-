// ============================================================
// GroupPay API Configuration
// Backend: Express + Node.js | Database: Supabase Postgres
// Auth: JWT Identity Provider
// ============================================================

export const BASE_URL = 'http://grouppay-api.yousuf-dev.com';

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

  console.log(`API [${method}] ${url} → ${response.status}:`, JSON.stringify(data));

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || data?.msg || `Request failed (${response.status})`
    );
  }

  return data;
};
