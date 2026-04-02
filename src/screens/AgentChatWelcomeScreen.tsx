import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { MockAgentChatScreen } from './MockAgentChatScreen';

type AgentChatWelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'AgentChatWelcome'>;

export function AgentChatWelcomeScreen({ navigation }: AgentChatWelcomeScreenProps) {
  return <MockAgentChatScreen hasUserReply={false} navigation={navigation} />;
}
