import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeContext } from '@/hooks/theme-context';

export function useTheme() {
  const scheme = useColorScheme();
  const { userTheme } = useThemeContext();
  const systemTheme = scheme === 'unspecified' ? 'dark' : scheme;
  const resolved = userTheme === 'system' ? systemTheme : userTheme;
  return Colors[resolved];
}
