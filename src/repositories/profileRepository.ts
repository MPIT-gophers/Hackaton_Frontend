import AsyncStorage from '@react-native-async-storage/async-storage';

import { UserProfile } from '../domain/types';

const PROFILE_STORAGE_KEY = '@event-organizer/profile';

export type ProfileRepository = {
  getProfile(): Promise<UserProfile>;
  saveProfile(profile: UserProfile): Promise<void>;
};

export const defaultUserProfile: UserProfile = {
  name: 'USER NAME',
  about: '',
  notificationsEnabled: true
};

async function readStoredProfile(storage = AsyncStorage): Promise<Partial<UserProfile>> {
  try {
    const raw = await storage.getItem(PROFILE_STORAGE_KEY);

    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as Partial<UserProfile>;
  } catch {
    return {};
  }
}

export function createProfileRepository(storage = AsyncStorage): ProfileRepository {
  return {
    async getProfile() {
      const storedProfile = await readStoredProfile(storage);

      return {
        ...defaultUserProfile,
        ...storedProfile
      };
    },

    async saveProfile(profile) {
      await storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    }
  };
}
