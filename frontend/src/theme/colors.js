/**
 * Bug Tracker App - Unified Color Theme
 * Dark theme with orange accent color (#ff9500)
 */

export const Colors = {
  // Primary Brand Colors (nested and flat for compatibility)
  primary: {
    main: '#ff9500',      // Orange accent - main brand color
    dark: '#e6850e',      // Darker orange for pressed states
    light: '#ffab33',     // Lighter orange for highlights
    text: '#000000'       // Text color on primary background
  },

  // Background Colors (nested and flat for compatibility)
  background: {
    primary: '#000000',        // Pure black background
    secondary: '#1a1a1a',      // Slightly lighter black for cards/sections
    card: '#2a2a2a',          // Card/component backgrounds
    modal: '#1e1e1e'          // Modal backgrounds
  },

  // Text Colors (nested and flat for compatibility)
  text: {
    primary: '#ffffff',      // Primary white text
    secondary: '#cccccc',    // Secondary gray text
    tertiary: '#888888',     // Tertiary gray text (labels, hints)
    muted: '#666666'         // Muted text (disabled, placeholders)
  },

  // Border Colors (nested and flat for compatibility)
  border: {
    light: '#333333',        // Default borders
    medium: '#444444',       // Medium borders
    dark: '#555555'          // Darker borders
  },

  // Backward compatibility - flat properties
  primaryMain: '#ff9500',
  backgroundCard: '#1a1a1a',
  backgroundSecondary: '#111111',
  textPrimary: '#ffffff',
  textSecondary: '#cccccc',
  textMuted: '#666666',
  border: '#333333',
  error: '#E74C3C',

  // Status Colors
  status: {
    open: '#E74C3C',          // Red for open issues
    inProgress: '#ff9500',    // Orange for in-progress
    resolved: '#27AE60',      // Green for resolved
    closed: '#95A5A6',        // Gray for closed
    default: '#666666',       // Default gray
    success: '#27AE60',       // Green for success states
    warning: '#F39C12',       // Yellow-orange for warnings
    danger: '#E74C3C',        // Red for danger/errors
    info: '#3498DB'           // Blue for information
  },

  // Priority Colors
  priority: {
    critical: '#8E44AD',      // Purple for critical
    high: '#E74C3C',         // Red for high
    medium: '#ff9500',       // Orange for medium
    low: '#27AE60',          // Green for low
    default: '#666666'       // Default gray
  },

  // Accent Colors
  accent: {
    blue: '#3498DB',         // Blue accent
    green: '#27AE60',        // Green accent
    red: '#E74C3C',          // Red accent
    purple: '#8E44AD',       // Purple accent
    yellow: '#F39C12',       // Yellow accent
    teal: '#4ECDC4'          // Teal accent
  },

  // Icon Colors
  iconPrimary: '#ffffff',     // Primary white icons
  iconSecondary: '#cccccc',   // Secondary gray icons
  iconAccent: '#ff9500',      // Orange accent icons
  iconMuted: '#888888',       // Muted gray icons

  // Gradient Colors
  gradients: {
    primary: ['#ff9500', '#e6850e'],           // Orange gradient
    dark: ['#1a1a1a', '#2a2a2a'],             // Dark gradient
    header: ['#2E3A59', '#1a1a1a'],           // Header gradient
    card: ['#1a1a1a', '#222222'],             // Card gradient
  },

  // Special Colors
  overlay: 'rgba(0, 0, 0, 0.8)',     // Modal overlay
  shadow: 'rgba(0, 0, 0, 0.3)',      // Drop shadows
  highlight: 'rgba(255, 149, 0, 0.1)', // Orange highlight overlay
  
  // Tag/Chip Colors
  tag: {
    background: '#333333',
    text: '#ffffff',
    border: '#ff9500'
  }
};

// Helper functions for dynamic color usage
export const getStatusColor = (status) => {
  const statusLower = status?.toLowerCase().replace(/[-\s]/g, '');
  switch (statusLower) {
    case 'open': return Colors.status.open;
    case 'inprogress': return Colors.status.inProgress;
    case 'resolved': return Colors.status.resolved;
    case 'closed': return Colors.status.closed;
    default: return Colors.status.default;
  }
};

export const getPriorityColor = (priority) => {
  const priorityLower = priority?.toLowerCase();
  switch (priorityLower) {
    case 'critical': return Colors.priority.critical;
    case 'high': return Colors.priority.high;
    case 'medium': return Colors.priority.medium;
    case 'low': return Colors.priority.low;
    default: return Colors.priority.default;
  }
};

export const getUserRoleColor = (role) => {
  const roleLower = role?.toLowerCase();
  return Colors.userRole[roleLower] || Colors.userRole.default;
};

// Common style objects
export const CommonStyles = {
  // Shadow styles
  cardShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  // Border styles
  defaultBorder: {
    borderWidth: 1,
    borderColor: '#333333',
  },
  
  accentBorder: {
    borderWidth: 1,
    borderColor: '#ff9500',
  },
  
  // Button styles
  primaryButton: {
    backgroundColor: '#ff9500',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff9500',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  
  // Text styles
  primaryText: {
    color: '#ffffff',
    fontSize: 16,
  },
  
  secondaryText: {
    color: '#cccccc',
    fontSize: 14,
  },
  
  // Container styles
  screenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  
  cardContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
};

export default Colors;