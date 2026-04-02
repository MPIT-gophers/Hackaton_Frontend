import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAppContext } from '../context/AppContext';
import { AuthScreen } from '../screens/AuthScreen';
import { AgentChatConversationScreen } from '../screens/AgentChatConversationScreen';
import { AgentChatWelcomeScreen } from '../screens/AgentChatWelcomeScreen';
import { EventDetailsScreen } from '../screens/EventDetailsScreen';
import { EventFormScreen } from '../screens/EventFormScreen';
import { EventGuestsScreen } from '../screens/EventGuestsScreen';
import { EventPhotosScreen } from '../screens/EventPhotosScreen';
import { EventSummaryScreen } from '../screens/EventSummaryScreen';
import { EventWishlistScreen } from '../screens/EventWishlistScreen';
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
            <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
            <Stack.Screen name="EventGuests" component={EventGuestsScreen} />
            <Stack.Screen name="EventWishlist" component={EventWishlistScreen} />
            <Stack.Screen name="EventPhotos" component={EventPhotosScreen} />
          </>
        )}
        <Stack.Screen name="AgentChatWelcome" component={AgentChatWelcomeScreen} />
        <Stack.Screen name="AgentChatConversation" component={AgentChatConversationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
