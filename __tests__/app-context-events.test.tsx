import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, createInitialState, useAppContext } from '../src/context/AppContext';
import { VENUES } from '../src/data/venues';
import { BackendEvent } from '../src/domain/types';
import { EventsRepository } from '../src/repositories/eventsRepository';

function createPendingEvent(): BackendEvent {
  return {
    id: 'event-1',
    title: 'День рождения',
    city: 'Якутск',
    budget: '50000',
    description: 'Подбираем площадки',
    eventDate: '2026-04-05',
    eventTime: '14:00:00',
    expectedGuestCount: 5,
    inviteToken: 'invite-1',
    selectedVariantId: '',
    status: 'generating',
    accessRole: 'organizer',
    approvalStatus: '',
    attendanceStatus: '',
    createdAt: '2026-04-02T05:58:19.171154Z',
    updatedAt: '2026-04-02T05:58:19.171154Z',
    variants: []
  };
}

function createReadyEvent(): BackendEvent {
  return {
    ...createPendingEvent(),
    status: 'ready',
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
            aiComment: 'Хорошо подходит для дня рождения',
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
            aiComment: 'Уютное пространство',
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
    createEvent: jest.fn().mockResolvedValue(createPendingEvent()),
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

function EventActionsProbe() {
  const { state, actions } = useAppContext();

  return (
    <>
      <Text testID="pending-event-id">{state.pendingEventId ?? 'none'}</Text>
      <Text testID="venue-count">{String(state.venues.length)}</Text>
      <Pressable onPress={() => void actions.createEventForVenues()} testID="create-event-button">
        <Text>Создать</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          if (state.pendingEventId) {
            void actions.pollEventVenues(state.pendingEventId);
          }
        }}
        testID="poll-event-button"
      >
        <Text>Опросить</Text>
      </Pressable>
    </>
  );
}

describe('AppContext event actions', () => {
  it('stores pending event id and fills venues from polled backend event', async () => {
    const eventsRepository = createEventsRepositoryMock();
    const initialState = createInitialState({
      isHydrated: true,
      session: {
        isAuthenticated: true,
        status: 'authenticated',
        accessToken: 'token-1',
        tokenType: 'Bearer',
        expiresAt: '2099-01-01T00:00:00Z'
      },
      venues: VENUES,
      draft: {
        occasion: 'День рождения',
        city: 'Якутск',
        date: '2026-04-05',
        budget: '50000',
        guests: '5',
        placeType: '',
        location: '',
        wishes: ''
      }
    });

    const screen = render(
      <SafeAreaProvider>
        <AppProvider dependencies={{ eventsRepository }} initialState={initialState} skipHydration>
          <EventActionsProbe />
        </AppProvider>
      </SafeAreaProvider>
    );

    expect(screen.getByTestId('venue-count').props.children).toBe(String(VENUES.length));

    fireEvent.press(screen.getByTestId('create-event-button'));

    await waitFor(() => {
      expect(screen.getByTestId('pending-event-id').props.children).toBe('event-1');
    });

    await waitFor(() => {
      expect(screen.getByTestId('venue-count').props.children).toBe('0');
    });

    fireEvent.press(screen.getByTestId('poll-event-button'));

    await waitFor(() => {
      expect(screen.getByTestId('venue-count').props.children).toBe('2');
    });

    expect(eventsRepository.createEvent).toHaveBeenCalledWith('token-1', expect.objectContaining({ occasion: 'День рождения' }));
    expect(eventsRepository.getEventById).toHaveBeenCalledWith('token-1', 'event-1');
  });
});
