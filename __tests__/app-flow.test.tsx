import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, createInitialState, useAppContext } from '../src/context/AppContext';
import { AuthScreen } from '../src/screens/AuthScreen';
import { HomeScreen } from '../src/screens/HomeScreen';

function SessionProbe() {
  const { state } = useAppContext();

  return <Text>{state.session.isAuthenticated ? 'signed-in' : 'signed-out'}</Text>;
}

describe('screen flow', () => {
  it('updates session state after auth button press', async () => {
    const screen = render(
      <SafeAreaProvider>
        <AppProvider initialState={createInitialState({ isHydrated: true })} skipHydration>
          <AuthScreen />
          <SessionProbe />
        </AppProvider>
      </SafeAreaProvider>
    );

    fireEvent.press(screen.getByTestId('auth-button'));

    await waitFor(() => {
      expect(screen.getByText('signed-in')).toBeTruthy();
    });
  });

  it('renders empty home variant without events', () => {
    const navigation = { navigate: jest.fn() } as any;
    const screen = render(
      <SafeAreaProvider>
        <AppProvider initialState={createInitialState({ isHydrated: true, session: { isAuthenticated: true } })} skipHydration>
          <HomeScreen navigation={navigation} route={{ key: 'Home', name: 'Home' }} />
        </AppProvider>
      </SafeAreaProvider>
    );

    expect(screen.getByText('У вас на данный момент\nнет мероприятий')).toBeTruthy();
  });

  it('renders filled home variant with existing events', () => {
    const navigation = { navigate: jest.fn() } as any;
    const screen = render(
      <SafeAreaProvider>
        <AppProvider
          initialState={createInitialState({
            isHydrated: true,
            session: { isAuthenticated: true },
            events: [
              {
                id: 'event-1',
                title: 'День рождение',
                date: '5 апреля 2026 г.',
                time: '14:00',
                venueId: 'vinzavod',
                venueName: 'Винзавод'
              }
            ]
          })}
          skipHydration
        >
          <HomeScreen navigation={navigation} route={{ key: 'Home', name: 'Home' }} />
        </AppProvider>
      </SafeAreaProvider>
    );

    expect(screen.getByText('День рождение')).toBeTruthy();
  });
});
