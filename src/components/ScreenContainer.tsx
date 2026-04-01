import { PropsWithChildren } from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../theme';

type ScreenContainerProps = PropsWithChildren<{
  scrollable?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}>;

export function ScreenContainer({
  children,
  scrollable = false,
  contentStyle,
  keyboardShouldPersistTaps = 'handled'
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const sharedContentStyle = [
    styles.content,
    {
      paddingTop: insets.top + theme.spacing.screenTopOffset,
      paddingBottom: Math.max(insets.bottom, 16) + theme.spacing.screenBottomOffset
    },
    contentStyle
  ];

  return (
    <LinearGradient colors={[theme.colors.backgroundTop, theme.colors.backgroundBottom]} style={styles.root}>
      {scrollable ? (
        <ScrollView
          bounces={false}
          contentContainerStyle={sharedContentStyle}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={sharedContentStyle}>{children}</View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screenHorizontal
  }
});
