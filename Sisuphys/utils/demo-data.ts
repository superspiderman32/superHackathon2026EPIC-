import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Lift } from "@/types/exercise";
import { toDateKey } from "@/utils/date-utils";

const LIFTS_KEY = "lifts";

/**
 * Generates demo data that showcases ALL app features:
 * - Sisyphus FAST state (3+ workouts in last 7 days)
 * - 30-day streak + streak milestone badge
 * - Filled consistency grid (path up the mountain)
 * - 3 exercises with varied progress
 * - PR badge (latest session = personal record)
 */
export function generateDemoData(): Lift[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lifts: Lift[] = [
    {
      id: 1001,
      name: "Bench Press",
      entries: [],
    },
    {
      id: 1002,
      name: "Squat",
      entries: [],
    },
    {
      id: 1003,
      name: "Deadlift",
      entries: [],
    },
  ];

  // Generate 35 days of workout history (for 30+ day streak + grid fill)
  for (let daysAgo = 0; daysAgo < 35; daysAgo++) {
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    const dateStr = toDateKey(d);

    // Bench Press: progressive overload, latest session is PR (100kg)
    const benchWeight = 65 + Math.floor((35 - daysAgo) * 1); // 65->100 over time
    lifts[0].entries.push({
      date: dateStr,
      weight: Math.min(Math.max(benchWeight, 65), 100),
      reps: 8,
      sets: 3,
    });

    // Squat: steady progress
    const squatWeight = 80 + Math.min(daysAgo * 0.8, 25);
    lifts[1].entries.push({
      date: dateStr,
      weight: Math.round(squatWeight),
      reps: 6,
      sets: 4,
    });

    // Deadlift: big jumps, volume focus
    const deadWeight = 100 + Math.min(daysAgo * 1.2, 35);
    lifts[2].entries.push({
      date: dateStr,
      weight: Math.round(deadWeight),
      reps: 5,
      sets: 3,
    });
  }

  // Reverse so oldest first (chronological order for chart)
  for (const lift of lifts) {
    lift.entries.reverse();
  }

  return lifts;
}

/**
 * Demo for Sisyphus SLOW state (0 workouts in 7 days)
 */
export function generateSlowStateDemo(): Lift[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return [
    {
      id: 2001,
      name: "Bench Press",
      entries: [8, 9, 10, 11, 12, 13, 14].map((daysAgo) => {
        const d = new Date(today);
        d.setDate(today.getDate() - daysAgo);
        return {
          date: toDateKey(d),
          weight: 80,
          reps: 8,
          sets: 3,
        };
      }),
    },
  ];
}

/**
 * Demo for Sisyphus PUSHING state (1-2 workouts in 7 days)
 */
export function generatePushingStateDemo(): Lift[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const entries = [];
  entries.push({
    date: toDateKey(today),
    weight: 85,
    reps: 8,
    sets: 3,
  });
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  entries.push({
    date: toDateKey(twoDaysAgo),
    weight: 82,
    reps: 8,
    sets: 3,
  });
  entries.reverse();

  return [
    {
      id: 3001,
      name: "Bench Press",
      entries,
    },
  ];
}

/**
 * Demo for 7-day streak (not 30)
 */
export function generateSevenDayStreakDemo(): Lift[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const entries = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    entries.push({
      date: toDateKey(d),
      weight: 70 + i,
      reps: 8,
      sets: 3,
    });
  }
  entries.reverse();

  return [
    {
      id: 4001,
      name: "Bench Press",
      entries,
    },
  ];
}

export async function loadDemoData(variant: "full" | "slow" | "pushing" | "streak7" = "full"): Promise<void> {
  let data: Lift[];
  switch (variant) {
    case "slow":
      data = generateSlowStateDemo();
      break;
    case "pushing":
      data = generatePushingStateDemo();
      break;
    case "streak7":
      data = generateSevenDayStreakDemo();
      break;
    default:
      data = generateDemoData();
  }
  await AsyncStorage.setItem(LIFTS_KEY, JSON.stringify(data));
}
