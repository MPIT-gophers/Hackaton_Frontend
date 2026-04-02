export const theme = {
  colors: {
    backgroundTop: '#E5EFFE',
    backgroundBottom: '#F5F8FD',
    primary: '#57A5F4',
    primarySoft: 'rgba(87, 165, 244, 0.4)',
    primaryBorder: 'rgba(87, 165, 244, 0.5)',
    surface: '#FAFAFC',
    surfaceBright: '#FFFFFF',
    text: '#1E1E1E',
    muted: '#394053',
    danger: '#DB2626',
    successLink: '#469A4F',
    star: '#F5C227',
    shadow: 'rgba(165, 165, 165, 0.25)',
    primaryShadow: 'rgba(87, 165, 244, 0.25)',
    mascotShadow: '#E8EEF9',
    welcomeBadge: '#E7F0FE',
    chatBubbleOutgoing: '#E2EEEA',
    chatInputPlaceholder: 'rgba(30, 30, 30, 0.69)',
    chatSurfaceShadow: 'rgba(213, 213, 213, 0.2)'
  },
  radii: {
    xl: 26,
    lg: 16,
    md: 12
  },
  spacing: {
    screenHorizontal: 24,
    screenTopOffset: 24,
    screenBottomOffset: 40,
    fieldGap: 10,
    sectionGap: 30,
    cardGap: 20,
    floatingChatRight: 20,
    floatingChatBottom: 20,
    floatingChatReserve: 96
  },
  typography: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold'
  },
  shadows: {
    primary: {
      shadowColor: '#57A5F4',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4
    },
    card: {
      shadowColor: '#A5A5A5',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4
    }
  }
} as const;
