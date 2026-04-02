import { render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, createInitialState } from '../src/context/AppContext';
import { BackendEvent } from '../src/domain/types';
import { EventsRepository } from '../src/repositories/eventsRepository';
import { VenuesListScreen } from '../src/screens/VenuesListScreen';

function createReadyEvent(): BackendEvent {
  return {
    id: 'event-1',
    title: 'Подборка площадок в Якутске',
    city: 'Якутск',
    budget: '50000',
    description: 'Найдено 2 места',
    eventDate: '2026-04-05',
    eventTime: '14:00:00',
    expectedGuestCount: 5,
    inviteToken: 'invite-1',
    selectedVariantId: 'variant-1',
    status: 'ready',
    accessRole: 'organizer',
    approvalStatus: '',
    attendanceStatus: '',
    createdAt: '2026-04-02T05:58:19.171154Z',
    updatedAt: '2026-04-02T05:58:20.146883Z',
    variants: [
      {
        id: 'variant-1',
        title: 'Подборка площадок',
        description: 'Найдено 2 места',
        status: 'ready',
        variantNumber: 1,
        locations: [
          {
            id: 'location-1',
            title: 'Loft Север',
            address: 'ул. Ленина, 1',
            aiComment: 'Пространство для камерной вечеринки',
            aiScore: '4.9',
            contacts: '',
            source: 'initial',
            sortOrder: 1,
            isRejected: false,
            eventId: 'event-1',
            variantId: 'variant-1'
          },
          {
            id: 'location-2',
            title: 'Aurora Hall',
            address: 'пр. Мира, 7',
            aiComment: 'Светлый зал для компании',
            aiScore: '4.7',
            contacts: '',
            source: 'initial',
            sortOrder: 2,
            isRejected: false,
            eventId: 'event-1',
            variantId: 'variant-1'
          }
        ]
      }
    ]
  };
}

function createEventsRepositoryMock(overrides: Partial<EventsRepository> = {}): EventsRepository {
  return {
    listMyEvents: jest.fn().mockResolvedValue([]),
    createEvent: jest.fn(),
    getEventById: jest.fn().mockResolvedValue(createReadyEvent()),
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

describe('VenuesListScreen', () => {
  it('shows count summary and backend venues after polling', async () => {
    const eventsRepository = createEventsRepositoryMock();
    const navigation = { goBack: jest.fn() } as any;

    const screen = render(
      <SafeAreaProvider>
        <AppProvider
          dependencies={{ eventsRepository }}
          initialState={createInitialState({
            isHydrated: true,
            session: {
              isAuthenticated: true,
              status: 'authenticated',
              accessToken: 'token-1',
              tokenType: 'Bearer',
              expiresAt: '2099-01-01T00:00:00Z'
            },
            pendingEventId: 'event-1',
            venues: []
          })}
          skipHydration
        >
          <VenuesListScreen navigation={navigation} route={{ key: 'VenuesList', name: 'VenuesList' }} />
        </AppProvider>
      </SafeAreaProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Найдено 2 места')).toBeTruthy();
    });

    expect(screen.getByText('Loft Север')).toBeTruthy();
    expect(screen.getByText('Aurora Hall')).toBeTruthy();
    expect(eventsRepository.getEventById).toHaveBeenCalledWith('token-1', 'event-1');
  });
});
