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

type ParsedSchedule = {
  title: string;
  rows: Array<{ label: string; value: string }>;
};

function parseVenueSchedule(schedule: string): ParsedSchedule {
  const [title = 'Режим работы:', ...rawRows] = schedule.split('\n').map((line) => line.trim()).filter(Boolean);

  return {
    title,
    rows: rawRows.map((line) => {
      const matchedParts = line.match(/^(.*?)\s{2,}(\S.*)$/);

      if (!matchedParts) {
        return { label: line, value: '' };
      }

      return {
        label: matchedParts[1].trim(),
        value: matchedParts[2].trim()
      };
    })
  };
}

export function VenueDetailsScreen({ navigation }: VenueDetailsScreenProps) {
  const { state } = useAppContext();
  const venue = getSelectedVenue(state.venues, state.draft, state.selectedVenueId);

  if (!venue) {
    return null;
  }

  const schedule = venue.schedule ? parseVenueSchedule(venue.schedule) : null;

  return (
    <ScreenContainer scrollable>
      <HeaderBack onPress={navigation.goBack} title="Список заведений" />

      <View style={styles.card}>
        <View style={styles.media}>
          <Image source={getImageAsset(venue.imageKey)} style={styles.image} />
          <Text style={styles.name}>{venue.name}</Text>
        </View>

        <View style={styles.body}>
          {venue.summary ? <Text style={styles.summary}>{venue.summary}</Text> : null}

          {venue.addressLine || venue.address ? (
            <View style={styles.addressBlock}>
              {venue.addressLine ? <Text style={styles.addressLine}>{venue.addressLine}</Text> : null}
              {venue.address ? <Text style={styles.address}>{venue.address}</Text> : null}
            </View>
          ) : null}

          {schedule ? (
            <View style={styles.scheduleBlock}>
              <Text style={styles.scheduleTitle}>{schedule.title}</Text>
              {schedule.rows.map((row) => (
                <View key={`${row.label}-${row.value}`} style={styles.scheduleRow}>
                  <Text style={styles.scheduleLabel}>{row.label}</Text>
                  <Text style={styles.scheduleValue}>{row.value}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {venue.averageCheck ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Средний чек:</Text>
              <Text style={styles.metaValue}>{venue.averageCheck}</Text>
            </View>
          ) : null}
          {venue.cuisine ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Кухня:</Text>
              <Text style={styles.metaValue}>{venue.cuisine}</Text>
            </View>
          ) : null}

          <View style={styles.ratingRow}>
            <Text style={styles.rating}>{venue.rating}</Text>
            <StarIcon />
          </View>
        </View>
      </View>

      <View style={styles.bookingCard}>
        <Text style={styles.bookingLabel}>Дата события</Text>
        <Text style={styles.bookingDate}>{formatDateDisplay(state.draft.date) || '5 апреля 2026 г.'}</Text>
      </View>

      <PrimaryButton onPress={() => navigation.navigate('EventSummary')} style={styles.button} testID="venue-details-book-button" title="Забронировать" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    marginTop: 30,
    overflow: 'hidden',
    ...theme.shadows.card
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
    color: theme.colors.surfaceBright,
    fontFamily: theme.typography.medium,
    fontSize: 20,
    left: 15,
    lineHeight: 24,
    position: 'absolute'
  },
  body: {
    padding: 15
  },
  summary: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22,
    minHeight: 33
  },
  addressBlock: {
    marginTop: 15
  },
  addressLine: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22
  },
  address: {
    color: theme.colors.text,
    fontFamily: theme.typography.regular,
    fontSize: 14,
    lineHeight: 18,
    marginTop: 10
  },
  scheduleBlock: {
    marginTop: 15
  },
  scheduleTitle: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22,
    marginBottom: 2
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  scheduleLabel: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22
  },
  scheduleValue: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22,
    textAlign: 'right'
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  metaLabel: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22
  },
  metaValue: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22
  },
  ratingRow: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: 2,
    marginTop: 12
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
    marginTop: 24,
    minHeight: 70,
    padding: 15,
    ...theme.shadows.card
  },
  bookingLabel: {
    color: theme.colors.text,
    fontFamily: theme.typography.regular,
    fontSize: 17,
    lineHeight: 22
  },
  bookingDate: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 20,
    lineHeight: 24,
    marginTop: 15
  },
  button: {
    marginTop: 30
  }
});
