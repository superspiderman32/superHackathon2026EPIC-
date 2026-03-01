export type Entry = {
  date: string;
  weight: number;
  reps: number;
  sets: number;
};

export type Lift = {
  id: number;
  name: string;
  entries: Entry[];
};
