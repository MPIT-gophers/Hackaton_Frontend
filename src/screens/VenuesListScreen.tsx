import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HeaderBack } from '../components/HeaderBack';
import { ScreenContainer } from '../components/ScreenContainer';
import { VenueCard } from '../components/VenueCard';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../navigation/types';
import { getRecommendedVenues } from '../utils/venueRanking';

type VenuesListScreenProps = NativeStackScreenProps<RootStackParamList, 'VenuesList'>;

export function VenuesListScreen({ navigation }: VenuesListScreenProps) {
  const { state, actions } = useAppContext();
  const venues = getRecommendedVenues(state.venues, state.draft);

  return (
    <ScreenContainer scrollable>
      <HeaderBack onPress={navigation.goBack} title="Список заведений" />

      <View style={styles.list}>
        {venues.map((venue) => (
          <VenueCard
            key={venue.id}
            onPress={() => {
              actions.chooseVenue(venue.id);
              navigation.navigate('VenueDetails');
            }}
            testID={`venue-card-${venue.id}`}
            venue={venue}
          />
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 15,
    marginTop: 30
  }
});
