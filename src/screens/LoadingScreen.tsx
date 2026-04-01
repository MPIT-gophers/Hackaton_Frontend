import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ScreenContainer } from '../components/ScreenContainer';
import { theme } from '../theme';

export function LoadingScreen() {
  return (
    <ScreenContainer contentStyle={styles.content}>
      <View style={styles.loaderWrap}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center'
  },
  loaderWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  }
});
