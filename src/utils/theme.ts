import { Mode, ThemeColors } from '../types';

export const getThemeColors = (mode: Mode, isDark: boolean): ThemeColors => {
  const modeColor = mode === 'focus' ? '#8AB4D5' : '#C8A68A';
  const modeTextColor = isDark ? '#999999' : '#666666';

  if (isDark) {
    return {
      backgroundColor: '#1A1A1A',
      textColor: '#FFFFFF',
      modeColor,
      modeTextColor,
      taskPanelBg: '#2A2A2A',
      inputBg: '#3A3A3A',
      inputBorder: '#4A4A4A',
      secondaryButtonBg: '#2A2A2A',
      secondaryButtonBorder: '#4A4A4A',
      secondaryButtonText: '#CCCCCC',
      ringBackgroundColor: '#3A3A3A',
    };
  }

  return {
    backgroundColor: '#F5F5F5',
    textColor: '#2C3E50',
    modeColor,
    modeTextColor,
    taskPanelBg: '#FFFFFF',
    inputBg: '#F8F9FA',
    inputBorder: '#E0E0E0',
    secondaryButtonBg: '#FFFFFF',
    secondaryButtonBorder: '#E0E0E0',
    secondaryButtonText: '#666666',
    ringBackgroundColor: '#E8E8E8',
  };
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
