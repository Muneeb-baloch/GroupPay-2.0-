// ============================================================
// Files Service — file upload management
// ============================================================

import { Platform } from 'react-native';
import { API_ENDPOINTS } from '../config/api';

/**
 * Upload a single file using multipart/form-data via XMLHttpRequest.
 *
 * Using XHR instead of fetch because RN 0.79+ / Expo 53+ changed the
 * FormData internals and the fetch polyfill no longer accepts plain
 * { uri, name, type } objects as form parts (throws "Unsupported
 * FormDataPart implementation" / "Cannot read property 'MULTIPART'").
 * XHR's upload path goes through a native bridge that still handles
 * the { uri, name, type } shape correctly on both iOS and Android.
 *
 * @param {string} token     - JWT auth token
 * @param {object} fileAsset - { uri, name/fileName, type/mimeType } from expo-image-picker
 * @param {string} folder    - storage folder, e.g. 'scene-images'
 * @returns {Promise<object>} API response with file URL
 */
export const filesService = {
  uploadFile: (token, fileAsset, folder = 'profiles') => {
    return new Promise((resolve, reject) => {
      // --- 1. Normalise URI ---
      let safeUri = String(fileAsset.uri || '');
      // iOS sometimes exposes a file:// URI; strip the scheme so XHR can
      // resolve it through the native asset bridge without issues.
      if (Platform.OS === 'ios') {
        safeUri = safeUri.replace(/^file:\/\//, '');
      }

      // --- 2. Normalise file name ---
      let safeName = fileAsset.fileName || fileAsset.name;
      if (!safeName) {
        const parts = safeUri.split('/');
        safeName = parts[parts.length - 1] || `upload_${Date.now()}.jpg`;
      }
      safeName = String(safeName);

      // --- 3. Normalise MIME type ---
      let safeType = fileAsset.mimeType || fileAsset.type;
      if (!safeType) {
        const ext = /\.(\w+)$/.exec(safeName);
        safeType = ext ? `image/${ext[1].toLowerCase()}` : 'image/jpeg';
      }
      safeType = String(safeType);

      // --- 4. Build FormData ---
      // The { uri, name, type } object shape is the React Native convention
      // that XHR's native bridge understands natively.
      const formData = new FormData();
      formData.append('file', {
        uri: safeUri,
        name: safeName,
        type: safeType,
      });
      formData.append('folder', String(folder || 'scene-images'));

      // --- 5. Send via XHR ---
      const xhr = new XMLHttpRequest();
      xhr.open('POST', API_ENDPOINTS.fileUpload);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Accept', 'application/json');
      // Do NOT set Content-Type — XHR sets it automatically with the
      // correct multipart boundary when the body is FormData.

      xhr.onload = () => {
        let data;
        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          return reject(new Error('Server returned an invalid response'));
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(
            new Error(
              data?.message || data?.error || `Upload failed (${xhr.status})`
            )
          );
        }
      };

      xhr.onerror = () => reject(new Error('Network error during file upload'));
      xhr.ontimeout = () => reject(new Error('File upload timed out'));

      xhr.send(formData);
    });
  },
};
