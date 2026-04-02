import { Image, Pressable, StyleSheet } from 'react-native';

import { imageAssets } from '../data/assets';
import { theme } from '../theme';

type AgentChatShortcutProps = {
  onPress: () => void;
};

export function AgentChatShortcut({ onPress }: AgentChatShortcutProps) {
  return (
    <Pressable
      accessibilityLabel="Открыть чат с агентом"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed ? styles.pressed : undefined]}
      testID="agent-chat-shortcut-button"
    >
      <Image resizeMode="cover" source={imageAssets.agentAvatar} style={styles.image} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceBright,
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 72,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }]
  },
  image: {
    height: 72,
    marginLeft: -10,
    marginTop: 18,
    width: 72
  }
});
