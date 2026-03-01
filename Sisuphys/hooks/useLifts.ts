import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import type { Lift } from '@/types/exercise';

const LIFTS_KEY = 'lifts';

export function useLifts() {
  const [lifts, setLifts] = useState<Lift[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem(LIFTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const fixed = parsed.map((lift: Lift) => ({
          ...lift,
          entries: lift.entries ?? [],
        }));
        setLifts(fixed);
      } else {
        setLifts([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { lifts, loading, refresh };
}
