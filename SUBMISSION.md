# Gimbalabs Piece of Pie Hackathon 2026 — Submission

## Project: CogniKids

**Category:** Education / Consumer  
**Team:** Kamal Aliyu  
**Track:** Cardano dApp / Real-World Use Case

---

## What we built

CogniKids is a mobile learning app for children aged 5–12. The core idea is simple: kids learn better when they're having fun, and they stay motivated longer when progress actually means something.

The app pairs a live AI conversation partner (Mieo) with structured lessons, a spelling bee, and a battle arena where kids answer questions to defeat boss characters. Every meaningful milestone — completing a lesson, keeping a 7-day streak, levelling up — triggers a COGI token reward minted directly to the child's Cardano wallet.

Parents set up the child's profile and wallet address once. After that, kids just play.

---

## The problem

Most kids' education apps stop at points and badges — rewards that live inside a closed system and vanish the moment a subscription lapses. There's no real ownership, no portability, and no way to show progress outside the app.

We wanted the reward to be real. Something the family actually holds.

---

## How Cardano fits

COGI is a native Cardano token. It's not a wrapper, not a points database — it's an on-chain asset minted under a fixed policy and sent to the child's wallet when they earn it.

**The flow:**

1. A kid completes a lesson node. The backend calls `queueCogiReward(kidId, 'node_complete')`, which writes a pending entry to the `cogiMintQueue` table and credits the `cogiLedger` immediately so the UI stays responsive.
2. A mint job hits `POST /kids/cardano/mint`. It reads the queue, groups pending rewards by wallet, and for each one:
   - Fetches UTxOs and protocol parameters from **Blockfrost**
   - Builds a transaction using `@emurgo/cardano-serialization-lib` (the same CSL used by Daedalus and Yoroi)
   - Signs with the treasury wallet private key
   - Submits to the Cardano node via Blockfrost's `/tx/submit`
3. Kids (or parents) can view the on-chain balance at `GET /kids/cardano/balance` and the full ledger at `GET /kids/cardano/history`.

**Reward amounts:**

| Achievement | COGI |
|---|---|
| Complete a lesson node | 10 |
| Maintain a 7-day streak | 25 |
| Level up | 50 |

These are real tokens on Cardano's preprod network. The same code, pointed at mainnet credentials, runs on mainnet.

---

## What's working

- Full Expo (React Native) app running on iOS and Android
- Live AI session screen with Mieo character, floating animation, timer, and mic controls
- Structured skill lessons with node unlocking and XP
- Spelling bee with streak tracking
- Battle arena — three boss characters (Word Wizard, Grammar Guardian, Number Knight), fighting-game UI, HP bars, attack animations, auto-advance on answer
- COGI mint queue and ledger — queue writes synchronously, mint job processes async
- Blockfrost integration for UTxO fetching, protocol params, and tx submission
- CSL-based transaction builder using the COGI native script policy
- API endpoints: `/kids/cardano/balance`, `/kids/cardano/mint`, `/kids/cardano/history`
- Kid profile with wallet address, XP, level, streak
- Parent-side profile setup

---

## Cardano-specific files

```
src/lib/cardanoMint.ts     — transaction builder (CSL + Blockfrost)
src/lib/blockfrost.ts      — Blockfrost API helpers
src/lib/cogiRewards.ts     — reward queue logic
app/kids/cardano/          — API route handlers (balance, mint, history)
```

---

## Why it matters

The average kid in West Africa has access to a smartphone but not to a savings account. COGI tokens are not a substitute for savings — but they establish a habit. The child's achievements are recorded on a public ledger that isn't controlled by us or any subscription service. If CogniKids ever shuts down, the tokens remain in the wallet.

That's the part we couldn't build with a points database.

---

## What's next

- Cardano wallet connection in the parent dashboard (CIP-30) so parents can see the balance natively
- Token governance: let a community of parents vote on reward rates
- Marketplace: redeem COGI for printed certificates, physical books, or partner discounts
- Mainnet launch with a fixed COGI supply cap and public policy ID

---

## Running it locally

```bash
git clone git@github.com:Alkamal01/Cogniedufy_API.git
cd Cogniedufy_API/cogniedufy-kids
npm install
cp .env.example .env
# Add Supabase, Gemini, and Cardano/Blockfrost credentials
npx expo start
```

Backend:
```bash
cd ../cogniedufy-api
npm install
npm run dev
```

Set `EXPO_PUBLIC_API_URL` in the kids app `.env` to point at the running backend.

---

## Build in Public

Weekly progress updates posted throughout the hackathon:

- [Week 1](https://x.com/cedufy/status/2050895739560034376?s=20)
- [Week 2](https://x.com/cedufy/status/2053135959600816383?s=20)
- [Week 3](https://x.com/cedufy/status/2057324388165243334?s=20)
- [Week 4](https://x.com/cedufy/status/2058289864097800704?s=20)
- [Week 5](https://x.com/cedufy/status/2060742637913509891?s=20)
- [Week 6](https://x.com/cedufy/status/2063330420712714497?s=20)
- [Week 7](https://x.com/cedufy/status/2066097297218298207?s=20)
- [Week 8](https://x.com/cedufy/status/2068467727656726916?s=20)
- [Week 9](https://x.com/cedufy/status/2071266118870667762?s=20)
- [Week 10](https://x.com/cedufy/status/2073838348129505601?s=20)
- [Week 11](https://x.com/cedufy/status/2077521657095151917?s=20)
- [Week 12](https://x.com/cedufy/status/2080244265691598922?s=20)

---

## Contact

Kamal Aliyu — kamalaliyu212@gmail.com
