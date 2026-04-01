import { StyleSheet, TextInput, View } from 'react-native';

import { theme } from '../theme';

const BASE_FONT_SIZE = 17;
const PADDING_H = 15;
const CHAR_WIDTH_FACTOR = 1.15;
const MIN_FONT_SCALE = 0.75;

export { BASE_FONT_SIZE, PADDING_H, CHAR_WIDTH_FACTOR, MIN_FONT_SCALE };

type RoundedInputProps = {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  invalid?: boolean;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  bright?: boolean;
  testID?: string;
  editable?: boolean;
  compact?: boolean;
  placeholderFontSize?: number;
};

export function RoundedInput({
  placeholder,
  value,
  onChangeText,
  invalid = false,
  keyboardType = 'default',
  bright = false,
  testID,
  editable = true,
  compact = false,
  placeholderFontSize
}: RoundedInputProps) {
  const fontOverride = !value && placeholderFontSize != null
    ? { fontSize: placeholderFontSize }
    : undefined;

  return (
    <View
      style={[styles.container, bright ? styles.bright : undefined, invalid ? styles.invalid : undefined]}
    >
      <TextInput
        autoCapitalize="sentences"
        autoCorrect={false}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        editable={editable}
        style={[
          styles.input,
          compact ? styles.compactInput : undefined,
          value ? styles.filledInput : undefined,
          compact && value ? styles.compactFilledInput : undefined,
          fontOverride
        ]}
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
  },
  compactInput: {
    fontSize: 17,
    lineHeight: 22
  },
  compactFilledInput: {
    fontSize: 17,
    lineHeight: 22
  }
});
