import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';
import { BackArrowIcon } from './icons';

type HeaderBackProps = {
  title: string;
  onPress: () => void;
  testID?: string;
};

export function HeaderBack({ title, onPress, testID }: HeaderBackProps) {
  return (
    <View style={styles.container}>
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.button} testID={testID}>
        <BackArrowIcon />
        <Text style={styles.title}>{title}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 26,
    justifyContent: 'center'
  },
  button: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 15
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22
  }
});
