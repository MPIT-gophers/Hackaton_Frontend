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
    danger: '#CF1414',
    star: '#F5C227',
    shadow: 'rgba(87, 105, 141, 0.08)',
    primaryShadow: 'rgba(87, 165, 244, 0.25)',
    mascotShadow: '#E8EEF9',
    welcomeBadge: '#E7F0FE'
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
    cardGap: 20
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
      shadowColor: '#57698D',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 4
    }
  }
} as const;
