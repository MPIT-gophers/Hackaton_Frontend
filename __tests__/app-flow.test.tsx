import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppState as RNAppState, Linking, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, createInitialState, useAppContext } from '../src/context/AppContext';
import { BackendEvent, PendingAuthSession, StoredAuthSession } from '../src/domain/types';
import { VENUES } from '../src/data/venues';
import { EventsRepository } from '../src/repositories/eventsRepository';
import { AuthService } from '../src/services/authService';
import { AuthScreen } from '../src/screens/AuthScreen';
import { HomeScreen } from '../src/screens/HomeScreen';

function createPendingSession(): PendingAuthSession {
  return {
    sessionId: 'session-1',
    maxLink: 'https://max.ru/session-1',
    expiresAt: '2099-04-07T14:59:39Z'
  };
}

function createStoredAuthSession(): StoredAuthSession {
  return {
    tokens: {
      accessToken: 'token-1',
      tokenType: 'Bearer',
      expiresAt: '2099-04-07T14:59:39Z'
    },
    user: {
      id: 'user-1',
      fullName: 'Николай',
      phone: '+79991234567',
      createdAt: '2026-03-31T14:56:46.060397Z',
      updatedAt: '2026-03-31T14:56:46.060397Z'
    }
  };
}

function createAuthServiceMock(overrides: Partial<AuthService> = {}): AuthService {
  return {
    restore: jest.fn().mockResolvedValue({ auth: null, pending: null }),
    startMaxAuth: jest.fn().mockResolvedValue(createPendingSession()),
    getMaxSessionStatus: jest.fn().mockResolvedValue('pending'),
    exchangeMaxSession: jest.fn().mockResolvedValue(createStoredAuthSession()),
    clearPendingSession: jest.fn().mockResolvedValue(undefined),
    clearAuthSession: jest.fn().mockResolvedValue(undefined),
    ...overrides
  };
}

function createEventsRepositoryMock(overrides: Partial<EventsRepository> = {}): EventsRepository {
  return {
    listMyEvents: jest.fn().mockResolvedValue([]),
    createEvent: jest.fn(),
    getEventById: jest.fn(),
    getEventGuests: jest.fn(),
    getEventStats: jest.fn(),
    getEventInviteToken: jest.fn(),
    updateGuestAttendance: jest.fn(),
    getWishlist: jest.fn(),
    submitWishlistIdea: jest.fn(),
    parseWishlistText: jest.fn(),
    bookWishlistItem: jest.fn(),
    fundWishlistItem: jest.fn(),
    getEventPhotos: jest.fn(),
    uploadEventPhotos: jest.fn(),
    ...overrides
  };
}

function createBackendEvent(): BackendEvent {
  return {
    id: 'event-1',
    title: 'День рождение',
    city: 'Якутск',
    budget: '50000',
    description: '',
    eventDate: '2026-04-05',
    eventTime: '14:00',
    expectedGuestCount: 12,
    inviteToken: 'invite-1',
    selectedVariantId: '',
    status: 'active',
    accessRole: 'owner',
    approvalStatus: 'approved',
    attendanceStatus: 'confirmed',
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
    variants: []
  };
}

function SessionProbe() {
  const { state } = useAppContext();

  return <Text>{state.session.isAuthenticated ? 'signed-in' : 'signed-out'}</Text>;
}

