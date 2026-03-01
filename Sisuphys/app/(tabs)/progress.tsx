import React, { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Alert,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";
import { useLifts } from "@/hooks/useLifts";
import { AppColors, Spacing } from "@/constants/theme";
import type { Lift } from "@/types/exercise";

type MetricType = "maxWeight" | "volume" | "estimated1RM";
type TimeRange = "7" | "30" | "all";

function estimated1RM(weight: number, reps: number): number {
  if (reps <= 0) return weight;
  return Math.round(weight * (1 + reps / 30));
}

function getChartDataFromLift(
  lift: Lift,
  metric: MetricType,
  timeRange: TimeRange,
): {
  labels: string[];
  data: number[];
  rawDates: string[];
} {
  if (!lift.entries.length) return { labels: [], data: [], rawDates: [] };

  const now = Date.now();
  const rangeMs =
    timeRange === "7"
      ? 7 * 24 * 60 * 60 * 1000
      : timeRange === "30"
        ? 30 * 24 * 60 * 60 * 1000
        : Infinity;

  const byDate = new Map<
    string,
    { maxWeight: number; volume: number; max1RM: number }
  >();

  for (const entry of lift.entries) {
    const dateMs = new Date(entry.date).getTime();
    if (now - dateMs > rangeMs) continue;

    const volume = entry.weight * entry.reps * entry.sets;
    const oneRM = estimated1RM(entry.weight, entry.reps);

    const current = byDate.get(entry.date) ?? {
      maxWeight: 0,
      volume: 0,
      max1RM: 0,
    };

    byDate.set(entry.date, {
      maxWeight: Math.max(current.maxWeight, entry.weight),
      volume: current.volume + volume,
      max1RM: Math.max(current.max1RM, oneRM),
    });
  }

  const sorted = [...byDate.entries()].sort(
    (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime(),
  );

  const labels = sorted.map(([date]) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  });
  const rawDates = sorted.map(([date]) => date);
  const data = sorted.map(([, vals]) => {
    if (metric === "maxWeight") return vals.maxWeight;
    if (metric === "volume") return vals.volume;
    return vals.max1RM;
  });

  return { labels, data, rawDates };
}

function computeStats(
  chartData: { labels: string[]; data: number[] } | null,
  metric: MetricType,
) {
  if (!chartData || chartData.data.length === 0) {
    return { pr: 0, sessions: 0, changePercent: 0, isLatestPR: false };
  }
  const pr = Math.max(...chartData.data);
  const sessions = chartData.data.length;
  const first = chartData.data[0];
  const last = chartData.data[chartData.data.length - 1];
  const changePercent =
    first > 0 ? Math.round(((last - first) / first) * 100) : 0;
  const isLatestPR = last === pr && sessions >= 1;
  return { pr, sessions, changePercent, isLatestPR };
}

const CHART_COLORS = {
  gradientFrom: AppColors.chartGradientFrom,
  gradientTo: AppColors.chartGradientTo,
};

export default function WorkoutTrend() {
  const { lifts, refresh } = useLifts();
  const [selectedLiftId, setSelectedLiftId] = useState<number | null>(null);
  const [metric, setMetric] = useState<MetricType>("maxWeight");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const selectedLift = useMemo(
    () => lifts.find((l) => l.id === selectedLiftId) ?? lifts[0] ?? null,
    [lifts, selectedLiftId],
  );

  const chartData = useMemo(
    () =>
      selectedLift
        ? getChartDataFromLift(selectedLift, metric, timeRange)
        : null,
    [selectedLift, metric, timeRange],
  );

  const stats = useMemo(
    () => computeStats(chartData, metric),
    [chartData, metric],
  );

  const hasChartData =
    chartData && chartData.labels.length > 0 && chartData.data.length > 0;

  const metricSuffix =
    metric === "maxWeight" || metric === "estimated1RM" ? " kg" : "";

  const handleDataPointClick = useCallback(
    ({ value, index }: { value: number; index: number }) => {
      const label = chartData?.labels[index] ?? "";
      const suffix = metric === "volume" ? "" : " kg";
      Alert.alert(`Session ${index + 1}`, `${label}: ${value}${suffix}`);
    },
    [chartData, metric],
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {lifts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Log exercises in Tracking to see your progress
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.pickerLabel}>Select exercise</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pickerScroll}
            contentContainerStyle={styles.pickerContent}
          >
            {lifts.map((lift) => {
              const isSelected = selectedLift?.id === lift.id;
              const hasEntries = lift.entries.length > 0;
              return (
                <TouchableOpacity
                  key={lift.id}
                  style={[
                    styles.pickerItem,
                    isSelected && styles.pickerItemSelected,
                    !hasEntries && styles.pickerItemDisabled,
                  ]}
                  onPress={() => setSelectedLiftId(lift.id)}
                  disabled={!hasEntries}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      isSelected && styles.pickerItemTextSelected,
                      !hasEntries && styles.pickerItemTextDisabled,
                    ]}
                    numberOfLines={1}
                  >
                    {lift.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {!hasChartData ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {selectedLift
                  ? "Add entries to this exercise in Tracking to see your progress"
                  : "Select an exercise above"}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>PR</Text>
                  <View style={styles.prValueRow}>
                    <Text style={styles.statValue}>
                      {stats.pr}
                      {metricSuffix}
                    </Text>
                    {stats.isLatestPR && (
                      <View style={styles.prBadge}>
                        <Text style={styles.prBadgeText}>PR!</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Sessions</Text>
                  <Text style={styles.statValue}>{stats.sessions}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Change</Text>
                  <Text
                    style={[
                      styles.statValue,
                      stats.changePercent >= 0
                        ? styles.statChangePositive
                        : styles.statChangeNegative,
                    ]}
                  >
                    {stats.changePercent >= 0 ? "+" : ""}
                    {stats.changePercent}%
                  </Text>
                </View>
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Metric</Text>
                <View style={styles.toggleGroup}>
                  {(
                    [
                      ["maxWeight", "Weight"],
                      ["volume", "Volume"],
                      ["estimated1RM", "1RM"],
                    ] as const
                  ).map(([value, label]) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.toggleItem,
                        metric === value && styles.toggleItemActive,
                      ]}
                      onPress={() => setMetric(value)}
                    >
                      <Text
                        style={[
                          styles.toggleItemText,
                          metric === value && styles.toggleItemTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Range</Text>
                <View style={styles.toggleGroup}>
                  {(
                    [
                      ["7", "7 days"],
                      ["30", "30 days"],
                      ["all", "All time"],
                    ] as const
                  ).map(([value, label]) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.toggleItem,
                        timeRange === value && styles.toggleItemActive,
                      ]}
                      onPress={() => setTimeRange(value)}
                    >
                      <Text
                        style={[
                          styles.toggleItemText,
                          timeRange === value && styles.toggleItemTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={[
                  styles.chartScrollContent,
                  {
                    backgroundColor: CHART_COLORS.gradientFrom,
                    minWidth: Math.max(
                      Dimensions.get("window").width - 32,
                      (chartData?.labels.length ?? 0) * 48,
                    ),
                  },
                ]}
                style={styles.chartScroll}
              >
                <LineChart
                  data={{
                    labels: chartData!.labels,
                    datasets: [{ data: chartData!.data }],
                  }}
                  width={Math.max(
                    Dimensions.get("window").width - 32,
                    chartData!.labels.length * 48,
                  )}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix={metricSuffix}
                  fromZero
                  withDots
                  withInnerLines
                  onDataPointClick={handleDataPointClick}
                  chartConfig={{
                    backgroundColor: CHART_COLORS.gradientFrom,
                    backgroundGradientFrom: CHART_COLORS.gradientFrom,
                    backgroundGradientTo: CHART_COLORS.gradientTo,
                    decimalPlaces: 0,
                    color: (opacity = 1) =>
                      `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) =>
                      `rgba(255, 255, 255, ${opacity})`,
                    style: { borderRadius: 16 },
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
              </ScrollView>
              <Text style={styles.tapHint}>Tap a data point to see details</Text>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.xxl + Spacing.lg,
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.xl,
  },
  pickerLabel: {
    color: AppColors.textMuted,
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  pickerScroll: {
    marginBottom: Spacing.md,
  },
  pickerContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  pickerItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: AppColors.borderMuted,
  },
  pickerItemSelected: {
    backgroundColor: AppColors.primary,
  },
  pickerItemDisabled: {
    opacity: 0.5,
  },
  pickerItemText: {
    color: AppColors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  pickerItemTextSelected: {
    color: AppColors.background,
    fontWeight: "600",
  },
  pickerItemTextDisabled: {
    color: AppColors.textDim,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: AppColors.backgroundSecondary,
    padding: Spacing.sm,
    borderRadius: 8,
    alignItems: "center",
  },
  statLabel: {
    color: AppColors.textMuted,
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  statValue: {
    color: AppColors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  prValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  prBadge: {
    backgroundColor: AppColors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  prBadgeText: {
    color: AppColors.background,
    fontSize: 12,
    fontWeight: "800",
  },
  statChangePositive: {
    color: AppColors.success,
  },
  statChangeNegative: {
    color: AppColors.error,
  },
  toggleRow: {
    marginBottom: Spacing.sm,
  },
  toggleLabel: {
    color: AppColors.textMuted,
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  toggleGroup: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  toggleItem: {
    paddingHorizontal: 14,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: AppColors.borderMuted,
  },
  toggleItemActive: {
    backgroundColor: AppColors.primary,
  },
  toggleItemText: {
    color: AppColors.text,
    fontSize: 14,
  },
  toggleItemTextActive: {
    color: AppColors.background,
    fontWeight: "600",
  },
  chartScroll: {
    marginHorizontal: -Spacing.screenPadding,
  },
  chartScrollContent: {
    paddingHorizontal: Spacing.screenPadding,
  },
  tapHint: {
    color: AppColors.textDim,
    fontSize: 12,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    color: AppColors.textMuted,
    fontSize: 16,
    textAlign: "center",
  },
});
