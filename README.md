# Cogniedufy Kids

Mobile client for the Cogniedufy educational platform. Built with React Native and Expo.

## Technical Stack

- **Framework**: Expo (SDK 54)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Styling**: React Native StyleSheet with custom design tokens
- **Persistence**: MMKV (with in-memory fallback for Expo Go)
- **Animations**: React Native Animated API (spring + timing)
- **Text-to-Speech**: Expo Speech
- **Languages**: English, Hausa, Yoruba, Igbo

## Getting Started

### Prerequisites

- Node.js (LTS)
- npm or yarn
- Expo Go app or an emulator (iOS Simulator / Android Emulator)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

### Development

Start the Metro bundler:
```bash
npm run start
```

Run on a specific platform:
```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## Project Structure

- `app/`: Routing and screen layouts using Expo Router.
- `src/components/`: Modular UI components.
- `src/services/`: Core logic, including API clients, AI generators, and voice processing.
- `src/store/`: Global state management with Zustand.
- `src/constants/`: Configuration, theme tokens, and static content.
- `src/hooks/`: Custom React hooks for business logic.
- `src/utils/`: Shared utility functions.
- `assets/`: Images, fonts, and Lottie animations.

## Standards

- **Styling**: Use `StyleSheet.create` with theme tokens from `src/constants/theme.ts`. No inline styles.
- **State**: Zustand for global state, MMKV for persistent local storage.
- **Routing**: Expo Router conventions — nested layouts and dynamic segments.
- **Environment**: `EXPO_PUBLIC_` prefix for runtime-accessible variables.
- **Icons**: Ionicons only — no emoji in UI code.
- **Sounds**: Gate all `playSound` calls through `useSettingsStore.soundEnabled`.
