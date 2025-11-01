export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export type Mode = 'focus' | 'break';

export interface ThemeColors {
  backgroundColor: string;
  textColor: string;
  modeColor: string;
  modeTextColor: string;
  taskPanelBg: string;
  inputBg: string;
  inputBorder: string;
  secondaryButtonBg: string;
  secondaryButtonBorder: string;
  secondaryButtonText: string;
  ringBackgroundColor: string;
}
