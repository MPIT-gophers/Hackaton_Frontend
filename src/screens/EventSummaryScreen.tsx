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

type SummaryActionButtonProps = {
  label: string;
  onPress: () => void;
  testID?: string;
};

function SummaryActionButton({ label, onPress, testID }: SummaryActionButtonProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.actionButton, pressed ? styles.actionButtonPressed : undefined]} testID={testID}>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
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
    <ScreenContainer>
      <HeaderBack onPress={navigation.goBack} title="Страница мероприятия" />

      <View style={styles.card}>
        <View style={styles.media}>
          <Image source={getImageAsset(venue.imageKey)} style={styles.image} />
          <Text style={styles.name}>{venue.name}</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.bookingText}>Вы забронировали на:{`\n`}{formatDateDisplay(state.draft.date) || '5 апреля 2026 г.'}{`\n`}14:00</Text>

          <View style={styles.addressBlock}>
            <Text style={styles.addressLine}>{venue.addressLine}</Text>
            <Text style={styles.address}>{venue.address}</Text>
          </View>

          <Text style={styles.link}>Перейти по ссылке</Text>

          <View style={styles.ratingRow}>
            <Text style={styles.rating}>{venue.rating}</Text>
            <StarIcon />
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <SummaryActionButton label="Поменять заведение" onPress={() => navigation.navigate('VenuesList')} testID="event-summary-change-venue-button" />
        <SummaryActionButton label="Изменить параметры" onPress={() => navigation.navigate('EventForm')} testID="event-summary-edit-params-button" />
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
    marginTop: 30,
    overflow: 'hidden',
    ...theme.shadows.card
  },
  media: {
    height: 190,
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
  bookingText: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22
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
  link: {
    color: theme.colors.successLink,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22,
    marginTop: 15
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
    marginTop: 30
  }
});
