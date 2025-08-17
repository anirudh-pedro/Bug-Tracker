export const Colors = {
  // Primary Colors
  primary: '#007AFF',
  primaryDark: '#0056CC',
  primaryLight: '#4DA6FF',
  
  // Secondary Colors
  secondary: '#6c757d',
  secondaryDark: '#545b62',
  secondaryLight: '#848a91',
  
  // Status Colors
  success: '#34C759',
  successDark: '#28A745',
  successLight: '#5ED670',
  
  warning: '#FF9500',
  warningDark: '#E5890A',
  warningLight: '#FFB84D',
  
  danger: '#FF3B30',
  dangerDark: '#DC3545',
  dangerLight: '#FF6B61',
  
  info: '#17A2B8',
  infoDark: '#138496',
  infoLight: '#46B5D1',
  
  // Priority Colors
  critical: '#FF3B30',
  high: '#FF9500',
  medium: '#FFCC00',
  low: '#34C759',
  
  // Status Colors for Bugs
  open: '#FF3B30',
  inProgress: '#007AFF',
  resolved: '#34C759',
  closed: '#6c757d',
  reopened: '#FF9500',
  
  // Text Colors
  text: '#333333',
  textSecondary: '#666666',
  textLight: '#999999',
  textDark: '#ffffff',
  textSecondaryDark: '#cccccc',
  textLightDark: '#aaaaaa',
  
  // Background Colors
  background: '#f5f5f5',
  backgroundDark: '#1a1a1a',
  surface: '#ffffff',
  surfaceDark: '#2c2c2c',
  
  // Border Colors
  border: '#e0e0e0',
  borderDark: '#333333',
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Common Colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  
  // Gradient Colors
  gradientStart: '#007AFF',
  gradientEnd: '#4DA6FF',
};

// Theme-aware color helper
export const getThemeColors = (isDarkMode: boolean) => ({
  text: isDarkMode ? Colors.textDark : Colors.text,
  textSecondary: isDarkMode ? Colors.textSecondaryDark : Colors.textSecondary,
  textLight: isDarkMode ? Colors.textLightDark : Colors.textLight,
  background: isDarkMode ? Colors.backgroundDark : Colors.background,
  surface: isDarkMode ? Colors.surfaceDark : Colors.surface,
  border: isDarkMode ? Colors.borderDark : Colors.border,
});
