/**
 * Boss definitions for the Battle Arena — one boss per subject, each with HP,
 * minimum unlock level, CP reward, theme colours and a pool of battle questions.
 * Questions are drawn per subject and age group to match the player's lessons.
 */
import type { Subject } from './curriculum';
import { CURRICULUM_NODES } from './curriculum';
import { getLessonContent } from './lessonContent';
import type { AgeGroup } from './curriculum';

export interface Boss {
  id: string;
  name: string;
  title: string;
  subject: Subject;
  tagline: string;
  hp: number;        // correct hits needed to defeat
  color: string;
  bgColor: string;
  cardBg: string;
  rewardCP: number;
  minLevel: number;
}

export interface BattleQuestion {
  question: string;
  options: string[];
  correct: number;
}

export const BOSSES: Boss[] = [
  {
    id: 'numbor',
    name: 'Numbor',
    title: 'Math Monster',
    subject: 'math',
    tagline: 'He eats wrong answers for breakfast!',
    hp: 5,
    color: '#14b8a6',
    bgColor: '#061a18',
    cardBg: '#0c2420',
    rewardCP: 80,
    minLevel: 1,
  },
  {
    id: 'lexi',
    name: 'Lexi',
    title: 'Word Witch',
    subject: 'english',
    tagline: 'She spells trouble — literally!',
    hp: 5,
    color: '#0ea5e9',
    bgColor: '#060f1a',
    cardBg: '#0a1e36',
    rewardCP: 80,
    minLevel: 1,
  },
  {
    id: 'scorp',
    name: 'Scorp',
    title: 'Science Fiend',
    subject: 'science',
    tagline: 'His experiments always go wrong!',
    hp: 6,
    color: '#f97316',
    bgColor: '#1a0c04',
    cardBg: '#2a1608',
    rewardCP: 100,
    minLevel: 2,
  },
  {
    id: 'rex',
    name: 'Rex',
    title: 'History Dragon',
    subject: 'social',
    tagline: 'He guards the secrets of Nigeria!',
    hp: 6,
    color: '#a855f7',
    bgColor: '#0e0618',
    cardBg: '#1a0e2e',
    rewardCP: 100,
    minLevel: 2,
  },
];

export function getBossById(id: string): Boss | undefined {
  return BOSSES.find((b) => b.id === id);
}

export function getBossQuestions(subject: Subject, ageGroup: AgeGroup): BattleQuestion[] {
  const nodes = CURRICULUM_NODES.filter(
    (n) => n.subject === subject && n.ageGroup === ageGroup,
  );
  const fallback = CURRICULUM_NODES.filter((n) => n.subject === subject);
  const source = nodes.length > 0 ? nodes : fallback;

  const questions: BattleQuestion[] = [];
  for (const node of source) {
    const content = getLessonContent(node.id);
    if (content) questions.push(...content.quiz);
  }

  // Fisher-Yates shuffle
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  return questions;
}
