import { pgTable, serial, varchar, integer, boolean, timestamp, date, uniqueIndex } from 'drizzle-orm/pg-core';

export const kidPlayers = pgTable('kid_players', {
  id:             serial('id').primaryKey(),
  name:           varchar('name', { length: 64 }).notNull(),
  ageGroup:       varchar('age_group', { length: 16 }).notNull(),
  nativeLanguage: varchar('native_language', { length: 16 }).notNull(),
  avatarUrl:      varchar('avatar_url', { length: 256 }),
  level:          integer('level').notNull().default(1),
  xp:             integer('xp').notNull().default(0),
  streakDays:     integer('streak_days').notNull().default(0),
  totalStars:     integer('total_stars').notNull().default(0),
  passwordHash:   varchar('password_hash', { length: 256 }).notNull(),
  lastActiveDate: date('last_active_date'),
  createdAt:      timestamp('created_at').defaultNow(),
});

export const kidNodeProgress = pgTable(
  'kid_node_progress',
  {
    id:           serial('id').primaryKey(),
    kidId:        integer('kid_id').notNull().references(() => kidPlayers.id, { onDelete: 'cascade' }),
    nodeId:       varchar('node_id', { length: 32 }).notNull(),
    unlocked:     boolean('unlocked').notNull().default(true),
    completed:    boolean('completed').notNull().default(false),
    stars:        integer('stars').notNull().default(0),
    highScore:    integer('high_score').notNull().default(0),
    lastPlayedAt: timestamp('last_played_at'),
    updatedAt:    timestamp('updated_at').defaultNow(),
  },
  (t) => [uniqueIndex('uq_kid_node').on(t.kidId, t.nodeId)],
);

export const parentWallets = pgTable('parent_wallets', {
  id:            serial('id').primaryKey(),
  kidId:         integer('kid_id').notNull().references(() => kidPlayers.id, { onDelete: 'cascade' }),
  walletAddress: varchar('wallet_address', { length: 128 }).notNull(),
  network:       varchar('network', { length: 16 }).notNull().default('preprod'),
  createdAt:     timestamp('created_at').defaultNow(),
  updatedAt:     timestamp('updated_at').defaultNow(),
});

export const cogiLedger = pgTable('cogi_ledger', {
  id:          serial('id').primaryKey(),
  kidId:       integer('kid_id').notNull().references(() => kidPlayers.id, { onDelete: 'cascade' }),
  totalEarned: integer('total_earned').notNull().default(0),
  totalMinted: integer('total_minted').notNull().default(0),
  pendingMint: integer('pending_mint').notNull().default(0),
  updatedAt:   timestamp('updated_at').defaultNow(),
});

export const cogiMintQueue = pgTable('cogi_mint_queue', {
  id:        serial('id').primaryKey(),
  kidId:     integer('kid_id').notNull().references(() => kidPlayers.id, { onDelete: 'cascade' }),
  amount:    integer('amount').notNull(),
  reason:    varchar('reason', { length: 32 }).notNull(),
  status:    varchar('status', { length: 16 }).notNull().default('pending'),
  txHash:    varchar('tx_hash', { length: 64 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type KidPlayer      = typeof kidPlayers.$inferSelect;
export type KidPlayerNew   = typeof kidPlayers.$inferInsert;
export type NodeProgress   = typeof kidNodeProgress.$inferSelect;
export type ParentWallet   = typeof parentWallets.$inferSelect;
export type CogiLedger     = typeof cogiLedger.$inferSelect;
export type CogiMintQueue  = typeof cogiMintQueue.$inferSelect;
