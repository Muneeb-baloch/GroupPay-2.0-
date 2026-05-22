// ============================================================
// Auth Service — all authentication API calls
// ============================================================

import { API_ENDPOINTS, apiCall } from '../config/api';

export const authService = {
  login: (email, password) =>
    apiCall(API_ENDPOINTS.login, 'POST', { email, password }),

  signup: (email, password, fullname, phone) =>
    apiCall(API_ENDPOINTS.signup, 'POST', { email, password, fullname, phone }),

  verifyEmail: (email, otp) =>
    apiCall(API_ENDPOINTS.verifyEmail, 'POST', { email, otp }),

  forgotPassword: (email) =>
    apiCall(API_ENDPOINTS.forgotPassword, 'POST', { email }),

  resetPassword: (token, newPassword) =>
    apiCall(API_ENDPOINTS.resetPassword, 'POST', { token, newPassword }),

  updateProfile: (token, { fullname, phone, username, profile_picture_url }) =>
    apiCall(API_ENDPOINTS.profile, 'PATCH', { fullname, phone, username, profile_picture_url }, token),
};
