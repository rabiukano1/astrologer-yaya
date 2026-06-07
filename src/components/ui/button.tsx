import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Colors, Shadows, Spacing } from '@/constants/theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  subtitle?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'gold' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  onPress,
  title,
  subtitle,
  variant = 'primary',
  style,
  textStyle,
  disabled,
  size = 'md',
}: ButtonProps) {
  const theme = useTheme();

  const sizeStyles = {
    sm: { container: { paddingVertical: Spacing.two, paddingHorizontal: Spacing.three }, text: { fontSize: 13 }, subtitle: { fontSize: 8 } },
    md: { container: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.four }, text: { fontSize: 15 }, subtitle: { fontSize: 9 } },
    lg: { container: { paddingVertical: Spacing.four, paddingHorizontal: Spacing.five }, text: { fontSize: 17 }, subtitle: { fontSize: 10 } },
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'gold':
        return {
          container: { backgroundColor: Colors.gold },
          text: { color: Colors.darkGreen },
          subtitle: { color: Colors.darkGreen, opacity: 0.6 },
        };
      case 'secondary':
        return {
          container: { backgroundColor: Colors.secondary },
          text: { color: Colors.white },
          subtitle: { color: Colors.white, opacity: 0.7 },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: theme.textSecondary,
          },
          text: { color: theme.text },
          subtitle: { color: theme.textSecondary, opacity: 0.7 },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: { color: Colors.accent },
          subtitle: { color: theme.textSecondary, opacity: 0.6 },
        };
      default:
        return {
          container: { backgroundColor: Colors.primary },
          text: { color: Colors.white },
          subtitle: { color: Colors.white, opacity: 0.7 },
        };
    }
  };

  const vStyles = getVariantStyles();
  const sz = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        sz.container,
        vStyles.container,
        variant !== 'ghost' && variant !== 'outline' && Shadows.soft,
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Text style={[styles.text, sz.text, vStyles.text, textStyle]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, sz.subtitle, vStyles.subtitle]}>{subtitle}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 2,
    letterSpacing: 1,
    textAlign: 'center',
    fontWeight: '500',
  },
});
