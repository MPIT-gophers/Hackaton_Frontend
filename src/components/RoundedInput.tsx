import { StyleSheet, TextInput, View } from 'react-native';

import { theme } from '../theme';

type RoundedInputProps = {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  invalid?: boolean;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  bright?: boolean;
  testID?: string;
};

export function RoundedInput({
  placeholder,
  value,
  onChangeText,
  invalid = false,
  keyboardType = 'default',
  bright = false,
  testID
}: RoundedInputProps) {
  return (
    <View style={[styles.container, bright ? styles.bright : undefined, invalid ? styles.invalid : undefined]}>
      <TextInput
        autoCapitalize="sentences"
        autoCorrect={false}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        style={[styles.input, value ? styles.filledInput : undefined]}
        testID={testID}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 15,
    paddingVertical: 13,
    ...theme.shadows.card
  },
  bright: {
    backgroundColor: theme.colors.surfaceBright
  },
  invalid: {
    borderColor: theme.colors.danger,
    borderWidth: 2,
    paddingHorizontal: 13,
    paddingVertical: 11
  },
  input: {
    color: theme.colors.muted,
    fontFamily: theme.typography.regular,
    fontSize: 17,
    lineHeight: 22,
    padding: 0
  },
  filledInput: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 20,
    lineHeight: 24
  }
});
