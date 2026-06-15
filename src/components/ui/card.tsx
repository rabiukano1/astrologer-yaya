import { ReactNode } from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { useTheme } from '@/hooks/use-theme';
import { Colors, Shadows, Spacing } from '@/constants/theme';

interface CardProps extends ViewProps {
  children: ReactNode;
  variant?: 'glass' | 'solid' | 'elevated';
  style?: ViewStyle | ViewStyle[];
}

export function Card({ children, variant = 'glass', style, ...props }: CardProps) {
  const theme = useTheme();
  const isDark = theme.background === '#0A1628';

  if (variant === 'glass') {
    return (
      <GlassView
        glassEffectStyle="regular"
        style={[
          styles.card,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.35)',
            borderColor: theme.border,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </GlassView>
    );
  }

  if (variant === 'elevated') {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? theme.surfaceElevated : theme.surface,
            borderColor: theme.border,
          },
          Shadows.medium,
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
        },
        Shadows.soft,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: Spacing.four,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
