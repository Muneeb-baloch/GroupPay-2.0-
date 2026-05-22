// ============================================================
// Files Service — file upload management
// ============================================================

import { API_ENDPOINTS, BASE_URL } from '../config/api';

/**
 * Upload a single file using multipart/form-data
 * @param {string} token - JWT auth token
 * @param {object} fileAsset - { uri, name, type } from expo-image-picker
 * @param {string} folder - e.g. 'profiles', 'receipts'
 * @returns {Promise} API response with file URL
 */
export const filesService = {
  uploadFile: async (token, fileAsset, folder = 'profiles') => {
    const formData = new FormData();

    formData.append('file', {
      uri: fileAsset.uri,
      name: fileAsset.fileName || `upload_${Date.now()}.jpg`,
      type: fileAsset.mimeType || 'image/jpeg',
    });

    formData.append('folder', folder);

    const response = await fetch(API_ENDPOINTS.fileUpload, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Server returned an invalid response');
    }

    if (!response.ok) {
      throw new Error(data?.message || data?.error || `Upload failed (${response.status})`);
    }

    return data;
  },
};
