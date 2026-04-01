import AsyncStorage from '@react-native-async-storage/async-storage';

import { BackendUser, UserProfile } from '../domain/types';

const PROFILE_STORAGE_KEY = '@event-organizer/profile';

type StorageLike = Pick<typeof AsyncStorage, 'getItem' | 'setItem' | 'removeItem'>;

export type LocalProfileState = {
  about: string;
  notificationsEnabled: boolean;
};

export type ProfileRepository = {
  getLocalProfile(): Promise<LocalProfileState>;
  saveLocalProfile(profile: LocalProfileState): Promise<void>;
  clearLocalProfile(): Promise<void>;
  mergeProfile(user: BackendUser | null, local: Partial<LocalProfileState>): UserProfile;
};

export const defaultLocalProfile: LocalProfileState = {
  about: '',
  notificationsEnabled: true
};

export const defaultUserProfile: UserProfile = {
  fullName: '',
  phone: '',
  ...defaultLocalProfile
};

async function readStoredProfile(storage: StorageLike): Promise<Partial<LocalProfileState>> {
  try {
    const raw = await storage.getItem(PROFILE_STORAGE_KEY);

    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as Partial<LocalProfileState>;
  } catch {
    return {};
  }
}

export function createProfileRepository(storage: StorageLike = AsyncStorage): ProfileRepository {
  return {
    async getLocalProfile() {
      const storedProfile = await readStoredProfile(storage);

      return {
        ...defaultLocalProfile,
        ...storedProfile
      };
    },

    async saveLocalProfile(profile) {
      await storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    },

    async clearLocalProfile() {
      await storage.removeItem(PROFILE_STORAGE_KEY);
    },

    mergeProfile(user, local) {
      return {
        fullName: user?.fullName ?? '',
        phone: user?.phone ?? '',
        about: local.about ?? defaultLocalProfile.about,
        notificationsEnabled: local.notificationsEnabled ?? defaultLocalProfile.notificationsEnabled
      };
    }
  };
}
