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

  resendOtp: (email) =>
    apiCall(API_ENDPOINTS.resendOtp, 'POST', { email }),

  forgotPassword: (email) =>
    apiCall(API_ENDPOINTS.forgotPassword, 'POST', { email }),

  resetPassword: (token, newPassword) =>
    apiCall(API_ENDPOINTS.resetPassword, 'POST', { token, newPassword }),

  getProfile: (token) =>
    apiCall(API_ENDPOINTS.profile, 'GET', null, token),

  updateProfile: (token, { fullname, phone, username, profile_picture_url }) =>
    apiCall(API_ENDPOINTS.profile, 'PATCH', { fullname, phone, username, profile_picture_url }, token),

  changePassword: (token, { currentPassword, newPassword }) =>
    apiCall(API_ENDPOINTS.changePassword, 'POST', { currentPassword, newPassword }, token),
};
