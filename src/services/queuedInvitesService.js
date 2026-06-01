import AsyncStorage from '@react-native-async-storage/async-storage';
import { invitesService } from './invitesService';
import { usersService } from './usersService';

const QUEUE_KEY = '@gp:queued_invites';

const readQueue = async () => {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
};

const writeQueue = async (list) => {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(list || []));
};

export const queuedInvitesService = {
  getAll: async () => readQueue(),

  add: async (item) => {
    const list = await readQueue();
    list.unshift(item);
    await writeQueue(list);
    return list;
  },

  remove: async (id) => {
    const list = await readQueue();
    const next = list.filter(i => i.id !== id);
    await writeQueue(next);
    return next;
  },

  // Try to send queued invites: lookup user by email, then call invites API
  processQueue: async (token) => {
    if (!token) return;
    const list = await readQueue();
    for (const item of [...list]) {
      try {
        const lookup = await usersService.getUserByEmail(token, item.email);
        const found = (lookup?.data && lookup.data.length > 0) ? lookup.data[0] : null;
        if (!found || !found.id) continue;
        await invitesService.sendInvite(token, item.group_id, found.id);
        // remove from queue on success
        await queuedInvitesService.remove(item.id);
      } catch (err) {
        // If route not found, abort processing further (backend not available)
        const msg = (err && err.message) ? err.message : String(err);
        if (msg.includes('Route not found') || msg.includes('Not Found') || msg.includes('404')) {
          break;
        }
        // otherwise continue (transient error)
        continue;
      }
    }
  }
};
