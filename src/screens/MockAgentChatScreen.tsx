import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenContainer } from '../components/ScreenContainer';
import { imageAssets } from '../data/assets';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';
import { BackArrowIcon, SendIcon } from '../components/icons';

type MockAgentChatScreenProps = {
  navigation: NativeStackScreenProps<RootStackParamList, 'AgentChatWelcome' | 'AgentChatConversation'>['navigation'];
  hasUserReply: boolean;
};

const AGENT_MESSAGE = 'Привет! Меня зовут Макс, я тебе помогу тебе с оформлением праздника!';
const USER_MESSAGE = 'Йоу приятный пластик у тебя робот)';

export function MockAgentChatScreen({ navigation, hasUserReply }: MockAgentChatScreenProps) {
  const handleSend = () => {
    if (!hasUserReply) {
      navigation.navigate('AgentChatConversation');
    }
  };

  return (
    <ScreenContainer contentStyle={styles.content} showAgentChatShortcut={false}>
      <View>
        <View style={styles.headerWrap}>
          <Pressable accessibilityRole="button" onPress={navigation.goBack} style={styles.backButton} testID="agent-chat-back-button">
            <BackArrowIcon />
          </Pressable>

          <View style={styles.titleChip}>
            <View style={styles.avatarWrap}>
              <Image source={imageAssets.agentAvatar} style={styles.avatarImage} />
            </View>
            <Text style={styles.title}>Чат с Агентом</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomStack}>
        <View style={styles.messagesStack}>
          <View style={[styles.messageBubble, styles.agentBubble]}>
            <Text style={styles.messageText}>{AGENT_MESSAGE}</Text>
          </View>

          {hasUserReply ? (
            <View style={[styles.messageBubble, styles.userBubble]}>
              <Text style={styles.messageText}>{USER_MESSAGE}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.composer}>
          <Text style={styles.placeholder}>Сообщение</Text>
          <Pressable accessibilityRole="button" onPress={handleSend} style={({ pressed }) => [styles.sendButton, pressed ? styles.sendButtonPressed : undefined]} testID="agent-chat-send-button">
            <SendIcon />
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'space-between'
  },
  headerWrap: {
    alignItems: 'center',
    minHeight: 46,
    paddingTop: 2
  },
  backButton: {
    left: 0,
    paddingVertical: 12,
    position: 'absolute',
    top: 4
  },
  titleChip: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: theme.colors.surfaceBright,
    borderRadius: 26,
    flexDirection: 'row',
    height: 46,
    paddingLeft: 46,
    paddingRight: 24,
    shadowColor: theme.colors.chatSurfaceShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3
  },
  avatarWrap: {
    backgroundColor: theme.colors.surfaceBright,
    borderRadius: 23,
    height: 46,
    justifyContent: 'center',
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    width: 46
  },
  avatarImage: {
    height: 40,
    marginLeft: -1,
    marginTop: 1,
    width: 40
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22
  },
  bottomStack: {
    gap: 24
  },
  messagesStack: {
    gap: 20
  },
  messageBubble: {
    minHeight: 73,
    paddingHorizontal: 16,
    paddingVertical: 15,
    width: 247
  },
  agentBubble: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surfaceBright,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 22
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.chatBubbleOutgoing,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 0
  },
  messageText: {
    color: '#000000',
    fontFamily: theme.typography.regular,
    fontSize: 15.5,
    lineHeight: 20
  },
  composer: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceBright,
    borderRadius: 300,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 50,
    paddingLeft: 30,
    paddingRight: 0,
    shadowColor: theme.colors.chatSurfaceShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3
  },
  placeholder: {
    color: theme.colors.chatInputPlaceholder,
    fontFamily: theme.typography.regular,
    fontSize: 20,
    lineHeight: 24
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    width: 50
  },
  sendButtonPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.98 }]
  }
});
