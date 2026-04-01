import { Image, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { CheckCircleIcon } from '../components/icons';
import { useAppContext } from '../context/AppContext';
import { imageAssets } from '../data/assets';
import { theme } from '../theme';

const AUTH_HERO_ASPECT_RATIO = 451 / 248;

export function AuthScreen() {
  const { actions } = useAppContext();

  return (
    <ScreenContainer contentStyle={styles.content}>
      <View style={styles.heroWrap}>
        <Text style={styles.heroText}>Добро пожаловать!</Text>
        <Image resizeMode="contain" source={imageAssets.authHero} style={styles.heroImage} />
      </View>

      <PrimaryButton onPress={actions.signIn} style={styles.button} testID="auth-button" title="Авторизоваться" />

      <View style={styles.featureList}>
        <FeatureItem text="Ввод параметров события" />
        <FeatureItem text="Диалог с AI-агентом" />
      </View>
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
    justifyContent: 'flex-start'
  },
  heroWrap: {
    marginTop: 38,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  heroText: {
    color: theme.colors.text,
    fontFamily: theme.typography.semiBold,
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 16,
    textAlign: 'center'
  },
  heroImage: {
    aspectRatio: AUTH_HERO_ASPECT_RATIO,
    width: '100%'
  },
  button: {
    marginTop: 24
  },
  featureList: {
    gap: 10,
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
  }
});
