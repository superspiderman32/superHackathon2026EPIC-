/**
 * Yellow and black color theme with consistent spacing.
 */

import { Platform } from "react-native";

// Yellow & black palette
export const AppColors = {
  background: "#0a0a0a",
  backgroundSecondary: "#1a1a1a",
  backgroundTertiary: "#252525",
  primary: "rgb(255, 192, 1)",
  primaryDark: "#E6B800",
  primaryMuted: "rgba(255, 215, 0, 0.6)",
  text: "#FFFFFF",
  textMuted: "rgba(255, 255, 255, 0.7)",
  textDim: "rgba(255, 255, 255, 0.5)",
  border: "rgba(255, 255, 255, 0.15)",
  borderMuted: "rgba(255, 255, 255, 0.08)",
  success: "#4ade80",
  error: "#f87171",
  chartGradientFrom: "rgba(0, 0, 0, 0)",
  chartGradientTo: "rgb(255, 186, 10)",
};

// Consistent spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  screenPadding: 16,
  sectionGap: 24,
};

// For useThemeColor compatibility (light/dark both use yellow/black)
const tintColor = AppColors.primary;

export const Colors = {
  light: {
    text: AppColors.text,
    background: AppColors.background,
    tint: tintColor,
    icon: AppColors.textMuted,
    tabIconDefault: AppColors.textDim,
    tabIconSelected: tintColor,
  },
  dark: {
    text: AppColors.text,
    background: AppColors.background,
    tint: tintColor,
    icon: AppColors.textMuted,
    tabIconDefault: AppColors.textDim,
    tabIconSelected: tintColor,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "normal",
    mono: "monospace",
  },
});
