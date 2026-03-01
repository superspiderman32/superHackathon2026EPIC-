# Sisyphus

"One must imagine Sisyphys happy"

A fitness tracking app inspired by the myth of Sisyphus. Log your lifts, watch your progress, and keep pushing the boulder up the mountain.

> To change the world, one must start with himself. Sisyphus was condemned to push a boulder up a mountain, again and again, forever. Yet in that endless repetition lies a choice: to give in, or to find meaning in the climb. **Sisyphus** is for those who choose the climb. Every rep, every set, every day you show up is a step up the mountain. There is no finish line, only the path. Start with yourself. Build the discipline. Push the boulder for a better tommorow.

## Features

- **Home** – Sisyphus imagery that reflects your consistency (slow, pushing, or fast based on workouts in the last 7 days), a consistency grid (“The path up the mountain”), motivational quotes, and streak milestones
- **Tracking** – Log exercises with date, weight, reps, and sets. Data is stored locally with AsyncStorage
- **Progress** – Line charts for weight, volume, or estimated 1RM; filter by 7 days, 30 days, or all time; PR badge when your latest session is a personal record

## Tech Stack

- [Expo](https://expo.dev) (SDK 54)
- [React Native](https://reactnative.dev)
- [expo-router](https://docs.expo.dev/router/introduction/) for file-based routing
- [react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit) for progress charts

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- [Expo Go](https://expo.dev/go) on your device (for development)

### Install & Run

```bash
cd Sisuphys
npm install
npm start
```

Then scan the QR code with Expo Go (Android) or the Camera app (iOS).

### Scripts

| Command           | Description               |
| ----------------- | ------------------------- |
| `npm start`       | Start the Expo dev server |
| `npm run ios`     | Run on iOS simulator      |
| `npm run android` | Run on Android emulator   |
| `npm run web`     | Run in web browser        |
| `npm run lint`    | Run ESLint                |

## Demo Data

Tap **SISUPHYS** 5 times on the Home screen to load demo data. Choose from:

- **Full** – All features (30+ day streak, filled consistency grid, multiple exercises)
- **Slow state** – 0 workouts in 7 days
- **Pushing state** – 1–2 workouts in 7 days
- **7-day streak** – Consecutive 7-day streak

## Project Structure

```
Sisuphys/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx      # Home
│   │   ├── progress.tsx   # Charts & stats
│   │   └── tracking.tsx  # Log exercises
│   └── _layout.tsx
├── components/
├── constants/
│   ├── quotes.ts         # Sisyphus state, streaks, quotes
│   └── theme.ts          # Colors, spacing
├── hooks/
│   └── useLifts.ts       # AsyncStorage lift data
├── types/
│   └── exercise.ts       # Lift, Entry types
└── utils/
    ├── date-utils.ts     # YYYY-MM-DD date handling
    └── demo-data.ts      # Demo data generators
```

## License

MIT
