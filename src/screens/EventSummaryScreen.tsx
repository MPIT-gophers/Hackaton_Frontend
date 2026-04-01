import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
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

type EventSummaryScreenProps = NativeStackScreenProps<RootStackParamList, 'EventSummary'>;

const SUMMARY_MEDIA_HEIGHT = 190;

type SummaryActionButtonProps = {
  label: string;
  onPress: () => void;
  testID?: string;
};

type VenueSummaryCardProps = {
  venueName: string;
  venueImage: ReturnType<typeof getImageAsset>;
  bookingDate: string;
  addressLine: string;
  address: string;
  rating: string;
};

function SummaryActionButton({ label, onPress, testID }: SummaryActionButtonProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.actionButton, pressed ? styles.actionButtonPressed : undefined]} testID={testID}>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function VenueSummaryCard({ venueName, venueImage, bookingDate, addressLine, address, rating }: VenueSummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.media}>
        <Image source={venueImage} style={styles.image} />
        <View style={styles.nameBadge}>
          <Text style={styles.name}>{venueName}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View>
          <Text style={styles.bookingText}>
            Вы забронировали на:{`\n`}
            {bookingDate}
            {`\n`}14:00
          </Text>

          <View style={styles.addressBlock}>
            <Text style={styles.addressLine}>{addressLine}</Text>
            <Text style={styles.address}>{address}</Text>
          </View>

          <Text style={styles.link}>Перейти по ссылке</Text>
        </View>

        <View style={styles.ratingRow}>
          <Text style={styles.rating}>{rating}</Text>
          <StarIcon />
        </View>
      </View>
    </View>
  );
}

export function EventSummaryScreen({ navigation }: EventSummaryScreenProps) {
  const { state, actions } = useAppContext();
  const venue = getSelectedVenue(state.venues, state.draft, state.selectedVenueId);

  if (!venue) {
    return null;
  }

  const handleSave = async () => {
    const event = await actions.confirmBooking();

    if (!event) {
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }]
    });
  };

  return (
    <ScreenContainer scrollable>
      <HeaderBack onPress={navigation.goBack} title="Страница мероприятия" />
      <VenueSummaryCard
        address={venue.address}
        addressLine={venue.addressLine}
        bookingDate={formatDateDisplay(state.draft.date) || '5 апреля 2026 г.'}
        rating={venue.rating}
        venueImage={getImageAsset(venue.imageKey)}
        venueName={venue.name}
      />

      <View style={styles.actions}>
        <SummaryActionButton label="Поменять заведение" onPress={() => navigation.navigate('VenuesList')} testID="event-summary-change-venue-button" />
        <SummaryActionButton
          label="Изменить параметры"
          onPress={() =>
            navigation.navigate('EventForm', {
              mode: 'edit',
              returnTo: 'EventSummary'
            })
          }
          testID="event-summary-edit-params-button"
        />
        <SummaryActionButton
          label="Пригласить участников"
          onPress={() => Alert.alert('Функция скоро появится')}
          testID="event-summary-invite-button"
        />
      </View>

      <PrimaryButton onPress={handleSave} style={styles.saveButton} testID="event-summary-save-button" title="Сохранить" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    marginTop: 34,
    overflow: 'hidden',
    ...theme.shadows.card
  },
  media: {
    height: SUMMARY_MEDIA_HEIGHT,
    overflow: 'hidden'
  },
  image: {
    height: '100%',
    width: '100%'
  },
  nameBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    borderTopRightRadius: theme.radii.md,
    bottom: 0,
    minHeight: 32,
    justifyContent: 'center',
    left: 0,
    paddingHorizontal: 15,
    position: 'absolute'
  },
  name: {
    color: theme.colors.surfaceBright,
    fontFamily: theme.typography.medium,
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'left'
  },
  body: {
    gap: 14,
    padding: 15
  },
  bookingText: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22
  },
  addressBlock: {
    marginTop: 0
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
  link: {
    color: theme.colors.successLink,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22,
    marginTop: 0
  },
  ratingRow: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: 2,
    marginTop: 2
  },
  rating: {
    color: theme.colors.star,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 20
  },
  actions: {
    gap: 10,
    marginTop: 30
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceBright,
    borderRadius: theme.radii.xl,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 15,
    paddingVertical: 13,
    ...theme.shadows.card
  },
  actionButtonPressed: {
    opacity: 0.96
  },
  actionLabel: {
    color: theme.colors.text,
    fontFamily: theme.typography.regular,
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center'
  },
  saveButton: {
    marginTop: 30,
    minHeight: 62,
    paddingHorizontal: 10,
    paddingVertical: 18
  }
});
