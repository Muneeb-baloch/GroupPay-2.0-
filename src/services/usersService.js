import { BASE_URL } from '../config/api';

const buildHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token && { Authorization: `Bearer ${token}` }),
});

const parseJsonResponse = async (response) => {
  const raw = await response.text();

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Server returned an invalid response');
  }
};

const fetchJson = async (url, token) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: buildHeaders(token),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const message = data?.message || data?.error || data?.msg || `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
};

const isMissingLookupRoute = (error) => {
  const message = (error && error.message) ? error.message : String(error);
  return error?.status === 404 || error?.status === 405 || message.includes('Route not found') || message.includes('Not Found') || message.includes('Cannot GET');
};

const normalizeUsersPayload = (payload) => {
  const pickId = (u) => u?.id || u?.person_id || u?.user_id || (u?.person && (u.person.id || u.person.person_id)) || null;
  const mapUser = (u) => ({
    id: pickId(u),
    email: u?.email || (u?.person && u.person.email) || null,
    fullname: u?.fullname || u?.name || (u?.person && u.person.fullname) || (u?.person && u.person.username) || null,
  });

  if (Array.isArray(payload)) {
    return payload.map(mapUser);
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data.map(mapUser);
  }

  if (payload && payload.user) {
    return [mapUser(payload.user)];
  }

  if (payload && payload.users && Array.isArray(payload.users)) {
    return payload.users.map(mapUser);
  }

  // Some endpoints return a single user object directly (e.g. by-email).
  if (payload && typeof payload === 'object') {
    const single = mapUser(payload);
    if (single.id || single.email) {
      return [single];
    }
  }

  return [];
};

export const usersService = {
  // Lookup users by email. Tries the common backend route variants so the app
  // can work whether the backend exposes a query-based or dedicated email route.
  getUserByEmail: async (token, email) => {
    const normalizedEmail = (email || '').trim();
    const encodedEmail = encodeURIComponent(normalizedEmail);
    const params = new URLSearchParams({ email: normalizedEmail });
    const exactLookupUrl = `${BASE_URL}/api/up/users/by-email?${params.toString()}`;

    try {
      const resp = await fetchJson(exactLookupUrl, token);
      const payload = resp?.data ?? resp;
      return { data: normalizeUsersPayload(payload) };
    } catch (error) {
      if (!isMissingLookupRoute(error)) {
        throw error;
      }
    }

    const searchUrl = `${BASE_URL}/api/up/users/search?q=${encodedEmail}`;
    const searchResp = await fetchJson(searchUrl, token);
    const searchPayload = searchResp?.data ?? searchResp;
    const matches = normalizeUsersPayload(searchPayload).filter((user) => (user.email || '').trim().toLowerCase() === normalizedEmail.toLowerCase());

    if (matches.length > 0) {
      return { data: matches };
    }

    return { data: [] };
  }
};
