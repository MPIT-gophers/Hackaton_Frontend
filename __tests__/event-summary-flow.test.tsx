import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, createInitialState, useAppContext } from '../src/context/AppContext';
import { VENUES } from '../src/data/venues';
import { EventSummaryScreen } from '../src/screens/EventSummaryScreen';
import { VenueDetailsScreen } from '../src/screens/VenueDetailsScreen';

function EventsProbe() {
  const { state } = useAppContext();

  return <Text>{`events:${state.events.length}`}</Text>;
}

const baseState = createInitialState({
  isHydrated: true,
  session: { isAuthenticated: true },
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
    const screen = render(
      <SafeAreaProvider>
        <AppProvider initialState={baseState} skipHydration>
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
});
