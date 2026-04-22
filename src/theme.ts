export interface ThemeColors {
  bg: string;
  card: string;
  border: string;
  borderMuted: string;
  textPrimary: string;
  textSecondary: string;
  textSubtle: string;
  textMuted: string;
  positive: string;
  danger: string;
  dangerBg: string;
  accent: string;
  accentText: string;
  progressTrack: string;
  tableRowAlt: string;
  teamA: { bg: string; border: string; solid: string; text: string };
  teamB: { bg: string; border: string; solid: string; text: string };
}

export const darkColors: ThemeColors = {
  bg: '#09090b',
  card: '#18181b',
  border: '#27272a',
  borderMuted: '#3f3f46',
  textPrimary: '#ffffff',
  textSecondary: '#a1a1aa',
  textSubtle: '#71717a',
  textMuted: '#52525b',
  positive: '#34d399',
  danger: '#f87171',
  dangerBg: 'rgba(239,68,68,0.1)',
  accent: '#ffffff',
  accentText: '#09090b',
  progressTrack: '#27272a',
  tableRowAlt: 'rgba(39,39,42,0.4)',
  teamA: {
    bg: 'rgba(23,37,84,0.5)',
    border: '#1e40af',
    solid: '#3b82f6',
    text: '#93c5fd',
  },
  teamB: {
    bg: 'rgba(69,26,3,0.5)',
    border: '#92400e',
    solid: '#f59e0b',
    text: '#fcd34d',
  },
};

export const lightColors: ThemeColors = {
  bg: '#f4f4f5',
  card: '#ffffff',
  border: '#e4e4e7',
  borderMuted: '#d4d4d8',
  textPrimary: '#09090b',
  textSecondary: '#52525b',
  textSubtle: '#71717a',
  textMuted: '#a1a1aa',
  positive: '#059669',
  danger: '#dc2626',
  dangerBg: 'rgba(220,38,38,0.08)',
  accent: '#09090b',
  accentText: '#ffffff',
  progressTrack: '#e4e4e7',
  tableRowAlt: 'rgba(244,244,245,0.8)',
  teamA: {
    bg: 'rgba(239,246,255,0.8)',
    border: '#93c5fd',
    solid: '#3b82f6',
    text: '#1d4ed8',
  },
  teamB: {
    bg: 'rgba(255,251,235,0.8)',
    border: '#fcd34d',
    solid: '#f59e0b',
    text: '#b45309',
  },
};
