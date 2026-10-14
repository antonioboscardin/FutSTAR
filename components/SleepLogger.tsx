// FutStar — Sleep Logger Component
// Card para registrar horário de sono com scroll pickers

import { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, type ViewToken, Dimensions,
} from 'react-native';
import { useAppContext } from '../store/progress';
import { withOpacity } from '../constants/theme';
import {
  saveSleepRecord, calculateDuration, formatDuration,
  getSleepTipKey, type SleepRecord,
} from '../services/sleep';
import { t } from '../i18n';

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 3;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

interface ScrollPickerProps {
  data: number[];
  selectedValue: number;
  onValueChange: (val: number) => void;
  accentColor: string;
  textColor: string;
  dimColor: string;
  bgColor: string;
}

function ScrollPicker({ data, selectedValue, onValueChange, accentColor, textColor, dimColor, bgColor }: ScrollPickerProps) {
  const flatListRef = useRef<FlatList>(null);
  const initialIdx = data.indexOf(selectedValue);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const mid = viewableItems[Math.floor(viewableItems.length / 2)];
        if (mid?.item !== undefined && mid.item !== selectedValue) {
          onValueChange(mid.item);
        }
      }
    },
    [onValueChange, selectedValue]
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  return (
    <View style={[pickerStyles.container, { backgroundColor: bgColor }]}>
      {/* Selection highlight */}
      <View style={[pickerStyles.highlight, { borderColor: withOpacity(accentColor, 0.3), backgroundColor: withOpacity(accentColor, 0.06) }]} />
      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(item) => item.toString()}
        renderItem={({ item, index }) => {
          const isSelected = item === selectedValue;
          return (
            <View style={pickerStyles.item}>
              <Text style={[
                pickerStyles.itemText,
                {
                  color: isSelected ? accentColor : dimColor,
                  fontWeight: isSelected ? '900' : '500',
                  fontSize: isSelected ? 20 : 14,
                },
              ]}>
                {item.toString().padStart(2, '0')}
              </Text>
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        initialScrollIndex={Math.max(0, initialIdx)}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
        style={{ height: PICKER_HEIGHT }}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  container: {
    borderRadius: 10,
    overflow: 'hidden',
    width: 52,
  },
  highlight: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderWidth: 1,
    borderRadius: 8,
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    textAlign: 'center',
  },
});

// ---- Time Picker Row ----

interface TimePickerRowProps {
  label: string;
  hour: number;
  minute: number;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
  accentColor: string;
}

function TimePickerRow({ label, hour, minute, onHourChange, onMinuteChange, accentColor }: TimePickerRowProps) {
  const { theme } = useAppContext();
  const c = theme.colors;

  return (
    <View style={loggerStyles.timeRow}>
      <Text style={[loggerStyles.timeLabel, { color: c.textSecondary }]}>{label}</Text>
      <View style={loggerStyles.pickerRow}>
        <ScrollPicker
          data={HOURS}
          selectedValue={hour}
          onValueChange={onHourChange}
          accentColor={accentColor}
          textColor={c.textPrimary}
          dimColor={c.textDim}
          bgColor={withOpacity(c.bgElevated, 0.8)}
        />
        <Text style={[loggerStyles.colonText, { color: accentColor }]}>:</Text>
        <ScrollPicker
          data={MINUTES}
          selectedValue={minute}
          onValueChange={onMinuteChange}
          accentColor={accentColor}
          textColor={c.textPrimary}
          dimColor={c.textDim}
          bgColor={withOpacity(c.bgElevated, 0.8)}
        />
      </View>
    </View>
  );
}

// ---- Main Logger ----

interface SleepLoggerProps {
  todayRecord: SleepRecord | null;
  onRecordSaved: () => void;
}

