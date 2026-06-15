import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Colors, Spacing } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  style?: ViewStyle;
  compact?: boolean;
}

export function SectionHeader({ title, style, compact }: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, compact && styles.compact, style]}>
      <View style={[styles.ornamentRow, compact && { marginBottom: 0 }]}>
        <View style={[styles.line, { backgroundColor: Colors.accent }]} />
        <Text style={[styles.ornament, { color: Colors.accent }]}>﴿</Text>
        <View style={[styles.line, { backgroundColor: Colors.accent }]} />
      </View>
      <Text style={[styles.title, compact && styles.titleCompact, { color: theme.text }]}>{title}</Text>
      <View style={[styles.underline, { backgroundColor: Colors.gold }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  compact: {
    marginBottom: Spacing.three,
  },
  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
    opacity: 0.35,
  },
  line: {
    width: 20,
    height: 1,
  },
  ornament: {
    fontSize: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  titleCompact: {
    fontSize: 18,
  },
  underline: {
    width: 24,
    height: 2,
    borderRadius: 1,
    marginTop: Spacing.one,
  },
});
