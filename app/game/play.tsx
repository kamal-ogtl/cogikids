import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS } from '../../src/constants/theme';

import IconBack    from '../../assets/icon-back.svg';
import IconSound   from '../../assets/game-icon-sound.svg';
import IconHint    from '../../assets/game-icon-hint.svg';
import IconPuzzle  from '../../assets/game-icon-puzzle.svg';
import ChearChar   from '../../assets/game-chears-character.svg';

const { width: SW } = Dimensions.get('window');
const SC = SW / 375;

const QUESTION_SCENE = require('../../assets/game-question-scene.png');

// ── Design tokens (Figma exact) ───────────────────────────────────────────────
const C = {
  bg:         '#f5fcff',
  dark:       '#171a1c',
  grey:       '#5d686f',
  accent:     '#59c8ff',
  white:      '#ffffff',
  card:       '#ffffff',
  cardBorder: '#e3e6e8',
  hintBg:     '#fff8e9',
  // option states
  neutralBg:  '#ffffff',
  neutralStr: '#e3e6e8',
  selBg:      '#f5fcff',
  selStr:     '#59c8ff',
  correctBg:  '#edfff2',
  correctStr: '#34c759',
  wrongBg:    '#ffeded',
  wrongStr:   '#dd3636',
  // bottom action bg
  pendingBg:  '#ffffff',
  successBg:  '#edfff2',
  failBg:     '#ffeded',
};

// ── Question data ─────────────────────────────────────────────────────────────
type MCOption = { id: string; label: string };
type BlockOption = { id: string; label: string };

type QuestionMC = {
  type: 'mc';
  heading: string;
  sentenceParts: string[];  // ["The park was fully crowded with ", "___", ""]
  options: MCOption[];
  correctId: string;
  hint: string;
};

type QuestionBlocks = {
  type: 'blocks';
  heading: string;
  sentenceSlots: string[];  // slots in the answer area (empty string = blank)
  wordBank: BlockOption[];
  correctOrder: string[];   // correct word IDs in order
  hint: string;
};

type Question = QuestionMC | QuestionBlocks;

const QUESTIONS: Question[] = [
  {
    type: 'mc',
    heading: 'Choose the Right Options',
    sentenceParts: ['The park was fully crowded with Lots of ', '___', ''],
    options: [
      { id: 'cars',    label: 'Cars' },
      { id: 'peoples', label: 'Peoples' },
      { id: 'toys',    label: 'Toys' },
      { id: 'clouds',  label: 'Clouds' },
    ],
    correctId: 'peoples',
    hint: 'Humans have 2 Lags',
  },
  {
    type: 'blocks',
    heading: 'Create Sentence Using Blocks',
    sentenceSlots: ['Unexpectedly', '___', 'Fingertips', 'got broken'],
    wordBank: [
      { id: 'unexpectedly', label: 'Unexpectedly' },
      { id: 'is',           label: 'is' },
      { id: 'my',           label: 'my' },
      { id: 'fingertips',   label: 'Fingertips' },
      { id: 'got_broken',   label: 'got broken' },
    ],
    correctOrder: ['unexpectedly', 'is', 'my', 'fingertips', 'got_broken'],
    hint: 'Humans have 2 Lags',
  },
];

// ── Progress bar — Figma: 208×26, white bg, #59c8ff fill, r=13 ───────────────
function ProgressBar({ progress }: { progress: number }) {
  const BAR_W  = 208 * SC;
  const BAR_H  = 26 * SC;
  const FILL_W = BAR_W * Math.min(Math.max(progress, 0), 1);
  return (
    <View style={[pb.track, { width: BAR_W, height: BAR_H, borderRadius: BAR_H / 2 }]}>
      <View style={[pb.fill, { width: FILL_W, height: BAR_H, borderRadius: BAR_H / 2 }]} />
    </View>
  );
}
const pb = StyleSheet.create({
  track: { backgroundColor: C.white, borderWidth: 1, borderColor: '#c9edff', overflow: 'hidden' },
  fill:  { backgroundColor: C.accent, position: 'absolute', left: 0, top: 0 },
});

