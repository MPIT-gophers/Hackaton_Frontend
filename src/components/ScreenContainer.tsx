import { PropsWithChildren, useContext } from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContext, NavigationRouteContext } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../theme';
import { AgentChatShortcut } from './AgentChatShortcut';

type ScreenContainerProps = PropsWithChildren<{
  scrollable?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  showAgentChatShortcut?: boolean;
}>;

const AGENT_CHAT_HIDDEN_ROUTES = new Set(['AgentChatWelcome', 'AgentChatConversation']);

export function ScreenContainer({
  children,
  scrollable = false,
  contentStyle,
  keyboardShouldPersistTaps = 'handled',
  showAgentChatShortcut = true
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const navigation = useContext(NavigationContext);
  const route = useContext(NavigationRouteContext);
  const shouldShowAgentChatShortcut = Boolean(
    showAgentChatShortcut &&
      navigation &&
      route?.name &&
      !AGENT_CHAT_HIDDEN_ROUTES.has(route.name)
  );
  const extraBottomPadding = shouldShowAgentChatShortcut ? theme.spacing.floatingChatReserve : 0;
  const sharedContentStyle = [
    styles.content,
    {
      paddingTop: insets.top + theme.spacing.screenTopOffset,
      paddingBottom: Math.max(insets.bottom, 16) + theme.spacing.screenBottomOffset + extraBottomPadding
    },
    contentStyle
  ];

  return (
    <LinearGradient colors={[theme.colors.backgroundTop, theme.colors.backgroundBottom]} style={styles.root}>
      {scrollable ? (
        <ScrollView
          bounces={false}
          contentContainerStyle={sharedContentStyle}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={sharedContentStyle}>{children}</View>
      )}

      {shouldShowAgentChatShortcut ? (
        <View
          pointerEvents="box-none"
          style={[
            styles.shortcutWrap,
            {
              bottom: Math.max(insets.bottom, 16) + theme.spacing.floatingChatBottom,
              right: theme.spacing.floatingChatRight
            }
          ]}
        >
          <AgentChatShortcut onPress={() => navigation?.navigate('AgentChatWelcome' as never)} />
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screenHorizontal
  },
  shortcutWrap: {
    position: 'absolute'
  }
});
