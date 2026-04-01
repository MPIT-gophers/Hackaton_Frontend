import { Image, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HeaderBack } from '../components/HeaderBack';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { StarIcon } from '../components/icons';
import { useAppContext } from '../context/AppContext';
import { getImageAsset } from '../data/assets';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';
import { formatDateDisplay } from '../utils/date';
import { getSelectedVenue } from '../utils/venueRanking';

type VenueDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'VenueDetails'>;

export function VenueDetailsScreen({ navigation }: VenueDetailsScreenProps) {
  const { state } = useAppContext();
  const venue = getSelectedVenue(state.venues, state.draft, state.selectedVenueId);

  if (!venue) {
    return null;
  }

  return (
    <ScreenContainer scrollable>
      <HeaderBack onPress={navigation.goBack} title="Список заведений" />

      <View style={styles.card}>
        <View style={styles.media}>
          <Image source={getImageAsset(venue.imageKey)} style={styles.image} />
          <Text style={styles.name}>{venue.name}</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.summary}>{venue.summary}</Text>
          <Text style={styles.addressLine}>{venue.addressLine}</Text>
          <Text style={styles.address}>{venue.address}</Text>
          <Text style={styles.schedule}>{venue.schedule}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Средний чек:</Text>
            <Text style={styles.metaValue}>{venue.averageCheck}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Кухня:</Text>
            <Text style={styles.metaValue}>{venue.cuisine}</Text>
          </View>

          <View style={styles.ratingRow}>
            <Text style={styles.rating}>{venue.rating}</Text>
            <StarIcon />
          </View>
        </View>
      </View>

      <View style={styles.bookingCard}>
        <Text style={styles.bookingLabel}>Дата события</Text>
        <Text style={styles.bookingDate}>{formatDateDisplay(state.draft.date) || '5 апреля 2026 г.'}</Text>
        <PrimaryButton onPress={() => navigation.navigate('BookingConfirm')} title="Забронировать" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    marginTop: 30,
    overflow: 'hidden'
  },
  media: {
    height: 195,
    overflow: 'hidden'
  },
  image: {
    height: '100%',
    width: '100%'
  },
  name: {
    bottom: 15,
    color: theme.colors.surface,
    fontFamily: theme.typography.semiBold,
    fontSize: 20,
    left: 15,
    lineHeight: 24,
    position: 'absolute'
  },
  body: {
    padding: 15
  },
  summary: {
    color: '#000000',
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 23,
    minHeight: 33
  },
  addressLine: {
    color: '#000000',
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22,
    marginTop: 18
  },
  address: {
    color: '#000000',
    fontFamily: theme.typography.regular,
    fontSize: 14,
    lineHeight: 19,
    marginTop: 4
  },
  schedule: {
    color: '#000000',
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22,
    marginTop: 15
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12
  },
  metaLabel: {
    color: '#000000',
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22
  },
  metaValue: {
    color: '#000000',
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22
  },
  ratingRow: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: 5,
    marginTop: 15
  },
  rating: {
    color: theme.colors.star,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 20
  },
  bookingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    marginTop: 15,
    padding: 15,
    ...theme.shadows.card
  },
  bookingLabel: {
    color: '#000000',
    fontFamily: theme.typography.regular,
    fontSize: 17,
    lineHeight: 22
  },
  bookingDate: {
    color: '#000000',
    fontFamily: theme.typography.semiBold,
    fontSize: 20,
    lineHeight: 24,
    marginBottom: 15,
    marginTop: 15
  }
});
