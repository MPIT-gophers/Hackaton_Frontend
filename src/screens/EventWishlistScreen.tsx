import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HeaderBack } from '../components/HeaderBack';
import { PrimaryButton } from '../components/PrimaryButton';
import { RoundedInput } from '../components/RoundedInput';
import { RoundedTextArea } from '../components/RoundedTextArea';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';
import { normalizeWishlistItems, stringifyUnknown } from '../utils/backendData';

type EventWishlistScreenProps = NativeStackScreenProps<RootStackParamList, 'EventWishlist'>;

export function EventWishlistScreen({ navigation, route }: EventWishlistScreenProps) {
  const { actions } = useAppContext();
  const [wishlist, setWishlist] = useState<unknown>(null);
  const [parseResult, setParseResult] = useState<unknown>(null);
  const [ideaResult, setIdeaResult] = useState<unknown>(null);
  const [parseText, setParseText] = useState('');
  const [ideaText, setIdeaText] = useState('');
  const [fundValues, setFundValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = useMemo(() => normalizeWishlistItems(wishlist), [wishlist]);

  const loadWishlist = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await actions.getWishlist(route.params.eventId);
      setWishlist(response);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Не удалось загрузить wishlist');
    } finally {
      setIsLoading(false);
    }
  }, [actions, route.params.eventId]);

  useEffect(() => {
    void loadWishlist();
  }, [loadWishlist]);

  const handleParse = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await actions.parseWishlistText(route.params.eventId, parseText.trim());
      setParseResult(response);
      await loadWishlist();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Не удалось разобрать wishlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIdea = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await actions.submitWishlistIdea(route.params.eventId, ideaText.trim());
      setIdeaResult(response);
      await loadWishlist();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Не удалось отправить идею');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBook = async (itemId: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await actions.bookWishlistItem(route.params.eventId, itemId);
      await loadWishlist();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Не удалось забронировать item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFund = async (itemId: string) => {
    const rawAmount = fundValues[itemId] ?? '';
    const amount = Number(rawAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Введите корректную сумму');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await actions.fundWishlistItem(route.params.eventId, itemId, amount);
      await loadWishlist();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Не удалось отправить финансирование');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer scrollable keyboardShouldPersistTaps="handled">
      <HeaderBack onPress={navigation.goBack} title="Wishlist" />

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      ) : (
        <>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Текущий wishlist</Text>
            {items.length > 0 ? (
              items.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {item.subtitle ? <Text style={styles.itemSubtitle}>{item.subtitle}</Text> : null}

                  <PrimaryButton loading={isSubmitting} onPress={() => handleBook(item.id)} style={styles.smallButton} title="Забронировать" />
                  <RoundedInput
                    bright
                    keyboardType="numeric"
                    onChangeText={(value) =>
                      setFundValues((current) => ({
                        ...current,
                        [item.id]: value
                      }))
                    }
                    placeholder="Сумма"
                    testID={`wishlist-fund-input-${item.id}`}
                    value={fundValues[item.id] ?? ''}
                  />
                  <PrimaryButton loading={isSubmitting} onPress={() => handleFund(item.id)} style={styles.smallButton} title="Профинансировать" />
                </View>
              ))
            ) : (
              <Text style={styles.rawText}>{stringifyUnknown(wishlist)}</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Разобрать свободный текст</Text>
            <RoundedTextArea onChangeText={setParseText} placeholder="Например: хочу PS5, Lego, без духов" testID="wishlist-parse-input" value={parseText} />
            <PrimaryButton loading={isSubmitting} onPress={handleParse} style={styles.actionButton} testID="wishlist-parse-button" title="Разобрать" />
            {parseResult ? <Text style={styles.rawText}>{stringifyUnknown(parseResult)}</Text> : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Предложить идею</Text>
            <RoundedTextArea onChangeText={setIdeaText} placeholder="Текст идеи подарка" testID="wishlist-idea-input" value={ideaText} />
            <PrimaryButton loading={isSubmitting} onPress={handleIdea} style={styles.actionButton} testID="wishlist-idea-button" title="Отправить идею" />
            {ideaResult ? <Text style={styles.rawText}>{stringifyUnknown(ideaResult)}</Text> : null}
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
  section: {
    backgroundColor: theme.colors.surfaceBright,
    borderRadius: theme.radii.xl,
    marginTop: 20,
    padding: 16,
    ...theme.shadows.card
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 12
  },
  itemCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    marginTop: 10,
    padding: 12
  },
  itemTitle: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 16,
    lineHeight: 22
  },
  itemSubtitle: {
    color: theme.colors.muted,
    fontFamily: theme.typography.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4
  },
  smallButton: {
    marginTop: 10
  },
  actionButton: {
    marginTop: 14
  },
  rawText: {
    color: theme.colors.muted,
    fontFamily: theme.typography.regular,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12
  },
  errorText: {
    color: theme.colors.danger,
    fontFamily: theme.typography.medium,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 20,
    textAlign: 'center'
  }
});
