import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
} from 'react-native-reanimated';

import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/hooks/locale-context';

const DAYS_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const DAYS_SHORT_AR = ['ا', 'ث', 'ر', 'خ', 'ج', 'س', 'ح'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_AR = [
  'يَانَايِر', 'فِبْرَايِر', 'مَارِس', 'أَبْرِيل', 'مَايُو', 'يُونْيُو',
  'يُولْيُو', 'أُغُسْطُس', 'سِبْتِمْبِر', 'أُكْتُوبِر', 'نُوفِمْبِر', 'دِيسِمْبِر',
];
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE = 20;

interface DateTimePickerProps {
  visible: boolean;
  date: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
}

function DayCell({
  d,
  isSelected,
  isToday,
  theme,
  onPress,
}: {
  d: number;
  isSelected: boolean;
  isToday: boolean;
  theme: ReturnType<typeof useTheme>;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.85, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 10 }); }}
        style={[
          styles.dayCell,
          isSelected && {
            backgroundColor: Colors.gold,
            borderRadius: 10,
          },
        ]}
      >
        <Text style={[
          styles.dayText,
          { color: isSelected ? '#1A1A2E' : theme.text },
          isToday && !isSelected && { fontWeight: '800', color: Colors.gold },
        ]}>
          {d}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function DateTimePicker({ visible, date, onChange, onClose }: DateTimePickerProps) {
  const theme = useTheme();
  const { t, isRTL } = useLocale();
  const isDark = theme.background === '#0A1628';
  const [year, setYear] = useState(date.getFullYear());
  const [month, setMonth] = useState(date.getMonth());
  const [day, setDay] = useState(date.getDate());
  const [hours, setHours] = useState(date.getHours());
  const [minutes, setMinutes] = useState(date.getMinutes());
  const [showYearPicker, setShowYearPicker] = useState(false);

  const selectedDate = useMemo(() => new Date(year, month, day, hours, minutes), [year, month, day, hours, minutes]);

  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);

  const startDayOfWeek = useMemo(() => {
    const first = new Date(year, month, 1).getDay();
    return first === 0 ? 6 : first - 1;
  }, [year, month]);

  const days: (number | null)[] = useMemo(() => {
    const result: (number | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) result.push(null);
    for (let d = 1; d <= daysInMonth; d++) result.push(d);
    return result;
  }, [startDayOfWeek, daysInMonth]);

  const years = useMemo(() => {
    const y: number[] = [];
    for (let i = CURRENT_YEAR - YEAR_RANGE; i <= CURRENT_YEAR + 5; i++) y.push(i);
    return y;
  }, []);

  const prevMonth = useCallback(() => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }, [month]);

  const nextMonth = useCallback(() => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }, [month]);

  const adjustHours = useCallback((delta: number) => {
    setHours(h => (h + delta + 24) % 24);
  }, []);

  const adjustMinutes = useCallback((delta: number) => {
    setMinutes(m => (m + delta + 60) % 60);
  }, []);

  const handleNow = useCallback(() => {
    const n = new Date();
    setYear(n.getFullYear());
    setMonth(n.getMonth());
    setDay(n.getDate());
    setHours(n.getHours());
    setMinutes(n.getMinutes());
  }, []);

  const handleSet = useCallback(() => {
    onChange(selectedDate);
    onClose();
  }, [selectedDate, onChange, onClose]);

  const daysShort = isRTL ? DAYS_SHORT_AR : DAYS_SHORT;
  const monthLabel = (isRTL ? MONTHS_AR : MONTHS)[month];
  const isSelectedMonth = month === date.getMonth() && year === date.getFullYear();
  const todayRef = useRef(new Date());

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          entering={SlideInUp.springify().damping(20).stiffness(120)}
          exiting={SlideOutDown.springify().damping(20)}
          style={[styles.sheet, {
            backgroundColor: isDark ? '#0F1D30' : '#FFFFFF',
            borderColor: theme.border,
          }]}
        >
          <View
            onStartShouldSetResponder={() => true}
            style={styles.sheetContent}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Header */}
              <View style={[styles.sheetHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.sheetTitle, { color: theme.text }]}>
                  {t('selectDateTime')}
                </Text>
                <Pressable onPress={onClose} style={styles.sheetClose}>
                  <SymbolView name="xmark.circle.fill" size={22} weight="medium" tintColor={theme.textSecondary} />
                </Pressable>
              </View>

              {/* Month-Year navigation */}
              <View style={[styles.monthNav, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Pressable onPress={prevMonth} style={styles.monthArrow}>
                  <SymbolView name="chevron.left" size={16} weight="medium" tintColor={theme.text} />
                </Pressable>
                <Pressable onPress={() => setShowYearPicker(p => !p)} style={[styles.monthLabelArea, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={[styles.monthLabel, { color: theme.text }]}>
                    {monthLabel}
                  </Text>
                  <View style={[styles.yearPill, {
                    backgroundColor: showYearPicker ? Colors.gold + '20' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  }]}>
                    <Text style={[styles.yearPillText, { color: showYearPicker ? Colors.gold : theme.textSecondary }]}>
                      {year}
                    </Text>
                    <SymbolView
                      name={showYearPicker ? 'chevron.up' : 'chevron.down'}
                      size={9}
                      weight="medium"
                      tintColor={showYearPicker ? Colors.gold : theme.textSecondary}
                    />
                  </View>
                </Pressable>
                <Pressable onPress={nextMonth} style={styles.monthArrow}>
                  <SymbolView name="chevron.right" size={16} weight="medium" tintColor={theme.text} />
                </Pressable>
              </View>

              {/* Year picker grid */}
              {showYearPicker && (
                <Animated.View
                  entering={FadeIn.springify().damping(20)}
                  exiting={FadeOut.springify().damping(20)}
                  style={styles.yearGridWrap}
                >
                  <View style={styles.yearGrid}>
                    {years.map(y => (
                      <Pressable
                        key={y}
                        onPress={() => { setYear(y); setShowYearPicker(false); }}
                        style={[
                          styles.yearCell,
                          y === year && {
                            backgroundColor: Colors.gold,
                            borderRadius: 8,
                          },
                        ]}
                      >
                        <Text style={[
                          styles.yearCellText,
                          { color: y === year ? '#1A1A2E' : theme.text },
                        ]}>
                          {y}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </Animated.View>
              )}

              {/* Calendar grid */}
              {!showYearPicker && (
                <Animated.View
                  entering={FadeIn.springify().damping(20)}
                  exiting={FadeOut.springify().damping(20)}
                >
                  <View style={[styles.weekdayRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    {daysShort.map(d => (
                      <View key={d} style={styles.weekdayCell}>
                        <Text style={[styles.weekdayText, { color: theme.textSecondary }]}>{d}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={[styles.calGrid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    {days.map((d, i) => {
                      if (d === null) return <View key={`e-${i}`} style={styles.dayCell} />;
                      const isSel = d === day && isSelectedMonth;
                      const isTod = d === todayRef.current.getDate() && month === todayRef.current.getMonth() && year === todayRef.current.getFullYear();
                      return (
                        <DayCell
                          key={`d-${d}`}
                          d={d}
                          isSelected={isSel}
                          isToday={isTod}
                          theme={theme}
                          onPress={() => setDay(d)}
                        />
                      );
                    })}
                  </View>
                </Animated.View>
              )}

              {/* Time picker */}
              <View style={[styles.timeRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <SymbolView name="clock.fill" size={13} weight="medium" tintColor={theme.textSecondary} />
                <View style={[styles.timeControls, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={styles.timeUnit}>
                    <Pressable onPress={() => adjustHours(1)} style={[styles.timeArrow, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }]}>
                      <SymbolView name="chevron.up" size={11} weight="medium" tintColor={theme.text} />
                    </Pressable>
                    <Text style={[styles.timeValue, { color: theme.text }]}>
                      {hours.toString().padStart(2, '0')}
                    </Text>
                    <Pressable onPress={() => adjustHours(-1)} style={[styles.timeArrow, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }]}>
                      <SymbolView name="chevron.down" size={11} weight="medium" tintColor={theme.text} />
                    </Pressable>
                  </View>
                  <Text style={[styles.timeSep, { color: theme.textSecondary }]}>:</Text>
                  <View style={styles.timeUnit}>
                    <Pressable onPress={() => adjustMinutes(5)} style={[styles.timeArrow, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }]}>
                      <SymbolView name="chevron.up" size={11} weight="medium" tintColor={theme.text} />
                    </Pressable>
                    <Text style={[styles.timeValue, { color: theme.text }]}>
                      {minutes.toString().padStart(2, '0')}
                    </Text>
                    <Pressable onPress={() => adjustMinutes(-5)} style={[styles.timeArrow, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }]}>
                      <SymbolView name="chevron.down" size={11} weight="medium" tintColor={theme.text} />
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Action buttons */}
              <View style={[styles.actions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Pressable
                  onPress={handleNow}
                  style={[styles.actionBtn, { borderColor: theme.border }]}
                >
                  <SymbolView name="clock.arrow.circlepath" size={14} weight="medium" tintColor={theme.textSecondary} />
                  <Text style={[styles.actionBtnText, { color: theme.textSecondary }]}>
                    {t('now')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSet}
                  style={[styles.actionBtnPrimary, { backgroundColor: Colors.gold }]}
                >
                  <Text style={styles.actionBtnPrimaryText}>
                    {t('set')}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '80%',
  },
  sheetContent: {
    maxHeight: '80%',
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  sheetHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sheetClose: {
    padding: 4,
  },
  monthNav: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.two,
  },
  monthArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabelArea: {
    alignItems: 'center',
    gap: 8,
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  yearPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  yearPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  yearGridWrap: {
    paddingVertical: Spacing.two,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  yearCell: {
    width: '23%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  yearCellText: {
    fontSize: 14,
    fontWeight: '600',
  },
  weekdayRow: {},
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.5,
  },
  calGrid: {
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
  },
  timeRow: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingTop: Spacing.three,
  },
  timeControls: {
    alignItems: 'center',
    gap: 4,
  },
  timeUnit: {
    alignItems: 'center',
    gap: 2,
  },
  timeArrow: {
    width: 32,
    height: 22,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeValue: {
    fontSize: 26,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    width: 50,
    textAlign: 'center',
  },
  timeSep: {
    fontSize: 26,
    fontWeight: '800',
    marginHorizontal: 2,
  },
  actions: {
    gap: Spacing.two,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.two + 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnPrimary: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two + 4,
    borderRadius: 14,
  },
  actionBtnPrimaryText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1A2E',
  },
});
