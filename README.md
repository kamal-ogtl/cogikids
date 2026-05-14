# Cogniedufy Kids

Mobile client for the Cogniedufy educational platform. Built with React Native and Expo.

## Technical Stack

- **Framework**: Expo (SDK 54)
- **Navigation**: Expo Router (File-based routing)
- **State Management**: Zustand
- **Styling**: NativeWind (Tailwind CSS v4)
- **Persistence**: MMKV
- **Animations**: React Native Reanimated & Lottie

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

- **Styling**: Use Tailwind classes via NativeWind. Avoid inline styles or StyleSheet where possible.
- **State**: Use Zustand for global state and MMKV for persistent local storage.
- **Routing**: Follow Expo Router conventions for nested layouts and dynamic segments.
- **Environment**: Use `EXPO_PUBLIC_` prefix for variables that need to be accessible at runtime.