// ── Hearts pill — Figma: 55×36, white bg, #59c8ff border ────────────────────
function HeartsPill({ count }: { count: number }) {
  return (
    <View style={hp.pill}>
      <Text style={hp.heart}>❤️</Text>
      <Text style={hp.num}>{count}</Text>
    </View>
  );
}
const hp = StyleSheet.create({
  pill: {
    width: 55 * SC, height: 36 * SC, borderRadius: 1000,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.accent,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 * SC,
  },
  heart: { fontSize: 13 * SC },
  num:   { fontFamily: FONTS.heading, fontSize: 14 * SC, color: C.grey },
});

// ── Hint strip — Figma: 375×56, #fff8e9 bg, puzzle icon + text + mini bar ────
function HintStrip({ text, progress }: { text: string; progress: number }) {
  const MINI_W  = 54 * SC;
  const MINI_H  = 9 * SC;
  const FILL_W  = MINI_W * progress;
  return (
    <View style={hs.wrap}>
      <IconPuzzle width={24 * SC} height={24 * SC} />
      <Text style={hs.text}>{text}</Text>
      <View style={[hs.miniTrack, { width: MINI_W, height: MINI_H, borderRadius: MINI_H / 2 }]}>
        <View style={[hs.miniFill, { width: FILL_W, height: MINI_H, borderRadius: MINI_H / 2 }]} />
      </View>
    </View>
  );
}
const hs = StyleSheet.create({
  wrap:      { width: SW, height: 56 * SC, backgroundColor: C.hintBg, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 * SC, gap: 10 * SC },
  text:      { flex: 1, fontFamily: FONTS.body, fontSize: 16 * SC, color: C.dark },
  miniTrack: { backgroundColor: '#ffdccb', overflow: 'hidden' },
  miniFill:  { backgroundColor: '#ff894f', position: 'absolute', left: 0, top: 0 },
});

