import React, { useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { useFocusEffect } from "@react-navigation/native";
import { useLifts } from "@/hooks/useLifts";
import { AppColors, Spacing } from "@/constants/theme";
import {
  getSisyphusState,
  getCurrentStreak,
  getStreakMessage,
  getQuoteForState,
} from "@/constants/quotes";
import type { Lift } from "@/types/exercise";

const CELL_SIZE = 20;
const CELL_GAP = 2;
const WEEKS = 16;
const ROWS = 7;

const SISYPHUS_IMAGES = {
  slow: require("@/assets/images/sisyphus-slow.png"),
  pushing: require("@/assets/images/sisyphus-pushing.png"),
  fast: require("@/assets/images/sisyphus-fast.png"),
};

function getWorkoutDates(lifts: Lift[]): Set<string> {
  const dates = new Set<string>();
  for (const lift of lifts) {
    for (const entry of lift.entries) {
      const d = new Date(entry.date);
      if (!isNaN(d.getTime())) {
        dates.add(d.toISOString().slice(0, 10));
      }
    }
  }
  return dates;
}

function getDateForCell(row: number, col: number): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfThisWeek = new Date(today);
  startOfThisWeek.setDate(today.getDate() - dayOfWeek);
  startOfThisWeek.setHours(0, 0, 0, 0);

  const weeksAgo = WEEKS - 1 - col;
  const startOfThatWeek = new Date(startOfThisWeek);
  startOfThatWeek.setDate(startOfThisWeek.getDate() - weeksAgo * 7);

  const date = new Date(startOfThatWeek);
  date.setDate(startOfThatWeek.getDate() + row);
  return date;
}

function ConsistencyGrid({
  workoutDates,
  streakDates,
}: {
  workoutDates: Set<string>;
  streakDates: Set<string>;
}) {
  const grid = useMemo(() => {
    const cells: {
      row: number;
      col: number;
      date: Date;
      workedOut: boolean;
    }[] = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < WEEKS; col++) {
        const date = getDateForCell(row, col);
        const dateStr = date.toISOString().slice(0, 10);
        const workedOut = workoutDates.has(dateStr);
        cells.push({ row, col, date, workedOut });
      }
    }
    return cells;
  }, [workoutDates]);

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <View style={styles.gridContainer}>
      <Text style={styles.gridTitle}>The path up the mountain</Text>
      <Text style={styles.gridSubtitle}>
        Each square is a day. Fill it by logging a workout.
      </Text>
      <View style={styles.grid}>
        {grid.map(({ row, col, date, workedOut }) => {
          const dateStr = date.toISOString().slice(0, 10);
          const isToday = dateStr === todayStr;
          const isFuture = date > new Date();
          const isStreak = streakDates.has(dateStr);
          return (
            <View
              key={`${row}-${col}`}
              style={[
                styles.cell,
                workedOut && styles.cellActive,
                isStreak && styles.cellStreak,
                isToday && styles.cellToday,
                isFuture && styles.cellFuture,
              ]}
            />
          );
        })}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.cell]} />
          <Text style={styles.legendText}>No workout</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.cellActive]} />
          <Text style={styles.legendText}>Workout</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.cellStreak]} />
          <Text style={styles.legendText}>Streak</Text>
        </View>
      </View>
    </View>
  );
}

export default function App() {
  const { lifts, refresh } = useLifts();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const workoutDates = useMemo(() => getWorkoutDates(lifts), [lifts]);
  const workoutDaysCount = workoutDates.size;
  const sisyphusState = useMemo(
    () => getSisyphusState(workoutDates),
    [workoutDates],
  );
  const streak = useMemo(() => getCurrentStreak(workoutDates), [workoutDates]);
  const streakDates = useMemo(() => {
    const dates = new Set<string>();
    const today = new Date();
    for (let i = 0; i < streak; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.add(d.toISOString().slice(0, 10));
    }
    return dates;
  }, [streak]);
  const streakMessage = useMemo(() => getStreakMessage(streak), [streak]);
  const quote = useMemo(
    () => getQuoteForState(sisyphusState, streak),
    [sisyphusState, streak],
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" />

      <Text style={styles.title}>SISUPHYS</Text>

      <Image
        source={SISYPHUS_IMAGES[sisyphusState]}
        style={styles.sisyphusImage}
        contentFit="contain"
      />

      <Text style={styles.subtitle}>{quote}</Text>

      {sisyphusState === "slow" && (
        <Text style={styles.stateHint}>
          Log a workout to get Sisyphus moving again
        </Text>
      )}
      {sisyphusState === "fast" && (
        <Text style={styles.stateHint}>On fire! Keep pushing!</Text>
      )}
      {streakMessage && (
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>{streakMessage}</Text>
        </View>
      )}

      <ConsistencyGrid workoutDates={workoutDates} streakDates={streakDates} />
      <Text style={styles.subtitle}>
        {workoutDaysCount} workout day{workoutDaysCount !== 1 ? "s" : ""} logged
        {streak > 0 && ` · ${streak} day streak`}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing.xxl + Spacing.lg,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.screenPadding,
  },
  title: {
    marginTop: Spacing.sectionGap,
    marginBottom: Spacing.sectionGap,
    color: AppColors.text,
    fontSize: 42,
    fontWeight: "bold",
    letterSpacing: 5,
  },
  subtitle: {
    color: AppColors.textMuted,
    fontSize: 16,
    fontStyle: "italic",
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  stateHint: {
    color: AppColors.primary,
    fontSize: 14,
    marginTop: Spacing.sm,
    fontWeight: "600",
  },
  streakBadge: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    marginTop: Spacing.md,
  },
  streakText: {
    color: AppColors.background,
    fontSize: 14,
    fontWeight: "700",
  },
  gridContainer: {
    marginTop: Spacing.sectionGap,
    marginBottom: Spacing.sectionGap,
    alignItems: "center",
  },
  gridTitle: {
    color: AppColors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  gridSubtitle: {
    color: AppColors.textMuted,
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  grid: {
    marginTop: Spacing.sectionGap,
    flexDirection: "row",
    flexWrap: "wrap",
    width: WEEKS * (CELL_SIZE + CELL_GAP) - CELL_GAP,
    gap: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
    backgroundColor: AppColors.borderMuted,
  },
  cellActive: {
    backgroundColor: AppColors.primary,
  },
  cellStreak: {
    backgroundColor: '#22c55e',
  },
  cellToday: {
    borderWidth: 1,
    borderColor: AppColors.primaryMuted,
  },
  cellFuture: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  legend: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  legendBox: {
    width: 12,
    height: 12,
  },
  legendText: {
    color: AppColors.textMuted,
    fontSize: 12,
  },
  sisyphusImage: {
    width: 200,
    height: 160,
    marginTop: Spacing.lg,
  },
});