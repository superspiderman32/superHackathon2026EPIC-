export const QUOTES = [
  '"One must imagine Sisyphus happy."',
  '"The struggle itself toward the heights is enough to fill a man\'s heart."',
  '"There is no sun without shadow."',
  '"In the depth of winter, I finally learned that within me there lay an invincible summer."',
  '"Push the boulder. Again."',
  '"Each day, the mountain. Each day, the climb."',
];

export type SisyphusState = "slow" | "pushing" | "fast";

export function getSisyphusState(workoutDates: Set<string>): SisyphusState {
  const workoutsLast7 = getWorkoutsInLastNDays(workoutDates, 7);
  if (workoutsLast7 === 0) return "slow";
  if (workoutsLast7 >= 3) return "fast";
  return "pushing";
}

export function getWorkoutsInLastNDays(
  workoutDates: Set<string>,
  days: number,
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let count = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (workoutDates.has(d.toISOString().slice(0, 10))) count++;
  }
  return count;
}

export function getCurrentStreak(workoutDates: Set<string>): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    if (workoutDates.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getStreakMessage(streak: number): string | null {
  if (streak >= 30) return "The peak is in sight. 30 days!";
  if (streak >= 7) return "One week up the mountain.";
  if (streak >= 3) return "Sisyphus finds his rhythm.";
  return null;
}

export function getQuoteForState(
  state: SisyphusState,
  streak: number,
): string {
  if (state === "slow") {
    return '"The struggle itself toward the heights is enough to fill a man\'s heart."';
  }
  if (state === "fast" && streak >= 7) {
    return '"One must imagine Sisyphus happy."';
  }
  if (streak >= 3) {
    return '"Each day, the mountain. Each day, the climb."';
  }
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