// ── Actions bar — Figma: 136×74, white, r=16, sound + hint buttons ────────────
function ActionsBar({ onSound, onHint }: { onSound?: () => void; onHint?: () => void }) {
  const BTN = 48 * SC;
  return (
    <View style={[ab.wrap, { height: 74 * SC, borderRadius: 16 * SC }]}>
      <TouchableOpacity style={[ab.btn, { width: BTN, height: BTN, borderRadius: 12 * SC }]} onPress={onSound} activeOpacity={0.8}>
        <IconSound width={24 * SC} height={24 * SC} />
      </TouchableOpacity>
      <TouchableOpacity style={[ab.btn, { width: BTN, height: BTN, borderRadius: 12 * SC }]} onPress={onHint} activeOpacity={0.8}>
        <IconHint width={24 * SC} height={24 * SC} />
      </TouchableOpacity>
    </View>
  );
}
const ab = StyleSheet.create({
  wrap: { width: 136 * SC, backgroundColor: C.white, borderWidth: 1, borderColor: C.cardBorder, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 * SC },
  btn:  { backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
});

// ── Option block — Figma: 164×52, r=16 ───────────────────────────────────────
type OptionState = 'neutral' | 'selected' | 'correct' | 'wrong';
function OptionBlock({
  label, state, onPress,
}: {
  label: string; state: OptionState; onPress?: () => void;
}) {
  const bg  = state === 'correct' ? C.correctBg : state === 'wrong' ? C.wrongBg : state === 'selected' ? C.selBg : C.neutralBg;
  const str = state === 'correct' ? C.correctStr : state === 'wrong' ? C.wrongStr : state === 'selected' ? C.selStr : C.neutralStr;
  return (
    <TouchableOpacity
      style={[opt.block, { width: 164 * SC, height: 52 * SC, backgroundColor: bg, borderColor: str }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[opt.label, { fontSize: 16 * SC }]}>{label}</Text>
    </TouchableOpacity>
  );
}
const opt = StyleSheet.create({
  block: { borderWidth: 1.5, borderRadius: 16 * SC, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: FONTS.body, color: C.dark },
});

// ── Word block chip — for block-builder question ──────────────────────────────
function WordChip({
  label, state, onPress,
}: {
  label: string; state: OptionState; onPress?: () => void;
}) {
  const bg  = state === 'correct' ? C.correctBg : state === 'wrong' ? C.wrongBg : state === 'selected' ? C.selBg : '#e3e6e8';
  const str = state === 'correct' ? C.correctStr : state === 'wrong' ? C.wrongStr : state === 'selected' ? C.selStr : '#adb5ba';
  return (
    <TouchableOpacity
      style={[wc.chip, { backgroundColor: bg, borderColor: str }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[wc.label, { fontSize: 16 * SC }]}>{label}</Text>
    </TouchableOpacity>
  );
}
const wc = StyleSheet.create({
  chip:  { height: 32 * SC, paddingHorizontal: 12 * SC, borderRadius: 6 * SC, borderBottomWidth: 2, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: FONTS.body, color: C.dark },
});

// ── Bottom action panel — 3 states ───────────────────────────────────────────
type AnswerState = 'pending' | 'correct' | 'wrong';

function BottomAction({
  answerState,
  onCheck,
  onContinue,
}: {
  answerState: AnswerState;
  onCheck: () => void;
  onContinue: () => void;
}) {
  if (answerState === 'pending') {
    return (
      <View style={[ba.wrap, { backgroundColor: C.white }]}>
        <TouchableOpacity style={[ba.btn, { backgroundColor: C.accent }]} onPress={onCheck} activeOpacity={0.85}>
          <View style={ba.shine1} />
          <View style={ba.shine2} />
          <Text style={[ba.btnLabel, { color: '#f5fcff' }]}>Check</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (answerState === 'correct') {
    return (
      <View style={[ba.wrap, { backgroundColor: C.successBg, paddingTop: 12 * SC }]}>
        <View style={ba.resultRow}>
          {/* Party popper icon area */}
          <View style={ba.resultIcon}>
            <Text style={ba.resultEmoji}>🎉</Text>
          </View>
          <View style={ba.resultText}>
            <Text style={[ba.resultTitle, { fontSize: 22 * SC }]}>Nice...</Text>
          </View>
        </View>
        <TouchableOpacity style={[ba.btn, { backgroundColor: C.correctStr }]} onPress={onContinue} activeOpacity={0.85}>
          <Text style={[ba.btnLabel, { color: '#effff3' }]}>Continue Next</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // wrong
  return (
    <View style={[ba.wrap, { backgroundColor: C.failBg, paddingTop: 12 * SC }]}>
      <View style={ba.resultRow}>
        <View style={ba.resultIcon}>
          <Text style={ba.resultEmoji}>💔</Text>
        </View>
        <View style={ba.resultText}>
          <Text style={[ba.resultTitle, { fontSize: 22 * SC }]}>Opps.! No Worry</Text>
          <Text style={[ba.resultDesc, { fontSize: 14 * SC }]}>Humans Make's Mistakes</Text>
        </View>
      </View>
      <TouchableOpacity style={[ba.btn, { backgroundColor: '#e04a4a' }]} onPress={onContinue} activeOpacity={0.85}>
        <Text style={[ba.btnLabel, { color: '#ffefef' }]}>Remind me later</Text>
      </TouchableOpacity>
    </View>
  );
}

const ba = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16 * SC,
    paddingBottom: 16 * SC,
    paddingTop: 8 * SC,
    borderTopWidth: 1,
    borderTopColor: '#f0f2f4',
    gap: 12 * SC,
  },
  btn: {
    height: 48 * SC, borderRadius: 16 * SC,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  btnLabel: { fontFamily: FONTS.display, fontSize: 16 * SC },
  shine1: {
    position: 'absolute', left: 10 * SC, top: -20 * SC,
    width: 56 * SC, height: 80 * SC,
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 6,
    transform: [{ rotate: '12deg' }],
  },
  shine2: {
    position: 'absolute', left: 56 * SC, top: -20 * SC,
    width: 40 * SC, height: 80 * SC,
    backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 6,
    transform: [{ rotate: '12deg' }],
  },
  resultRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 * SC },
  resultIcon: { width: 42 * SC, height: 42 * SC, alignItems: 'center', justifyContent: 'center' },
  resultEmoji: { fontSize: 32 * SC },
  resultText:  { flex: 1 },
  resultTitle: { fontFamily: FONTS.display, color: C.dark },
  resultDesc:  { fontFamily: FONTS.body, color: '#a51c1c', marginTop: 2 * SC },
});

// ── Screen: Multiple Choice ───────────────────────────────────────────────────
function MCScreen({
  question,
  progress,
  hearts,
  onBack,
}: {
  question: QuestionMC;
  progress: number;
  hearts: number;
  onBack: () => void;
}) {
  const [selectedId, setSelectedId]  = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('pending');
  const insets = useSafeAreaInsets();

  const CARD_W = 343 * SC;
  const CARD_H = 298 * SC;
  const IMG_W  = 248 * SC;
  const IMG_H  = 160 * SC;

  function getOptionState(id: string): OptionState {
    if (answerState === 'pending') return id === selectedId ? 'selected' : 'neutral';
    if (id === question.correctId) return 'correct';
    if (id === selectedId && id !== question.correctId) return 'wrong';
    return 'neutral';
  }

  function handleCheck() {
    if (!selectedId) return;
    setAnswerState(selectedId === question.correctId ? 'correct' : 'wrong');
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* ── Top App Bar — Figma: 375×80 ── */}
      <View style={[s.topBar, { paddingTop: insets.top + 4 * SC }]}>
        <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.7}>
          <IconBack width={22} height={22} color={C.dark} />
        </TouchableOpacity>
        <ProgressBar progress={progress} />
        <HeartsPill count={hearts} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Clouds background — Figma: decorative floating cloud groups */}
        <View style={s.cloudsRow} pointerEvents="none">
          {[0,1,2,3].map(i => (
            <View key={i} style={[s.cloud, { opacity: 0.85 + i * 0.04 }]}>
              <View style={s.cloudTop} />
              <View style={s.cloudBase} />
            </View>
          ))}
        </View>

        {/* ── Question Heading — Figma: 375×28, fs=22 fw=800 ── */}
        <View style={s.headingWrap}>
          <Text style={[s.heading, { fontSize: 22 * SC }]}>{question.heading}</Text>
        </View>

        {/* ── Question View Card — Figma: 343×298, white, r=24 ── */}
        <View style={s.container}>
          <View style={[s.questionCard, { width: CARD_W, height: CARD_H }]}>
            {/* Illustrated scene — Figma: Image group 248×160 */}
            <View style={[s.sceneWrap, { width: IMG_W, height: IMG_H }]}>
              <Image
                source={QUESTION_SCENE}
                style={{ width: IMG_W, height: IMG_H }}
                resizeMode="contain"
              />
            </View>

            {/* Question sentence with blank */}
            <View style={s.questionSentence}>
              <View style={s.sentenceRow}>
                <Text style={[s.sentenceText, { fontSize: 16 * SC }]}>{question.sentenceParts[0]}</Text>
                {/* Fill block chip — Figma: chip 129×32, #e3e6e8, r=6 */}
                <View style={[s.fillChip, { height: 32 * SC, borderRadius: 6 * SC }]}>
                  <Text style={[s.fillChipText, { fontSize: 16 * SC }]}>
                    {selectedId
                      ? question.options.find(o => o.id === selectedId)?.label ?? '_____'
                      : '_____'}
                  </Text>
                </View>
                {question.sentenceParts[2] ? (
                  <Text style={[s.sentenceText, { fontSize: 16 * SC }]}>{question.sentenceParts[2]}</Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* ── Actions bar + Hint strip inline ── */}
          <View style={s.actionsRow}>
            <ActionsBar />
          </View>
        </View>

        {/* ── Hint strip — Figma: 375×56, #fff8e9 ── */}
        <HintStrip text={question.hint} progress={0.4} />

        {/* ── Option Grid — Figma: 343×120, 2×2 ── */}
        <View style={s.optionGrid}>
          {[0, 1].map(row => (
            <View key={row} style={s.optionRow}>
              {question.options.slice(row * 2, row * 2 + 2).map(opt => (
                <OptionBlock
                  key={opt.id}
                  label={opt.label}
                  state={getOptionState(opt.id)}
                  onPress={answerState === 'pending' ? () => setSelectedId(opt.id) : undefined}
                />
              ))}
            </View>
          ))}

          {/* View More */}
          <View style={s.viewMoreRow}>
            <TouchableOpacity style={s.viewMoreBtn} activeOpacity={0.8}>
              <Text style={[s.viewMoreText, { fontSize: 14 * SC }]}>View More</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom Action — fixed ── */}
      <View style={[s.bottomFixed, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <BottomAction
          answerState={answerState}
          onCheck={handleCheck}
          onContinue={() => router.back()}
        />
      </View>
    </View>
  );
}

// ── Screen: Block Builder ─────────────────────────────────────────────────────
function BlocksScreen({
  question,
  progress,
  hearts,
  onBack,
}: {
  question: QuestionBlocks;
  progress: number;
  hearts: number;
  onBack: () => void;
}) {
  const [placedIds, setPlacedIds]    = useState<string[]>([]);
  const [answerState, setAnswerState] = useState<AnswerState>('pending');
  const insets = useSafeAreaInsets();

  const CARD_W = 343 * SC;

  function toggleWord(id: string) {
    if (answerState !== 'pending') return;
    setPlacedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  }

  function getWordState(id: string): OptionState {
    if (answerState === 'pending') return placedIds.includes(id) ? 'selected' : 'neutral';
    const pos = question.correctOrder.indexOf(id);
    if (pos < 0) return 'neutral';
    if (placedIds.includes(id)) return 'correct';
    return 'wrong';
  }

  function handleCheck() {
    if (placedIds.length === 0) return;
    const correct = JSON.stringify(placedIds) === JSON.stringify(question.correctOrder);
    setAnswerState(correct ? 'correct' : 'wrong');
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* ── Top App Bar ── */}
      <View style={[s.topBar, { paddingTop: insets.top + 4 * SC }]}>
        <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.7}>
          <IconBack width={22} height={22} color={C.dark} />
        </TouchableOpacity>
        <ProgressBar progress={progress} />
        <HeartsPill count={hearts} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 220 }} showsVerticalScrollIndicator={false}>
        {/* Clouds */}
        <View style={s.cloudsRow} pointerEvents="none">
          {[0,1,2,3].map(i => (
            <View key={i} style={[s.cloud, { opacity: 0.85 + i * 0.04 }]}>
              <View style={s.cloudTop} />
              <View style={s.cloudBase} />
            </View>
          ))}
        </View>

        {/* ── Question Heading ── */}
        <View style={s.headingWrap}>
          <Text style={[s.heading, { fontSize: 22 * SC }]}>{question.heading}</Text>
        </View>

        <View style={s.container}>
          {/* ── Answer card — Figma: 343×166, white, r=24 ── */}
          <View style={[s.blockCard, { width: CARD_W }]}>
            {/* Filled-in slots — rows of word chips */}
            <View style={s.blockSlots}>
              <View style={s.blockSlotRow}>
                {question.sentenceSlots.map((slot, i) => (
                  slot === '___'
                    ? (
                      <View key={i} style={[s.blankSlot, { height: 32 * SC, minWidth: 80 * SC, borderRadius: 6 * SC }]}>
                        {placedIds.length > 0 && (
                          <Text style={[s.blankFilled, { fontSize: 16 * SC }]}>
                            {question.wordBank.find(w => w.id === placedIds[0])?.label}
                          </Text>
                        )}
                      </View>
                    )
                    : (
                      <WordChip key={i} label={slot} state="neutral" />
                    )
                ))}
              </View>
            </View>

            {/* Actions bar inside the card */}
            <View style={s.actionsRow}>
              <ActionsBar />
            </View>
          </View>

          {/* ── Hint strip ── */}
          <HintStrip text={question.hint} progress={0.4} />

          {/* ── Word Bank — Figma: 343×120, blocks grid ── */}
          <View style={s.wordBankWrap}>
            <View style={s.wordBankRow}>
              {question.wordBank.slice(0, 3).map(w => (
                <TouchableOpacity
                  key={w.id}
                  style={[
                    s.bankBlock,
                    {
                      height: 52 * SC, borderRadius: 16 * SC,
                      backgroundColor: getWordState(w.id) === 'selected' ? C.selBg : getWordState(w.id) === 'correct' ? C.correctBg : getWordState(w.id) === 'wrong' ? C.wrongBg : C.white,
                      borderColor: getWordState(w.id) === 'selected' ? C.selStr : getWordState(w.id) === 'correct' ? C.correctStr : getWordState(w.id) === 'wrong' ? C.wrongStr : C.neutralStr,
                    },
                  ]}
                  onPress={() => toggleWord(w.id)}
                  activeOpacity={0.85}
                >
                  <Text style={[s.bankLabel, { fontSize: 16 * SC }]}>{w.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.wordBankRow}>
              {question.wordBank.slice(3).map(w => (
                <TouchableOpacity
                  key={w.id}
                  style={[
                    s.bankBlock,
                    {
                      height: 52 * SC, borderRadius: 16 * SC,
                      backgroundColor: getWordState(w.id) === 'selected' ? C.selBg : getWordState(w.id) === 'correct' ? C.correctBg : getWordState(w.id) === 'wrong' ? C.wrongBg : C.white,
                      borderColor: getWordState(w.id) === 'selected' ? C.selStr : getWordState(w.id) === 'correct' ? C.correctStr : getWordState(w.id) === 'wrong' ? C.wrongStr : C.neutralStr,
                    },
                  ]}
                  onPress={() => toggleWord(w.id)}
                  activeOpacity={0.85}
                >
                  <Text style={[s.bankLabel, { fontSize: 16 * SC }]}>{w.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.viewMoreRow}>
              <TouchableOpacity style={s.viewMoreBtn} activeOpacity={0.8}>
                <Text style={[s.viewMoreText, { fontSize: 14 * SC }]}>View More</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[s.bottomFixed, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <BottomAction
          answerState={answerState}
          onCheck={handleCheck}
          onContinue={() => router.back()}
        />
      </View>
    </View>
  );
}

// ── Screen: Cheers / Celebration ─────────────────────────────────────────────
function ChearsScreen({ onContinue }: { onContinue: () => void }) {
  const insets = useSafeAreaInsets();
  const CHAR_W = 270 * SC;
  const CHAR_H = 250 * SC;

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top App Bar (minimal) */}
      <View style={[s.topBar, { paddingTop: insets.top + 4 * SC }]}>
        <TouchableOpacity style={s.backBtn} onPress={onContinue} activeOpacity={0.7}>
          <IconBack width={22} height={22} color={C.dark} />
        </TouchableOpacity>
        <ProgressBar progress={0.72} />
        <HeartsPill count={5} />
      </View>

      {/* Clouds decoration */}
      <View style={s.cloudsRow} pointerEvents="none">
        {[0,1,2,3].map(i => (
          <View key={i} style={[s.cloud, { opacity: 0.85 + i * 0.04 }]}>
            <View style={s.cloudTop} />
            <View style={s.cloudBase} />
          </View>
        ))}
      </View>

      {/* ── Celebration content — Figma: Greeting 246×102 + Image 270×250 ── */}
      <View style={ch.body}>
        {/* "Nice.!" — Figma: fs=57, fw=900, #1ab3ff */}
        <Text style={[ch.bigTitle, { fontSize: 57 * SC }]}>Nice.!</Text>
        {/* "You are getting fire 🔥" — Figma: fs=24, fw=700, #171a1c */}
        <Text style={[ch.subtitle, { fontSize: 24 * SC }]}>You are getting fire 🔥</Text>

        {/* Character — Figma: celebration Mieo illustration 270×250 */}
        <View style={{ width: CHAR_W, height: CHAR_H, marginTop: 20 * SC }}>
          <ChearChar width={CHAR_W} height={CHAR_H} />
        </View>
      </View>

      {/* Bottom Action */}
      <View style={[s.bottomFixed, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <BottomAction
          answerState="correct"
          onCheck={() => {}}
          onContinue={onContinue}
        />
      </View>
    </View>
  );
}

const ch = StyleSheet.create({
  body:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 * SC },
  bigTitle: { fontFamily: FONTS.display, color: '#1ab3ff', textAlign: 'center' },
  subtitle: { fontFamily: FONTS.display, color: C.dark, textAlign: 'center', marginTop: 4 * SC },
});

// ── Root screen router ────────────────────────────────────────────────────────
export default function GamePlayScreen() {
  const { type, qIndex } = useLocalSearchParams<{ type?: string; qIndex?: string }>();

  const questionIndex = parseInt(qIndex ?? '0', 10);
  const screenType    = type ?? 'mc';

  if (screenType === 'chears') {
    return <ChearsScreen onContinue={() => router.back()} />;
  }

  if (screenType === 'blocks') {
    const q = QUESTIONS.find(q => q.type === 'blocks') as QuestionBlocks | undefined;
    if (!q) return null;
    return (
      <BlocksScreen
        question={q}
        progress={0.88}
        hearts={5}
        onBack={() => router.back()}
      />
    );
  }

  const q = QUESTIONS.find(q => q.type === 'mc') as QuestionMC | undefined;
  if (!q) return null;
  return (
    <MCScreen
      question={q}
      progress={0.27}
      hearts={5}
      onBack={() => router.back()}
    />
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const CLOUD_W = 90 * SC;
const CLOUD_H = 40 * SC;

const s = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { flex: 1 },

  // Top App Bar — Figma: 375×80
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16 * SC,
    paddingBottom: 10 * SC,
    backgroundColor: C.white,
    gap: 8 * SC,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f4',
    zIndex: 10,
  },
  backBtn: {
    width: 48 * SC, height: 48 * SC, borderRadius: 12 * SC,
    backgroundColor: C.white, borderWidth: 1.5, borderColor: C.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },

  // Decorative clouds — Figma: Clouds group, white/light-blue layered shapes
  cloudsRow: {
    position: 'absolute', top: 60 * SC, left: -20 * SC, right: -20 * SC,
    flexDirection: 'row', justifyContent: 'space-between',
    zIndex: 0, overflow: 'hidden',
  },
  cloud: { alignItems: 'center' },
  cloudTop:  { width: CLOUD_W * 0.6, height: CLOUD_H * 0.7, borderRadius: CLOUD_W, backgroundColor: '#ffffff' },
  cloudBase: { width: CLOUD_W, height: CLOUD_H * 0.6, borderRadius: CLOUD_H, backgroundColor: '#e9f7ff', marginTop: -CLOUD_H * 0.2 },

  // Heading — Figma: 375×28
  headingWrap: { paddingHorizontal: 16 * SC, paddingTop: 88 * SC, paddingBottom: 8 * SC },
  heading:     { fontFamily: FONTS.display, color: C.dark },

  container: { paddingHorizontal: 16 * SC, gap: 12 * SC },

  // Question card — Figma: 343×298, white, r=24, stroke #e3e6e8
  questionCard: {
    backgroundColor: C.card,
    borderRadius: 24 * SC,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: 'center',
    overflow: 'hidden',
    paddingBottom: 16 * SC,
  },
  sceneWrap: { marginTop: 16 * SC },

  // Sentence with fill blank
  questionSentence: { paddingHorizontal: 16 * SC, paddingTop: 16 * SC, width: '100%' },
  sentenceRow:      { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 * SC },
  sentenceText:     { fontFamily: FONTS.body, color: C.grey },
  fillChip: {
    backgroundColor: '#e3e6e8', paddingHorizontal: 10 * SC,
    alignItems: 'center', justifyContent: 'center',
  },
  fillChipText: { fontFamily: FONTS.body, color: C.dark },

  actionsRow: { alignSelf: 'center', marginTop: 12 * SC },

  // Option grid — Figma: 343×120, 2×2
  optionGrid:  { paddingHorizontal: 16 * SC, gap: 12 * SC, marginTop: 8 * SC },
  optionRow:   { flexDirection: 'row', gap: 16 * SC },
  viewMoreRow: { alignItems: 'flex-end' },
  viewMoreBtn: { paddingHorizontal: 16 * SC, paddingVertical: 8 * SC, backgroundColor: '#dff4ff', borderRadius: 8 * SC },
  viewMoreText: { fontFamily: FONTS.body, color: '#1ab3ff' },

  // Block builder card
  blockCard: {
    backgroundColor: C.card,
    borderRadius: 24 * SC,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 16 * SC,
    gap: 12 * SC,
  },
  blockSlots:   { gap: 8 * SC },
  blockSlotRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 * SC },
  blankSlot: {
    backgroundColor: '#f5f7f8',
    borderBottomWidth: 2,
    borderColor: '#adb5ba',
    paddingHorizontal: 12 * SC,
    alignItems: 'center', justifyContent: 'center',
  },
  blankFilled: { fontFamily: FONTS.body, color: C.dark },

  // Word bank
  wordBankWrap: { paddingHorizontal: 16 * SC, gap: 8 * SC, marginTop: 4 * SC },
  wordBankRow:  { flexDirection: 'row', gap: 8 * SC, flexWrap: 'wrap' },
  bankBlock:    { paddingHorizontal: 16 * SC, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  bankLabel:    { fontFamily: FONTS.body, color: C.dark },

  bottomFixed: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'transparent',
  },
});
