# Gimbalabs Piece of Pie Hackathon 2026 — Submission

**CogniKids** — AI Learning App for Children with Cardano Rewards  
**Team:** Kamal Aliyu, solo  
**Track:** Builder Pie

---

## Project Identity

- **Official public repository:** [github.com/kamal-ogtl/cogikids](https://github.com/kamal-ogtl/cogikids)
- **Deployed product link:** Currently under review on the Google Play Store — link will be added the moment it is approved
- **Primary X posting account:** [@cedufy](https://x.com/cedufy)
- **Team members:** Kamal Aliyu, solo

---

## What the Product Does

**Who the user is**  
Parents who want their children aged 5–12 to learn through play, and kids who want to earn real rewards for real progress.

**What the user can do**  
- Children log in, pick a learning path (vocabulary, grammar, or math), and work through structured lesson nodes
- They practice spelling in a timed Bee mode with streak tracking
- They challenge boss characters in a battle arena — answering questions chips away at the boss's HP
- They talk live with Cogi, the AI companion, who speaks and listens using a Gemini-powered backend
- Every milestone earned is rewarded with COGI tokens sent directly to their Cardano wallet

**What value the user gets**  
Progress that means something beyond the app. Points systems disappear when subscriptions lapse. COGI tokens live on-chain — if CogniKids ever shuts down, the tokens remain in the child's wallet. The family actually owns the reward.

**Where payment happens**  
CogniKids runs a subscription tier that gates premium content — additional lesson packs, advanced bosses, and extended AI session time. Kids also earn CP (Cogi Points) as they learn, which unlocks content progression and in-app rewards without requiring a paid tier. The subscription is handled in-app through the Play Store billing system.

---

## Live Demo

Recommended flow:

1. **Entry screen** — "Smart Learning for Curious Kids" — two paths: fresh start or resume journey
2. **Onboarding** — parent sets up child's name, age, and Cardano wallet address
3. **Home tab** — skill tree showing locked and unlocked lesson nodes
4. **Lesson node** — tap a node, answer questions, earn XP and CP on completion
5. **Spelling Bee** — timed spelling rounds with the custom on-screen keyboard; streak tracked across days
6. **Battle Arena** — select a boss, enter the fighting-game screen, answer questions to drain the boss's HP
7. **Live AI session (Cogi Talk)** — full-screen nature scene, Cogi character floats and speaks, timer runs
8. **COGI reward** — on node completion, level-up, or 7-day streak, a mint is queued and processed to the child's wallet
9. **Profile** — XP bar, level, streak count, CP balance, and wallet address

---

## How a User Pays

CogniKids has two tiers:

**Free** — access to the first lesson world, spelling bee, and one battle boss. Kids earn CP and COGI on all free content.

**Premium (subscription)** — unlocks all lesson worlds, all three battle bosses, extended Cogi Talk sessions, and the full skill tree. Billed through the Google Play Store. No separate payment gateway is needed — Play Store handles billing, receipts, and refunds.

CP (Cogi Points) are earned inside the app regardless of tier and gate content progression. COGI tokens (on-chain) are minted regardless of tier — every child earns them for real learning milestones.

---

## How Cardano Fits

COGI is a native Cardano token minted under a fixed policy. It is not a wrapped asset or a points database entry — it is an on-chain asset sent to the child's wallet address.

**The flow:**

1. A kid hits a qualifying event (node complete, 7-day streak, level-up). The backend calls `queueCogiReward(kidId, reason)`, which writes a pending entry to `cogiMintQueue` and credits the `cogiLedger` immediately so the UI stays responsive.
2. A mint job hits `POST /kids/cardano/mint`. It reads the queue and for each pending reward:
   - Fetches UTxOs and protocol parameters from **Blockfrost**
   - Builds a transaction using `@emurgo/cardano-serialization-lib` (the same CSL used by Daedalus and Yoroi)
   - Signs with the treasury wallet private key
   - Submits to the Cardano node via Blockfrost's `/tx/submit`
3. Parents can check `GET /kids/cardano/balance` for the on-chain COGI balance and `GET /kids/cardano/history` for the full ledger.

**Reward amounts:**

| Achievement | COGI |
|---|---|
| Complete a lesson node | 10 |
| Maintain a 7-day streak | 25 |
| Level up | 50 |

**Cardano-specific files:**
```
src/lib/cardanoMint.ts     — transaction builder (CSL + Blockfrost)
src/lib/blockfrost.ts      — Blockfrost API helpers
src/lib/cogiRewards.ts     — reward queue and ledger logic
app/kids/cardano/          — API route handlers (balance, mint, history, wallet)
```

---

## What's Working

- Full Expo (React Native) app running on iOS and Android
- Live AI session screen with Cogi character, floating animation, timer, and mic controls
- Structured skill lessons with node unlocking and XP
- Spelling bee with streak tracking and daily bonus rewards
- Battle arena — three boss characters (Word Wizard, Grammar Guardian, Number Knight), fighting-game UI, HP bars, attack animations, auto-advance on answer
- COGI mint queue and ledger — queue writes synchronously, mint job processes async
- Blockfrost integration for UTxO fetching, protocol params, and tx submission
- CSL-based transaction builder using the COGI native script policy
- API endpoints: `/kids/cardano/balance`, `/kids/cardano/mint`, `/kids/cardano/history`
- Kid profile with wallet address, XP, level, streak, and CP balance
- Parent-side profile setup with wallet address entry
- App submitted to Google Play Store (under review)

---

## Why It Matters

The average child in West Africa has access to a smartphone but not to a savings account. COGI tokens are not a substitute for savings — but they establish a habit of ownership. A child's learning achievements are recorded on a public ledger that no company controls. That's the part you cannot build with a points database.

---

## What's Next

- Cardano wallet connection in the parent dashboard (CIP-30) so parents can verify the balance natively
- Token governance: let a community of parents vote on reward rates
- Marketplace: redeem COGI for printed certificates, physical books, or partner discounts
- Mainnet launch with a fixed COGI supply cap and public policy ID

---

## Running It Locally

```bash
git clone https://github.com/kamal-ogtl/cogikids.git
cd cogikids
npm install
cp .env.example .env
# Fill in Supabase, Gemini, and Cardano/Blockfrost credentials
npx expo start
```

Environment variables needed (see `.env.example`):
```
BLOCKFROST_PROJECT_ID=
CARDANO_NETWORK=preprod
CARDANO_TREASURY_ADDRESS=
CARDANO_TREASURY_SKEY=
CARDANO_POLICY_SKEY=
COGI_POLICY_ID=
COGI_NATIVE_SCRIPT_HEX=
EXPO_PUBLIC_API_URL=
```

---

## Twelve Official Weekly Updates

| Week | Link |
|---|---|
| Week 1 | https://x.com/cedufy/status/2050895739560034376?s=20 |
| Week 2 | https://x.com/cedufy/status/2053135959600816383?s=20 |
| Week 3 | https://x.com/cedufy/status/2057324388165243334?s=20 |
| Week 4 | https://x.com/cedufy/status/2058289864097800704?s=20 |
| Week 5 | https://x.com/cedufy/status/2060742637913509891?s=20 |
| Week 6 | https://x.com/cedufy/status/2063330420712714497?s=20 |
| Week 7 | https://x.com/cedufy/status/2066097297218298207?s=20 |
| Week 8 | https://x.com/cedufy/status/2068467727656726916?s=20 |
| Week 9 | https://x.com/cedufy/status/2071266118870667762?s=20 |
| Week 10 | https://x.com/cedufy/status/2073838348129505601?s=20 |
| Week 11 | https://x.com/cedufy/status/2077521657095151917?s=20 |
| Week 12 | https://x.com/cedufy/status/2080245779977900221?s=20 |

---

## Builder Verification Summary

- [x] Official public repository linked — [github.com/kamal-ogtl/cogikids](https://github.com/kamal-ogtl/cogikids)
- [x] Deployed product link — Google Play Store (under review, link to be added on approval)
- [x] All 12 official weekly update posts linked above
- [x] Cardano integration with real on-chain COGI token minting via Blockfrost + CSL
- [x] Payment gateway described — Play Store subscription + CP in-app progression
- [x] Public evidence is verifiable via the repository and weekly X posts

---

## Contact

Kamal Aliyu — kamalaliyu212@gmail.com
