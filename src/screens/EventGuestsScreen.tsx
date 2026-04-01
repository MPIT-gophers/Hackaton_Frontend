import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HeaderBack } from '../components/HeaderBack';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppContext } from '../context/AppContext';
import { AttendanceStatus, EventGuest, EventGuestStats } from '../domain/types';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';

type EventGuestsScreenProps = NativeStackScreenProps<RootStackParamList, 'EventGuests'>;

const ATTENDANCE_OPTIONS: AttendanceStatus[] = ['pending', 'confirmed', 'declined'];

export function EventGuestsScreen({ navigation, route }: EventGuestsScreenProps) {
  const { actions } = useAppContext();
  const [guests, setGuests] = useState<EventGuest[]>([]);
  const [stats, setStats] = useState<EventGuestStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingGuestId, setUpdatingGuestId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const [nextGuests, nextStats] = await Promise.all([
        actions.getEventGuests(route.params.eventId),
        actions.getEventStats(route.params.eventId)
      ]);

      setGuests(nextGuests);
      setStats(nextStats);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Не удалось загрузить гостей');
    } finally {
      setIsLoading(false);
    }
  }, [actions, route.params.eventId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleUpdateAttendance = async (guestId: string, attendanceStatus: AttendanceStatus) => {
    setUpdatingGuestId(guestId);
    setError(null);

    try {
      await actions.updateGuestAttendance(route.params.eventId, guestId, attendanceStatus);
      await loadData();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Не удалось обновить гостя');
    } finally {
      setUpdatingGuestId(null);
    }
  };

  return (
    <ScreenContainer scrollable>
      <HeaderBack onPress={navigation.goBack} title="Гости и статистика" />

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <PrimaryButton onPress={loadData} style={styles.retryButton} title="Повторить" />
        </View>
      ) : (
        <>
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Статистика</Text>
            <Text style={styles.statLine}>Approved: {stats?.approved ?? 0}</Text>
            <Text style={styles.statLine}>Pending approval: {stats?.pendingApproval ?? 0}</Text>
            <Text style={styles.statLine}>Rejected: {stats?.rejected ?? 0}</Text>
            <Text style={styles.statLine}>Attendance pending: {stats?.attendancePending ?? 0}</Text>
            <Text style={styles.statLine}>Confirmed: {stats?.confirmed ?? 0}</Text>
            <Text style={styles.statLine}>Declined: {stats?.declined ?? 0}</Text>
          </View>

          <View style={styles.list}>
            {guests.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Гостей пока нет</Text>
              </View>
            ) : (
              guests.map((guest) => (
                <View key={guest.id} style={styles.guestCard}>
                  <Text style={styles.guestName}>{guest.fullName}</Text>
                  <Text style={styles.guestLine}>Телефон: {guest.phone || '—'}</Text>
                  <Text style={styles.guestLine}>Approval: {guest.approvalStatus}</Text>
                  <Text style={styles.guestLine}>Attendance: {guest.attendanceStatus}</Text>
                  <Text style={styles.guestLine}>+1: {guest.plusOneCount}</Text>

                  <View style={styles.attendanceRow}>
                    {ATTENDANCE_OPTIONS.map((option) => {
                      const isDisabled = updatingGuestId === guest.id;

                      return (
                        <Pressable
                          accessibilityRole="button"
                          disabled={isDisabled}
                          key={option}
                          onPress={() => handleUpdateAttendance(guest.id, option)}
                          style={({ pressed }) => [
                            styles.attendanceButton,
                            guest.attendanceStatus === option ? styles.attendanceButtonActive : undefined,
                            pressed && !isDisabled ? styles.attendanceButtonPressed : undefined
                          ]}
                          testID={`guest-attendance-${guest.id}-${option}`}
                        >
                          <Text style={styles.attendanceButtonLabel}>{option}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </View>
        </>
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
  statsCard: {
    backgroundColor: theme.colors.surfaceBright,
    borderRadius: theme.radii.xl,
    marginTop: 24,
    padding: 18,
    ...theme.shadows.card
  },
  statsTitle: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 20,
    lineHeight: 24,
    marginBottom: 8
  },
  statLine: {
    color: theme.colors.text,
    fontFamily: theme.typography.regular,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 4
  },
  list: {
    gap: 12,
    marginTop: 20
  },
  guestCard: {
    backgroundColor: theme.colors.surfaceBright,
    borderRadius: theme.radii.xl,
    padding: 16,
    ...theme.shadows.card
  },
  guestName: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 18,
    lineHeight: 24
  },
  guestLine: {
    color: theme.colors.muted,
    fontFamily: theme.typography.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4
  },
  attendanceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14
  },
  attendanceButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  attendanceButtonActive: {
    backgroundColor: theme.colors.primarySoft
  },
  attendanceButtonPressed: {
    opacity: 0.9
  },
  attendanceButtonLabel: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 14,
    lineHeight: 18
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceBright,
    borderRadius: theme.radii.xl,
    padding: 18,
    ...theme.shadows.card
  },
  emptyText: {
    color: theme.colors.muted,
    fontFamily: theme.typography.regular,
    fontSize: 16,
    lineHeight: 22
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
