import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, createInitialState, useAppContext } from '../src/context/AppContext';
import { BackendEvent } from '../src/domain/types';
import { VENUES } from '../src/data/venues';
import { EventsRepository } from '../src/repositories/eventsRepository';
import { EventSummaryScreen } from '../src/screens/EventSummaryScreen';
import { VenueDetailsScreen } from '../src/screens/VenueDetailsScreen';

function EventsProbe() {
  const { state } = useAppContext();

  return <Text>{`events:${state.events.length}`}</Text>;
}

const baseState = createInitialState({
  isHydrated: true,
  session: {
    isAuthenticated: true,
    status: 'authenticated',
    accessToken: 'token-1',
    tokenType: 'Bearer',
    expiresAt: '2099-01-01T00:00:00Z'
  },
  venues: VENUES,
  selectedVenueId: 'vinzavod',
  draft: {
    occasion: 'День рождение',
    city: 'Якутск',
    date: '2026-04-05',
    budget: '50000',
    guests: '12',
    placeType: 'Ресторан',
    location: 'Центр',
    wishes: ''
  }
});

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

function createEventsRepositoryMock(overrides: Partial<EventsRepository> = {}): EventsRepository {
  const event = createBackendEvent();

  return {
    listMyEvents: jest.fn().mockResolvedValue([event]),
    createEvent: jest.fn().mockResolvedValue(event),
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

describe('event summary flow', () => {
  it('navigates to summary without creating an event from venue details', () => {
    const navigation = { goBack: jest.fn(), navigate: jest.fn() } as any;
    const screen = render(
      <SafeAreaProvider>
        <AppProvider initialState={baseState} skipHydration>
          <VenueDetailsScreen navigation={navigation} route={{ key: 'VenueDetails', name: 'VenueDetails' }} />
          <EventsProbe />
        </AppProvider>
      </SafeAreaProvider>
    );

    expect(screen.getByText('events:0')).toBeTruthy();

    fireEvent.press(screen.getByTestId('venue-details-book-button'));

    expect(navigation.navigate).toHaveBeenCalledWith('EventSummary');
    expect(screen.getByText('events:0')).toBeTruthy();
  });

  it('creates an event only after save on summary screen', async () => {
    const navigation = { goBack: jest.fn(), navigate: jest.fn(), reset: jest.fn() } as any;
    const eventsRepository = createEventsRepositoryMock();
    const screen = render(
      <SafeAreaProvider>
        <AppProvider dependencies={{ eventsRepository }} initialState={baseState} skipHydration>
          <EventSummaryScreen navigation={navigation} route={{ key: 'EventSummary', name: 'EventSummary' }} />
          <EventsProbe />
        </AppProvider>
      </SafeAreaProvider>
    );

    expect(screen.getByText('events:0')).toBeTruthy();

    fireEvent.press(screen.getByTestId('event-summary-save-button'));

    await waitFor(() => {
      expect(screen.getByText('events:1')).toBeTruthy();
    });

    expect(navigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Home' }]
    });
  });

  it('opens EventForm in edit mode from summary', () => {
    const navigation = { goBack: jest.fn(), navigate: jest.fn(), reset: jest.fn() } as any;
    const screen = render(
      <SafeAreaProvider>
        <AppProvider initialState={baseState} skipHydration>
          <EventSummaryScreen navigation={navigation} route={{ key: 'EventSummary', name: 'EventSummary' }} />
        </AppProvider>
      </SafeAreaProvider>
    );

    fireEvent.press(screen.getByTestId('event-summary-edit-params-button'));

    expect(navigation.navigate).toHaveBeenCalledWith('EventForm', {
      mode: 'edit',
      returnTo: 'EventSummary'
    });
  });

  it('shows an alert when confirmBooking rejects with an error', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const navigation = { goBack: jest.fn(), navigate: jest.fn(), reset: jest.fn() } as any;
    const eventsRepository = createEventsRepositoryMock({
      createEvent: jest.fn().mockRejectedValue(new Error('Network failure'))
    });

    const screen = render(
      <SafeAreaProvider>
        <AppProvider dependencies={{ eventsRepository }} initialState={baseState} skipHydration>
          <EventSummaryScreen navigation={navigation} route={{ key: 'EventSummary', name: 'EventSummary' }} />
        </AppProvider>
      </SafeAreaProvider>
    );

    fireEvent.press(screen.getByTestId('event-summary-save-button'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Ошибка', expect.stringContaining(''));
    });

    expect(navigation.reset).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('disables the save button while saving is in progress', async () => {
    let resolveCreate: (value: BackendEvent) => void;
    const createPromise = new Promise<BackendEvent>((resolve) => {
      resolveCreate = resolve;
    });

    const navigation = { goBack: jest.fn(), navigate: jest.fn(), reset: jest.fn() } as any;
    const eventsRepository = createEventsRepositoryMock({
      createEvent: jest.fn().mockReturnValue(createPromise)
    });

    const screen = render(
      <SafeAreaProvider>
        <AppProvider dependencies={{ eventsRepository }} initialState={baseState} skipHydration>
          <EventSummaryScreen navigation={navigation} route={{ key: 'EventSummary', name: 'EventSummary' }} />
        </AppProvider>
      </SafeAreaProvider>
    );

    fireEvent.press(screen.getByTestId('event-summary-save-button'));

    expect(eventsRepository.createEvent).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByTestId('event-summary-save-button'));
    expect(eventsRepository.createEvent).toHaveBeenCalledTimes(1);

    resolveCreate!(createBackendEvent());

    await waitFor(() => {
      expect(navigation.reset).toHaveBeenCalled();
    });
  });
});
