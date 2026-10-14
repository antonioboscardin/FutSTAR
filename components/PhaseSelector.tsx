// FutStar — PhaseSelector
// Grid de 4 botões para selecionar a fase do treino
// Cada botão mostra: label, subtitle, barra de progresso mini

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppContext } from '../store/progress';
import { PHASES } from '../data/phases';
import { withOpacity } from '../constants/theme';
import { t } from '../i18n';

interface PhaseSelectorProps {
  selectedPhase: number;
  onSelectPhase: (index: number) => void;
}

export default function PhaseSelector({
  selectedPhase,
  onSelectPhase,
}: PhaseSelectorProps) {
  const { theme, getPhaseProgress } = useAppContext();
  const c = theme.colors;

  return (
    <View>
      <Text style={[styles.sectionLabel, { color: c.textMuted }]}>
        {t('treinos_phase_label')}
      </Text>
      <View style={styles.grid}>
        {PHASES.map((phase, i) => {
          const { done, total } = getPhaseProgress(i);
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const selected = i === selectedPhase;

          return (
            <TouchableOpacity
              key={phase.id}
              onPress={() => onSelectPhase(i)}
              activeOpacity={0.7}
              style={[
                styles.phaseButton,
                {
                  backgroundColor: selected
                    ? withOpacity(phase.color, 0.08)
                    : c.bgCard,
                  borderColor: selected
                    ? withOpacity(phase.color, 0.33)
                    : c.borderDefault,
                },
              ]}
            >
              <Text
                style={[
                  styles.phaseLabel,
                  {
                    color: selected ? phase.color : c.textDim,
                    fontWeight: selected ? '900' : '600',
                  },
                ]}
              >
                {phase.label}
              </Text>
              <Text
                style={[
                  styles.phaseSub,
                  { color: selected ? phase.color : c.textDim },
                ]}
              >
                {phase.subtitle}
              </Text>
              {/* Mini progress bar */}
              <View style={[styles.miniTrack, { backgroundColor: c.borderDefault }]}>
                <View
                  style={[
                    styles.miniFill,
                    {
                      width: `${pct}%`,
                      backgroundColor: phase.color,
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 7,
  },
  grid: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 8,
  },
  phaseButton: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    gap: 3,
  },
  phaseLabel: {
    fontSize: 11,
  },
  phaseSub: {
    fontSize: 8,
  },
  miniTrack: {
    width: '85%',
    height: 4,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 2,
  },
  miniFill: {
    height: '100%',
    borderRadius: 4,
  },
});
