import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAppContext } from '../context/AppContext';
import { AuthScreen } from '../screens/AuthScreen';
import { EventFormScreen } from '../screens/EventFormScreen';
import { EventSummaryScreen } from '../screens/EventSummaryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoadingScreen } from '../screens/LoadingScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { VenueDetailsScreen } from '../screens/VenueDetailsScreen';
import { VenuesListScreen } from '../screens/VenuesListScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const {
    state: { isHydrated, session }
  } = useAppContext();

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session.isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EventForm" component={EventFormScreen} />
            <Stack.Screen name="VenuesList" component={VenuesListScreen} />
            <Stack.Screen name="VenueDetails" component={VenueDetailsScreen} />
            <Stack.Screen name="EventSummary" component={EventSummaryScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
