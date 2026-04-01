import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { theme } from '../theme';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
};

export function PrimaryButton({ title, onPress, disabled = false, loading = false, style, testID }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [styles.button, style, pressed && !disabled ? styles.pressed : undefined, disabled ? styles.disabled : undefined]}
      testID={testID}
    >
      {loading ? <ActivityIndicator color={theme.colors.surfaceBright} /> : <Text style={styles.label}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.xl,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 10,
    paddingVertical: 14,
    ...theme.shadows.primary
  },
  pressed: {
    opacity: 0.94,
    transform: [{ translateY: -1 }]
  },
  disabled: {
    opacity: 0.6
  },
  label: {
    color: theme.colors.surfaceBright,
    fontFamily: theme.typography.semiBold,
    fontSize: 20,
    lineHeight: 24
  }
});
