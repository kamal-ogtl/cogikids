# CogniKids — AI Learning App for Children

CogniKids is a mobile education app built for children aged 5–12. It pairs an AI conversation partner with structured skill lessons, gamified challenges, and a reward system built on Cardano. Kids learn through play — real conversations, spelling bees, battle quizzes — and earn COGI tokens as they progress.

Built with Expo (React Native) and a Node.js/Hono backend. The app runs on both iOS and Android.

---

## What's inside

**Live AI Session (Mieo Talk)**
Kids tap into a full-screen session with Mieo, the app's mascot. Mieo speaks, listens, and responds using a Gemini-powered backend. The screen shows a nature scene, a live timer, and controls to pause, mute, or end the session.

**Skill Lessons**
Structured learning paths broken into nodes. Each node unlocks after the previous one is completed. Progress is saved per kid profile and synced to the backend.

**Spelling Bee**
A timed spelling game with a custom on-screen keyboard, letter-by-letter input, and streak tracking. Daily streaks earn bonus COGI rewards.

**Battle Arena**
Three boss characters — Word Wizard, Grammar Guardian, Number Knight — each with their own question bank. Tap a boss to enter a fighting-game-style battle. Answer questions to chip away at the boss's HP. Wrong answers cost hearts. Win to earn XP.

**Profile & Progress**
Each kid has a profile with level, XP, active streak, and a wallet address for receiving COGI tokens.

---

## Cardano integration

CogniKids mints COGI — a native Cardano token — as a reward for real achievements:

| Event | COGI earned |
|---|---|
| Complete a lesson node | 10 COGI |
| Reach a 7-day streak | 25 COGI |
| Level up | 50 COGI |

**How it works:**
1. When a kid hits a qualifying event, `queueCogiReward()` writes a pending entry to `cogiMintQueue` and credits the `cogiLedger` immediately so the UI is responsive.
2. A background job calls `POST /kids/cardano/mint` to flush the queue — it builds a Cardano transaction using `@emurgo/cardano-serialization-lib`, fetches UTxOs and protocol parameters from Blockfrost, signs with the treasury wallet key, and submits.
3. Kids (or parents) can check `GET /kids/cardano/balance` to see their on-chain COGI balance and `GET /kids/cardano/history` for the full ledger.

Environment variables needed (see `.env.example`):
```
BLOCKFROST_PROJECT_ID=
CARDANO_NETWORK=preprod        # or mainnet
CARDANO_TREASURY_ADDRESS=
CARDANO_TREASURY_SKEY=
CARDANO_POLICY_SKEY=
COGI_POLICY_ID=
COGI_NATIVE_SCRIPT_HEX=
```

---

## Installation

**Prerequisites:** Node 20+, npm, Expo CLI, and an Expo Go app on your phone (or a simulator).

```bash
# 1. Clone the repo
git clone git@github.com:Alkamal01/Cogniedufy_API.git
cd Cogniedufy_API/cogniedufy-kids

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Fill in your Supabase, Gemini, and Cardano keys in .env

# 4. Start the dev server
npx expo start
```

Scan the QR code with Expo Go or press `i` / `a` for iOS/Android simulator.

**Backend setup** is in the parent `cogniedufy-api/` directory. It runs on Hono (Node.js). The kids app reads `EXPO_PUBLIC_API_URL` to know where to point.

---

## Project structure

```
cogniedufy-kids/
├── app/
│   ├── (auth)/         # Entry, splash, login, onboarding, profile setup
│   ├── (tabs)/         # Home, Skills, Bee, Live (Mieo), Arena, Profile
│   ├── battle/         # [bossId].tsx — fighting game battle screen
│   ├── lesson/         # [nodeId].tsx — individual lesson node
│   └── story/          # Story map and level screens
├── assets/             # Images, SVG characters, icons
├── src/
│   ├── components/     # Shared UI (spelling keyboard, letter box, etc.)
│   ├── constants/      # Theme tokens, fonts
│   ├── db/             # Drizzle client
│   ├── lib/            # cardanoMint, cogiRewards, blockfrost, gemini, jwt
│   └── store/          # Zustand stores (player, auth)
└── .env.example
```

---

## Tech stack

- **Expo SDK 54** / React Native — cross-platform mobile
- **Expo Router v6** — file-based routing
- **react-native-svg** — all custom icons and scene illustrations
- **Zustand** — client state (player, auth)
- **Drizzle ORM + Supabase** — database
- **Hono** — backend API (Node.js)
- **Google Gemini** — AI conversation engine
- **Cardano (Preprod/Mainnet)** — COGI token minting via Blockfrost + CSL
