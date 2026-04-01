import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HeaderBack } from '../components/HeaderBack';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';
import { formatDateDisplay } from '../utils/date';

type BookingConfirmScreenProps = NativeStackScreenProps<RootStackParamList, 'BookingConfirm'>;

export function BookingConfirmScreen({ navigation }: BookingConfirmScreenProps) {
  const { state, actions } = useAppContext();

  const handleBooking = async () => {
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
      <HeaderBack onPress={navigation.goBack} title="Забронировать" />

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Дата события</Text>
          <Text style={styles.date}>{formatDateDisplay(state.draft.date) || '5 апреля 2026 г.'}</Text>
          <PrimaryButton onPress={handleBooking} testID="booking-confirm-button" title="Забронировать" />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center'
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: 15,
    ...theme.shadows.card
  },
  label: {
    color: '#000000',
    fontFamily: theme.typography.regular,
    fontSize: 17,
    lineHeight: 22
  },
  date: {
    color: '#000000',
    fontFamily: theme.typography.semiBold,
    fontSize: 20,
    lineHeight: 24,
    marginBottom: 15,
    marginTop: 15
  }
});
