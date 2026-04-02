import { NavigationContext, NavigationRouteContext } from '@react-navigation/native';
import { render, fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AgentChatConversationScreen } from '../src/screens/AgentChatConversationScreen';
import { AgentChatWelcomeScreen } from '../src/screens/AgentChatWelcomeScreen';

function renderWelcomeScreen() {
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn()
  } as any;

  const screen = render(
    <SafeAreaProvider>
      <NavigationContext.Provider value={navigation}>
        <NavigationRouteContext.Provider value={{ key: 'AgentChatWelcome', name: 'AgentChatWelcome' } as any}>
          <AgentChatWelcomeScreen navigation={navigation} route={{ key: 'AgentChatWelcome', name: 'AgentChatWelcome' } as any} />
        </NavigationRouteContext.Provider>
      </NavigationContext.Provider>
    </SafeAreaProvider>
  );

  return {
    ...screen,
    navigation
  };
}

function renderConversationScreen() {
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn()
  } as any;

  const screen = render(
    <SafeAreaProvider>
      <NavigationContext.Provider value={navigation}>
        <NavigationRouteContext.Provider value={{ key: 'AgentChatConversation', name: 'AgentChatConversation' } as any}>
          <AgentChatConversationScreen navigation={navigation} route={{ key: 'AgentChatConversation', name: 'AgentChatConversation' } as any} />
        </NavigationRouteContext.Provider>
      </NavigationContext.Provider>
    </SafeAreaProvider>
  );

  return {
    ...screen,
    navigation
  };
}

describe('agent chat mock screens', () => {
  it('opens the filled state from the welcome mock screen', () => {
    const { getByText, getByTestId, navigation } = renderWelcomeScreen();

    expect(getByText('Чат с Агентом')).toBeTruthy();
    expect(getByText('Привет! Меня зовут Макс, я тебе помогу тебе с оформлением праздника!')).toBeTruthy();

    fireEvent.press(getByTestId('agent-chat-send-button'));

    expect(navigation.navigate).toHaveBeenCalledWith('AgentChatConversation');
  });

  it('renders the user reply on the second mock screen', () => {
    const { getByText } = renderConversationScreen();

    expect(getByText('Йоу приятный пластик у тебя робот)')).toBeTruthy();
  });
});
