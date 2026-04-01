import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HeaderBack } from '../components/HeaderBack';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppContext } from '../context/AppContext';
import { BackendEvent } from '../domain/types';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';
import { formatDateDisplay } from '../utils/date';

type EventDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'EventDetails'>;

export function EventDetailsScreen({ navigation, route }: EventDetailsScreenProps) {
  const { actions } = useAppContext();
  const [event, setEvent] = useState<BackendEvent | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvent = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const [loadedEvent, loadedInviteToken] = await Promise.all([
        actions.getEventDetails(route.params.eventId),
        actions.getEventInviteToken(route.params.eventId).catch(() => null)
      ]);

      setEvent(loadedEvent);
      setInviteToken(loadedInviteToken);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Не удалось загрузить мероприятие');
    } finally {
      setIsLoading(false);
    }
  }, [actions, route.params.eventId]);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  return (
    <ScreenContainer scrollable>
      <HeaderBack onPress={navigation.goBack} title="Страница мероприятия" />

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <PrimaryButton onPress={loadEvent} style={styles.retryButton} title="Повторить" />
        </View>
      ) : event ? (
        <>
          <View style={styles.card}>
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.line}>Город: {event.city || '—'}</Text>
            <Text style={styles.line}>Дата: {formatDateDisplay(event.eventDate) || event.eventDate || '—'}</Text>
            <Text style={styles.line}>Время: {event.eventTime || '—'}</Text>
            <Text style={styles.line}>Бюджет: {event.budget || '—'}</Text>
            <Text style={styles.line}>Гостей: {event.expectedGuestCount || 0}</Text>
            <Text style={styles.line}>Статус: {event.status || '—'}</Text>
            <Text style={styles.line}>Роль: {event.accessRole || '—'}</Text>
            <Text style={styles.line}>Approval: {event.approvalStatus || '—'}</Text>
            <Text style={styles.line}>Attendance: {event.attendanceStatus || '—'}</Text>
            {event.description ? <Text style={styles.description}>{event.description}</Text> : null}
            <Text style={styles.tokenLabel}>Invite token</Text>
            <Text selectable style={styles.tokenValue}>
              {inviteToken || event.inviteToken || 'Недоступен'}
            </Text>
          </View>

          <View style={styles.actions}>
            <PrimaryButton onPress={() => navigation.navigate('EventGuests', { eventId: event.id })} title="Гости и статистика" />
            <PrimaryButton onPress={() => navigation.navigate('EventWishlist', { eventId: event.id })} title="Wishlist" />
            <PrimaryButton onPress={() => navigation.navigate('EventPhotos', { eventId: event.id })} title="Фото" />
          </View>
        </>
      ) : (
        <View style={styles.centerState}>
          <Text style={styles.line}>Мероприятие не найдено</Text>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40
  },
  card: {
    backgroundColor: theme.colors.surfaceBright,
    borderRadius: theme.radii.xl,
    marginTop: 24,
    padding: 18,
    ...theme.shadows.card
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 24,
    lineHeight: 30,
    marginBottom: 14
  },
  line: {
    color: theme.colors.text,
    fontFamily: theme.typography.regular,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 4
  },
  description: {
    color: theme.colors.muted,
    fontFamily: theme.typography.regular,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 12
  },
  tokenLabel: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22,
    marginTop: 18
  },
  tokenValue: {
    color: theme.colors.primary,
    fontFamily: theme.typography.medium,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 6
  },
  actions: {
    gap: 12,
    marginTop: 24
  },
  errorText: {
    color: theme.colors.danger,
    fontFamily: theme.typography.medium,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center'
  },
  retryButton: {
    marginTop: 16,
    width: '100%'
  }
});
