import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HeaderBack } from '../components/HeaderBack';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { VenueCard } from '../components/VenueCard';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';

type VenuesListScreenProps = NativeStackScreenProps<RootStackParamList, 'VenuesList'>;

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 90_000;

function formatVenueCount(count: number) {
  const normalizedCount = Math.abs(count) % 100;
  const lastDigit = normalizedCount % 10;

  if (normalizedCount >= 11 && normalizedCount <= 14) {
    return `${count} мест`;
  }

  if (lastDigit === 1) {
    return `${count} место`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${count} места`;
  }

  return `${count} мест`;
}

export function VenuesListScreen({ navigation }: VenuesListScreenProps) {
  const { state, actions } = useAppContext();
  const [isLoading, setIsLoading] = useState(() => state.venues.length === 0);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const eventId = state.pendingEventId;

  const pollForVenues = useCallback(async () => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);

    const startTime = Date.now();
    let active = true;

    const poll = async () => {
      while (active && isMountedRef.current) {
        if (Date.now() - startTime > POLL_TIMEOUT_MS) {
          if (isMountedRef.current) {
            setError('Подбор заведений занимает слишком много времени. Попробуйте позже.');
            setIsLoading(false);
          }
          return;
        }

        try {
          const result = await actions.pollEventVenues(eventId);

          if (!isMountedRef.current) {
            return;
          }

          if (result.ready && result.venues.length > 0) {
            setIsLoading(false);
            return;
          }
        } catch (nextError) {
          if (!isMountedRef.current) {
            return;
          }

          setError(nextError instanceof Error ? nextError.message : 'Не удалось загрузить заведения');
          setIsLoading(false);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
    };

    await poll();

    return () => {
      active = false;
    };
  }, [actions, eventId]);

  useEffect(() => {
    isMountedRef.current = true;

    if (state.venues.length === 0) {
      void pollForVenues();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [pollForVenues, state.venues.length]);

  const handleRetry = () => {
    void pollForVenues();
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <HeaderBack onPress={navigation.goBack} title="Список заведений" />
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.loadingText}>Подбираем заведения...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <HeaderBack onPress={navigation.goBack} title="Список заведений" />
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <PrimaryButton onPress={handleRetry} style={styles.retryButton} title="Повторить" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <HeaderBack onPress={navigation.goBack} title="Список заведений" />

      <Text style={styles.summary} testID="venues-list-summary">
        Найдено {formatVenueCount(state.venues.length)}
      </Text>

      <View style={styles.list}>
        {state.venues.map((venue) => (
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
  summary: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 20,
    lineHeight: 24,
    marginTop: 30
  },
  list: {
    gap: 15,
    marginTop: 15
  },
  centerState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  loadingText: {
    color: theme.colors.muted,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22,
    marginTop: 16,
    textAlign: 'center'
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
