// Tokens de diseño extraídos fielmente de design.md
export const theme = {
  colors: {
    primary: '#C6F70A',
    primaryHover: '#B7F000',
    primaryActive: '#D0FF32',
    background: '#111111',
    surface: '#1E1E1E',
    surfaceSecondary: '#242424',
    surfaceTertiary: '#2B2B2B',
    input: '#303030',
    textPrimary: '#FFFFFF',
    textSecondary: '#B5B5B5',
    textMuted: '#7A7A7A',
    borderSubtle: 'rgba(255,255,255,0.08)',
    success: '#C6F70A',
    error: '#FF6B6B',
    locationDestination: '#FF7D7D',
    locationCurrent: '#61B8FF',
  },
  rounded: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    '2xl': 32,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
  },
  typography: {
    h1: {
      fontFamily: 'Inter-ExtraBold',
      fontSize: 36,
      lineHeight: 40,
      letterSpacing: -0.72,
    },
    h2: {
      fontFamily: 'Inter-Bold',
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: -0.28,
    },
    bodyLg: {
      fontFamily: 'Inter-Medium',
      fontSize: 16,
      lineHeight: 24,
    },
    bodyMd: {
      fontFamily: 'Inter-Regular',
      fontSize: 15,
      lineHeight: 22,
    },
    caption: {
      fontFamily: 'Inter-Regular',
      fontSize: 13,
      lineHeight: 18,
    },
    button: {
      fontFamily: 'Inter-Bold',
      fontSize: 16,
      lineHeight: 20,
    },
  },
};

export type Theme = typeof theme;
