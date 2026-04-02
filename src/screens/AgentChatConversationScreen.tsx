import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { MockAgentChatScreen } from './MockAgentChatScreen';

type AgentChatConversationScreenProps = NativeStackScreenProps<RootStackParamList, 'AgentChatConversation'>;

export function AgentChatConversationScreen({ navigation }: AgentChatConversationScreenProps) {
  return <MockAgentChatScreen hasUserReply navigation={navigation} />;
}
