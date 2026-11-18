/**
 * PetMotion — design tokens.
 * Paleta tirada do universo do passeio (ver CLAUDE.md):
 * bola de tênis (energia), pinheiro (confiança), neblina do parque (calma),
 * língua (afeto), poça (água), sol (recompensa).
 */
export const theme = {
  colors: {
    background: '#EEF2EC',
    surface: '#FAFCF8',
    surfaceAlt: '#E3EAE2',
    primary: '#C9F24B',
    primaryDeep: '#A9D12A',
    ink: '#0F2A24',
    inkSoft: '#1C3D35',
    inkLine: '#2C4F46',
    onInk: '#EEF2EC',
    onInkMuted: '#A9BDB3',
    text: '#0F2A24',
    textMuted: '#5B6B64',
    line: '#D9E2DA',
    blush: '#FF7A8A',
    blushSoft: '#FFE3E6',
    sky: '#7FB8E6',
    skySoft: '#DCEEFA',
    sun: '#FFC24D',
    sunSoft: '#FFF1C9',
    earth: '#B98B5E',
    earthSoft: '#F1E4D6',
    danger: '#FF3B30',
    success: '#2FA36B',
    white: '#FFFFFF',
    skeleton: '#DCE4DB',
    overlay: 'rgba(15, 42, 36, 0.55)',
  },
  spacing: {
    xxs: 4,
    xs: 8,
    small: 12,
    medium: 16,
    large: 24,
    xl: 32,
    xxl: 48,
  },
  radii: {
    small: 10,
    medium: 18,
    large: 28,
    pill: 999,
  },
  fontSizes: {
    caption: 12,
    small: 14,
    medium: 16,
    large: 18,
    xl: 22,
    xxl: 28,
    display: 36,
    hero: 56,
  },
  fonts: {
    display: 'BricolageGrotesque_800ExtraBold',
    displayBold: 'BricolageGrotesque_700Bold',
    body: 'Manrope_500Medium',
    bodySemi: 'Manrope_600SemiBold',
    bodyBold: 'Manrope_700Bold',
    bodyHeavy: 'Manrope_800ExtraBold',
  },
  motion: {
    fast: 160,
    base: 260,
    slow: 420,
    spring: { damping: 16, stiffness: 180, mass: 0.9 },
    springBouncy: { damping: 9, stiffness: 160, mass: 0.8 },
  },
} as const;

export type AppTheme = typeof theme;
