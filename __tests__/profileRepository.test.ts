import AsyncStorage from '@react-native-async-storage/async-storage';

import { createProfileRepository, defaultLocalProfile } from '../src/repositories/profileRepository';

describe('profileRepository', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns default local profile when storage is empty', async () => {
    const repository = createProfileRepository(AsyncStorage);

    await expect(repository.getLocalProfile()).resolves.toEqual(defaultLocalProfile);
  });

  it('merges backend identity with local profile fields', async () => {
    const repository = createProfileRepository(AsyncStorage);

    expect(
      repository.mergeProfile(
        {
          id: 'user-1',
          fullName: 'Николай',
          phone: null,
          createdAt: '2026-03-31T14:56:46.060397Z',
          updatedAt: '2026-03-31T14:56:46.060397Z'
        },
        {
          about: 'Люблю камерные площадки',
          notificationsEnabled: false
        }
      )
    ).toEqual({
      fullName: 'Николай',
      phone: '',
      about: 'Люблю камерные площадки',
      notificationsEnabled: false
    });
  });
});
