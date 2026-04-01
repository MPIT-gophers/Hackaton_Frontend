import { Pressable, StyleSheet, View } from 'react-native';

import { theme } from '../theme';

type ToggleProps = {
  value: boolean;
  onPress: () => void;
  testID?: string;
};

export function Toggle({ value, onPress, testID }: ToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={onPress}
      style={[styles.track, !value ? styles.trackOff : undefined]}
      testID={testID}
    >
      <View style={[styles.thumb, !value ? styles.thumbOff : undefined]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceBright,
    borderColor: theme.colors.primaryBorder,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 25,
    justifyContent: 'flex-end',
    width: 50
  },
  trackOff: {
    justifyContent: 'flex-start'
  },
  thumb: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12.5,
    height: 25,
    width: 25
  },
  thumbOff: {
    backgroundColor: theme.colors.primarySoft
  }
});
