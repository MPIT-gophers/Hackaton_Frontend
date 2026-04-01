import { StyleSheet, TextInput, View } from 'react-native';

import { theme } from '../theme';

type RoundedTextAreaProps = {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  testID?: string;
};

export function RoundedTextArea({ placeholder, value, onChangeText, testID }: RoundedTextAreaProps) {
  return (
    <View style={styles.container}>
      <TextInput
        autoCapitalize="sentences"
        autoCorrect={false}
        multiline
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        style={[styles.input, value ? styles.filledInput : undefined]}
        testID={testID}
        textAlignVertical="top"
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaceBright,
    borderRadius: theme.radii.xl,
    minHeight: 166,
    paddingHorizontal: 15,
    paddingVertical: 16
  },
  input: {
    color: theme.colors.muted,
    fontFamily: theme.typography.regular,
    fontSize: 17,
    lineHeight: 22,
    minHeight: 134,
    padding: 0
  },
  filledInput: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 20,
    lineHeight: 24
  }
});
