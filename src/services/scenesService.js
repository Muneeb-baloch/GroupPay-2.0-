import { API_ENDPOINTS, apiCall } from '../config/api';

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.scenes)) return value.scenes;
  if (value?.data && typeof value.data === 'object') return toArray(value.data);
  return [];
};

const extractScene = (payload) => payload?.data?.scene || payload?.scene || payload?.data || payload;

export const scenesService = {
  getScenes: (token, { page = 1, pageSize = 20, groupId, startDate, endDate, location } = {}) => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });

    if (groupId != null && groupId !== '') params.append('groupId', String(groupId));
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (location) params.append('location', location);

    return apiCall(`${API_ENDPOINTS.scenes}?${params.toString()}`, 'GET', null, token);
  },

  getSceneById: (token, id) => apiCall(API_ENDPOINTS.sceneById(id), 'GET', null, token),

  createScene: (token, payload) => apiCall(API_ENDPOINTS.scenes, 'POST', payload, token),

  updateScene: (token, id, payload) => apiCall(API_ENDPOINTS.sceneById(id), 'PUT', payload, token),

  deleteScene: (token, id) => apiCall(API_ENDPOINTS.sceneById(id), 'DELETE', null, token),

  calculateScene: (token, payload) => apiCall(API_ENDPOINTS.calculateScene, 'POST', payload, token),

  toArray,
  extractScene,
};