describe('screen flow', () => {
  beforeEach(() => {
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('updates session state after auth button press', async () => {
    const authService = createAuthServiceMock({
      getMaxSessionStatus: jest.fn().mockResolvedValue('completed')
    });
    const eventsRepository = createEventsRepositoryMock();

    const screen = render(
      <SafeAreaProvider>
        <AppProvider dependencies={{ authService, eventsRepository }} initialState={createInitialState({ isHydrated: true })} skipHydration>
          <AuthScreen />
          <SessionProbe />
        </AppProvider>
      </SafeAreaProvider>
    );

    expect(screen.getByText('Ввод параметров события')).toBeTruthy();
    expect(screen.queryByText('Диалог с AI-агентом')).toBeNull();

    fireEvent.press(screen.getByTestId('auth-button'));

    await waitFor(() => {
      expect(screen.getByText('signed-in')).toBeTruthy();
    });

    expect(authService.startMaxAuth).toHaveBeenCalledTimes(1);
    expect(authService.exchangeMaxSession).toHaveBeenCalledWith('session-1');
  });

  it('shows waiting state copy while MAX confirmation is pending', async () => {
    const authService = createAuthServiceMock({
      getMaxSessionStatus: jest.fn().mockResolvedValue('pending')
    });
    const eventsRepository = createEventsRepositoryMock();

    const screen = render(
      <SafeAreaProvider>
        <AppProvider
          dependencies={{ authService, eventsRepository }}
          initialState={createInitialState({
            isHydrated: true,
            session: {
              status: 'waiting_confirmation',
              pendingSessionId: 'session-1',
              pendingMaxLink: 'https://max.ru/session-1',
              expiresAt: '2099-04-07T14:59:39Z'
            }
          })}
          skipHydration
        >
          <AuthScreen />
        </AppProvider>
      </SafeAreaProvider>
    );

    expect(screen.getByText('Подтвердите вход в MAX')).toBeTruthy();
    expect(screen.getByTestId('auth-open-max-button')).toBeTruthy();
  });

  it('shows retry state after auth error', async () => {
    const authService = createAuthServiceMock();
    const eventsRepository = createEventsRepositoryMock();

    const screen = render(
      <SafeAreaProvider>
        <AppProvider
          dependencies={{ authService, eventsRepository }}
          initialState={createInitialState({
            isHydrated: true,
            session: {
              status: 'error',
              errorMessage: 'Не удалось начать вход'
            }
          })}
          skipHydration
        >
          <AuthScreen />
        </AppProvider>
      </SafeAreaProvider>
    );

    expect(screen.getByText('Не получилось войти')).toBeTruthy();
    fireEvent.press(screen.getByTestId('auth-retry-button'));

    await waitFor(() => {
      expect(authService.clearPendingSession).toHaveBeenCalledTimes(1);
      expect(authService.startMaxAuth).toHaveBeenCalledTimes(1);
    });
  });

  it('renders empty home variant without events', () => {
    const navigation = { navigate: jest.fn() } as any;
    const screen = render(
      <SafeAreaProvider>
        <AppProvider
          initialState={createInitialState({
            isHydrated: true,
            session: {
              isAuthenticated: true,
              status: 'authenticated',
              accessToken: 'token-1',
              tokenType: 'Bearer',
              expiresAt: '2099-01-01T00:00:00Z'
            },
            venues: VENUES
          })}
          skipHydration
        >
          <HomeScreen navigation={navigation} route={{ key: 'Home', name: 'Home' }} />
        </AppProvider>
      </SafeAreaProvider>
    );

    expect(screen.getByText('У вас на данный момент\nнет мероприятий')).toBeTruthy();
  });

  it('renders filled home variant with existing events', () => {
    const navigation = { navigate: jest.fn() } as any;
    const event = createBackendEvent();
    const screen = render(
      <SafeAreaProvider>
        <AppProvider
          initialState={createInitialState({
            isHydrated: true,
            session: {
              isAuthenticated: true,
              status: 'authenticated',
              accessToken: 'token-1',
              tokenType: 'Bearer',
              expiresAt: '2099-01-01T00:00:00Z'
            },
            venues: VENUES,
            events: [event]
          })}
          skipHydration
        >
          <HomeScreen navigation={navigation} route={{ key: 'Home', name: 'Home' }} />
        </AppProvider>
      </SafeAreaProvider>
    );

    expect(screen.getByText('Якутск')).toBeTruthy();
    expect(screen.getByText('День рождение')).toBeTruthy();
  });

  it('completes auth when app returns to foreground from background', async () => {
    let appStateCallback: ((state: string) => void) | null = null;
    const removeSpy = jest.fn();

    jest.spyOn(RNAppState, 'addEventListener').mockImplementation((_type, listener) => {
      appStateCallback = listener as (state: string) => void;
      return { remove: removeSpy } as any;
    });

    const authService = createAuthServiceMock({
      getMaxSessionStatus: jest.fn().mockResolvedValue('pending')
    });
    const eventsRepository = createEventsRepositoryMock();

    const screen = render(
      <SafeAreaProvider>
        <AppProvider
          dependencies={{ authService, eventsRepository }}
          initialState={createInitialState({
            isHydrated: true,
            session: {
              status: 'waiting_confirmation',
              pendingSessionId: 'session-1',
              pendingMaxLink: 'https://max.ru/session-1',
              expiresAt: '2099-04-07T14:59:39Z'
            }
          })}
          skipHydration
        >
          <AuthScreen />
          <SessionProbe />
        </AppProvider>
      </SafeAreaProvider>
    );

    await waitFor(() => {
      expect(authService.getMaxSessionStatus).toHaveBeenCalled();
    });

    expect(screen.getByText('signed-out')).toBeTruthy();
    expect(appStateCallback).not.toBeNull();

    await act(async () => {
      await Promise.resolve();
    });

    (authService.getMaxSessionStatus as jest.Mock).mockResolvedValue('completed');

    await act(async () => {
      appStateCallback!('active');
    });

    await waitFor(() => {
      expect(authService.getMaxSessionStatus).toHaveBeenCalledTimes(2);
    });
  });
});
