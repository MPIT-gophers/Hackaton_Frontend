import AsyncStorage from '@react-native-async-storage/async-storage';

import { PendingAuthSession, StoredAuthSession } from '../domain/types';

const AUTH_SESSION_STORAGE_KEY = '@event-organizer/auth-session';
const PENDING_AUTH_SESSION_STORAGE_KEY = '@event-organizer/auth-pending-session';

type StorageLike = Pick<typeof AsyncStorage, 'getItem' | 'setItem' | 'removeItem'>;

export type AuthRepository = {
  getAuthSession(): Promise<StoredAuthSession | null>;
  saveAuthSession(session: StoredAuthSession): Promise<void>;
  clearAuthSession(): Promise<void>;
  getPendingSession(): Promise<PendingAuthSession | null>;
  savePendingSession(session: PendingAuthSession): Promise<void>;
  clearPendingSession(): Promise<void>;
};

async function readJson<T>(storage: StorageLike, key: string): Promise<T | null> {
  try {
    const raw = await storage.getItem(key);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as T;
  } catch {
    await storage.removeItem(key);
    return null;
  }
}

export function createAuthRepository(storage: StorageLike = AsyncStorage): AuthRepository {
  return {
    getAuthSession() {
      return readJson<StoredAuthSession>(storage, AUTH_SESSION_STORAGE_KEY);
    },
    async saveAuthSession(session) {
      await storage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
    },
    async clearAuthSession() {
      await storage.removeItem(AUTH_SESSION_STORAGE_KEY);
    },
    getPendingSession() {
      return readJson<PendingAuthSession>(storage, PENDING_AUTH_SESSION_STORAGE_KEY);
    },
    async savePendingSession(session) {
      await storage.setItem(PENDING_AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
    },
    async clearPendingSession() {
      await storage.removeItem(PENDING_AUTH_SESSION_STORAGE_KEY);
    }
  };
}
