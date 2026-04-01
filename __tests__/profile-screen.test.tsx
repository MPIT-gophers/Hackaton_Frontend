import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, createInitialState } from '../src/context/AppContext';
import { ProfileRepository } from '../src/repositories/profileRepository';
import { ProfileScreen } from '../src/screens/ProfileScreen';
import { ProfileService } from '../src/services/profileService';

function createProfileRepositoryMock(): ProfileRepository {
  return {
    getLocalProfile: jest.fn().mockResolvedValue({ about: '', notificationsEnabled: true }),
    saveLocalProfile: jest.fn().mockResolvedValue(undefined),
    mergeProfile: jest.fn((user, local) => ({
      fullName: user?.fullName ?? '',
      phone: user?.phone ?? '',
      about: local.about ?? '',
      notificationsEnabled: local.notificationsEnabled ?? true
    }))
  };
}

describe('ProfileScreen', () => {
  it('saves backend identity with explicit button press', async () => {
    const profileService: ProfileService = {
      updateMe: jest.fn().mockResolvedValue({
        id: 'user-1',
        fullName: 'Николай Тест',
        phone: '+79991234567',
        createdAt: '2026-03-31T14:56:46.060397Z',
        updatedAt: '2026-03-31T15:04:53.200424Z'
      })
    };
    const profileRepository = createProfileRepositoryMock();

    const screen = render(
      <SafeAreaProvider>
        <AppProvider
          dependencies={{ profileRepository, profileService }}
          initialState={createInitialState({
            isHydrated: true,
            session: {
              isAuthenticated: true,
              status: 'authenticated',
              accessToken: 'token-1',
              tokenType: 'Bearer',
              expiresAt: '2099-01-01T00:00:00Z'
            },
            profile: {
              fullName: 'Николай',
              phone: '',
              about: '',
              notificationsEnabled: true
            }
          })}
          skipHydration
        >
          <ProfileScreen navigation={{ goBack: jest.fn() } as any} route={{ key: 'Profile', name: 'Profile' }} />
        </AppProvider>
      </SafeAreaProvider>
    );

    fireEvent.changeText(screen.getByTestId('profile-full-name-input'), 'Николай Тест');
    fireEvent.changeText(screen.getByTestId('profile-phone-input'), '+79991234567');
    fireEvent.press(screen.getByTestId('profile-save-button'));

    await waitFor(() => {
      expect(profileService.updateMe).toHaveBeenCalledWith('token-1', {
        fullName: 'Николай Тест',
        phone: '+79991234567'
      });
    });
  });

  it('keeps about and notifications local', async () => {
    const profileRepository = createProfileRepositoryMock();

    const screen = render(
      <SafeAreaProvider>
        <AppProvider
          dependencies={{ profileRepository }}
          initialState={createInitialState({
            isHydrated: true,
            session: {
              isAuthenticated: true,
              status: 'authenticated',
              accessToken: 'token-1',
              tokenType: 'Bearer',
              expiresAt: '2099-01-01T00:00:00Z'
            },
            profile: {
              fullName: 'Николай',
              phone: '+79991234567',
              about: '',
              notificationsEnabled: true
            }
          })}
          skipHydration
        >
          <ProfileScreen navigation={{ goBack: jest.fn() } as any} route={{ key: 'Profile', name: 'Profile' }} />
        </AppProvider>
      </SafeAreaProvider>
    );

    fireEvent.changeText(screen.getByTestId('profile-about-input'), 'Люблю rooftops');
    fireEvent.press(screen.getByTestId('profile-notifications-toggle'));

    await waitFor(() => {
      expect(profileRepository.saveLocalProfile).toHaveBeenCalledWith({
        about: 'Люблю rooftops',
        notificationsEnabled: true
      });
    });

    await waitFor(() => {
      expect(profileRepository.saveLocalProfile).toHaveBeenCalledWith({
        about: 'Люблю rooftops',
        notificationsEnabled: false
      });
    });
  });
});