export default function SleepLogger({ todayRecord, onRecordSaved }: SleepLoggerProps) {
  const { theme } = useAppContext();
  const c = theme.colors;

  const [bedHour, setBedHour] = useState(22);
  const [bedMinute, setBedMinute] = useState(0);
  const [wakeHour, setWakeHour] = useState(7);
  const [wakeMinute, setWakeMinute] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showPickers, setShowPickers] = useState(!todayRecord);

  const bedtime = `${bedHour.toString().padStart(2, '0')}:${bedMinute.toString().padStart(2, '0')}`;
  const wakeTime = `${wakeHour.toString().padStart(2, '0')}:${wakeMinute.toString().padStart(2, '0')}`;
  const previewDuration = calculateDuration(bedtime, wakeTime);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSleepRecord(bedtime, wakeTime);
      onRecordSaved();
      setShowPickers(false);
    } catch (e) {
      console.warn('Failed to save sleep record', e);
    }
    setSaving(false);
  };

  // If already logged today, show summary
  if (todayRecord && !showPickers) {
    const tipKey = getSleepTipKey(todayRecord.durationMinutes);
    return (
      <View style={[loggerStyles.container, { backgroundColor: c.bgCard, borderColor: withOpacity(c.accentBlue, 0.15) }]}>
        <View style={loggerStyles.loggedHeader}>
          <Text style={[loggerStyles.loggedTitle, { color: c.accentBlue }]}>
            {t('sono_last_night')}
          </Text>
          <TouchableOpacity onPress={() => setShowPickers(true)} activeOpacity={0.6}>
            <Text style={[loggerStyles.editBtn, { color: c.textDim }]}>✏️</Text>
          </TouchableOpacity>
        </View>
        <View style={loggerStyles.loggedStats}>
          <View style={loggerStyles.loggedStat}>
            <Text style={styles.loggedEmoji}>🌙</Text>
            <Text style={[loggerStyles.loggedValue, { color: c.textPrimary }]}>{todayRecord.bedtime}</Text>
          </View>
          <Text style={[loggerStyles.loggedArrow, { color: c.textDim }]}>→</Text>
          <View style={loggerStyles.loggedStat}>
            <Text style={styles.loggedEmoji}>☀️</Text>
            <Text style={[loggerStyles.loggedValue, { color: c.textPrimary }]}>{todayRecord.wakeTime}</Text>
          </View>
          <View style={[loggerStyles.durationBadge, { backgroundColor: withOpacity(c.accentBlue, 0.1) }]}>
            <Text style={[loggerStyles.durationText, { color: c.accentBlue }]}>
              {formatDuration(todayRecord.durationMinutes)}
            </Text>
          </View>
        </View>
        <Text style={[loggerStyles.tipText, { color: c.textSecondary }]}>
          {t(tipKey)}
        </Text>
      </View>
    );
  }

  // Show pickers
  return (
    <View style={[loggerStyles.container, { backgroundColor: c.bgCard, borderColor: withOpacity(c.accentBlue, 0.15) }]}>
      <Text style={[loggerStyles.title, { color: c.accentBlue }]}>
        {t('sono_log_title')}
      </Text>

      <View style={loggerStyles.pickersContainer}>
        <TimePickerRow
          label={t('sono_bedtime')}
          hour={bedHour}
          minute={bedMinute}
          onHourChange={setBedHour}
          onMinuteChange={setBedMinute}
          accentColor={c.accentPurple}
        />
        <TimePickerRow
          label={t('sono_waketime')}
          hour={wakeHour}
          minute={wakeMinute}
          onHourChange={setWakeHour}
          onMinuteChange={setWakeMinute}
          accentColor={c.accentYellow}
        />
      </View>

      {/* Preview */}
      <View style={[loggerStyles.previewRow, { borderColor: c.borderDefault }]}>
        <Text style={[loggerStyles.previewLabel, { color: c.textDim }]}>
          {t('sono_duration')}:
        </Text>
        <Text style={[loggerStyles.previewValue, { color: c.accentBlue }]}>
          {formatDuration(previewDuration)}
        </Text>
      </View>

      {/* Save button */}
      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.7}
        style={[loggerStyles.saveBtn, {
          backgroundColor: withOpacity(c.accentBlue, 0.12),
          borderColor: withOpacity(c.accentBlue, 0.25),
          opacity: saving ? 0.5 : 1,
        }]}
      >
        <Text style={[loggerStyles.saveBtnText, { color: c.accentBlue }]}>
          {saving ? '...' : t('sono_register')}
        </Text>
      </TouchableOpacity>

      {todayRecord && (
        <TouchableOpacity onPress={() => setShowPickers(false)} activeOpacity={0.6}>
          <Text style={[loggerStyles.cancelText, { color: c.textDim }]}>{t('cancel')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loggedEmoji: { fontSize: 14 },
});

const loggerStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  pickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  timeRow: {
    alignItems: 'center',
    gap: 6,
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  colonText: {
    fontSize: 20,
    fontWeight: '900',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    borderTopWidth: 1,
    marginBottom: 10,
  },
  previewLabel: {
    fontSize: 11,
  },
  previewValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  saveBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 6,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  cancelText: {
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 6,
  },
  // Logged summary styles
  loggedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  loggedTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  editBtn: {
    fontSize: 14,
  },
  loggedStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  loggedStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loggedValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  loggedArrow: {
    fontSize: 14,
  },
  durationBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '900',
  },
  tipText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
