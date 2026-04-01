import { ActivityIndicator, Dimensions, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { CheckCircleIcon } from '../components/icons';
import { useAppContext } from '../context/AppContext';
import { imageAssets } from '../data/assets';
import { theme } from '../theme';

const AUTH_HERO_ASPECT_RATIO = 451 / 248;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export function AuthScreen() {
  const { state, actions } = useAppContext();
  const isWeb = Platform.OS === 'web';
  const isWaiting = state.session.status === 'starting' || state.session.status === 'waiting_confirmation' || state.session.status === 'exchanging';
  const isError = state.session.status === 'error';

  return (
    <ScreenContainer contentStyle={styles.content} scrollable>
      <View style={styles.topSection}>
        <Image resizeMode="contain" source={imageAssets.authHero} style={styles.heroImage} />

        <View style={styles.featureList}>
          <FeatureItem text="Ввод параметров события" />
        </View>
      </View>

      {isWeb ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Авторизация через MAX доступна в мобильной версии</Text>
          <Text style={styles.stateDescription}>Откройте приложение на iOS или Android, чтобы подтвердить вход через MAX.</Text>
        </View>
      ) : isWaiting ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.stateTitle}>Подтвердите вход в MAX</Text>
          <Text style={styles.stateDescription}>После подтверждения мы автоматически завершим вход и вернём вас в приложение.</Text>
          {state.session.errorMessage ? <Text style={styles.errorText}>{state.session.errorMessage}</Text> : null}
          {state.session.pendingMaxLink ? (
            <Pressable accessibilityRole="button" onPress={actions.reopenMax} style={styles.secondaryButton} testID="auth-open-max-button">
              <Text style={styles.secondaryButtonLabel}>Открыть MAX ещё раз</Text>
            </Pressable>
          ) : null}
        </View>
      ) : isError ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Не получилось войти</Text>
          <Text style={styles.errorText}>{state.session.errorMessage}</Text>
          <PrimaryButton onPress={actions.retryAuth} style={styles.button} testID="auth-retry-button" title="Попробовать снова" />
        </View>
      ) : (
        <PrimaryButton onPress={actions.signIn} style={styles.button} testID="auth-button" title="Авторизоваться" />
      )}
    </ScreenContainer>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureItem}>
      <CheckCircleIcon />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'space-between'
  },
  topSection: {
    alignItems: 'center'
  },
  heroText: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 26,
    lineHeight: 31,
    marginTop: 182,
    textAlign: 'center'
  },
  heroImage: {
    aspectRatio: AUTH_HERO_ASPECT_RATIO,
    marginTop: 16,
    maxHeight: SCREEN_HEIGHT * 0.3,
    width: '65%'
  },
  featureList: {
    alignSelf: 'flex-start',
    marginTop: 30
  },
  featureItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15
  },
  featureText: {
    color: theme.colors.muted,
    fontFamily: theme.typography.regular,
    fontSize: 17,
    lineHeight: 22
  },
  stateCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceBright,
    borderRadius: theme.radii.xl,
    marginTop: 24,
    paddingHorizontal: 18,
    paddingVertical: 24,
    width: '100%',
    ...theme.shadows.card
  },
  stateTitle: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 20,
    lineHeight: 24,
    marginTop: 16,
    textAlign: 'center'
  },
  stateDescription: {
    color: theme.colors.muted,
    fontFamily: theme.typography.regular,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center'
  },
  button: {
    marginTop: 32,
    width: '100%'
  },
  secondaryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  secondaryButtonLabel: {
    color: theme.colors.primary,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22,
    textAlign: 'center'
  },
  errorText: {
    color: theme.colors.danger,
    fontFamily: theme.typography.medium,
    fontSize: 15,
    lineHeight: 20,
    marginTop: 14,
    textAlign: 'center'
  }
});
