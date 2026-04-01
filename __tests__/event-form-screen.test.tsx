import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, createInitialState } from '../src/context/AppContext';
import { VENUES } from '../src/data/venues';
import { EventFormScreen } from '../src/screens/EventFormScreen';

describe('EventFormScreen', () => {
  it('shows save action in edit mode and returns back to summary', () => {
    const navigation = { goBack: jest.fn(), navigate: jest.fn() } as any;
    const route = {
      key: 'EventForm',
      name: 'EventForm',
      params: {
        mode: 'edit',
        returnTo: 'EventSummary'
      }
    } as any;

    const screen = render(
      <SafeAreaProvider>
        <AppProvider
          initialState={createInitialState({
            isHydrated: true,
            venues: VENUES,
            selectedVenueId: 'vinzavod',
            draft: {
              occasion: 'День рождения',
              city: 'Якутск',
              date: '2026-04-05',
              budget: '50000',
              guests: '10',
              placeType: 'Ресторан',
              location: 'Центр',
              wishes: ''
            }
          })}
          skipHydration
        >
          <EventFormScreen navigation={navigation} route={route} />
        </AppProvider>
      </SafeAreaProvider>
    );

    expect(screen.getByText('Сохранить')).toBeTruthy();

    fireEvent.press(screen.getByTestId('event-form-continue-button'));

    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });
});
