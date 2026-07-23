// Nigerian school curriculum node definitions.
// Maps to the skill tree in Phase 4.
// Age groups: explorer (5–9), strategist (10–15)

export type AgeGroup = 'explorer' | 'strategist';
export type Subject = 'english' | 'math' | 'science' | 'social';

export interface CurriculumNode {
  id: string;
  subject: Subject;
  title: string;
  ageGroup: AgeGroup;
  level: number;       // 1 = starter, higher = harder
  prerequisite?: string; // node id
}

export const CURRICULUM_NODES: CurriculumNode[] = [
  // English — Explorer
  { id: 'eng-e-01', subject: 'english', title: 'Alphabet & Sounds', ageGroup: 'explorer', level: 1 },
  { id: 'eng-e-02', subject: 'english', title: 'Simple Words', ageGroup: 'explorer', level: 2, prerequisite: 'eng-e-01' },
  { id: 'eng-e-03', subject: 'english', title: 'Greetings & Phrases', ageGroup: 'explorer', level: 3, prerequisite: 'eng-e-02' },
  { id: 'eng-e-04', subject: 'english', title: 'Numbers & Counting', ageGroup: 'explorer', level: 4, prerequisite: 'eng-e-02' },
  { id: 'eng-e-05', subject: 'english', title: 'Colours & Shapes', ageGroup: 'explorer', level: 5, prerequisite: 'eng-e-03' },
  // English — Strategist
  { id: 'eng-s-01', subject: 'english', title: 'Sentence Structure', ageGroup: 'strategist', level: 1 },
  { id: 'eng-s-02', subject: 'english', title: 'Reading Comprehension', ageGroup: 'strategist', level: 2, prerequisite: 'eng-s-01' },
  { id: 'eng-s-03', subject: 'english', title: 'Essay Writing', ageGroup: 'strategist', level: 3, prerequisite: 'eng-s-02' },
  // Math — Explorer
  { id: 'math-e-01', subject: 'math', title: 'Counting 1–10', ageGroup: 'explorer', level: 1 },
  { id: 'math-e-02', subject: 'math', title: 'Addition', ageGroup: 'explorer', level: 2, prerequisite: 'math-e-01' },
  { id: 'math-e-03', subject: 'math', title: 'Subtraction', ageGroup: 'explorer', level: 3, prerequisite: 'math-e-02' },
  // Math — Strategist
  { id: 'math-s-01', subject: 'math', title: 'Multiplication', ageGroup: 'strategist', level: 1 },
  { id: 'math-s-02', subject: 'math', title: 'Division', ageGroup: 'strategist', level: 2, prerequisite: 'math-s-01' },
  { id: 'math-s-03', subject: 'math', title: 'Fractions', ageGroup: 'strategist', level: 3, prerequisite: 'math-s-02' },
  // Science — Explorer
  { id: 'sci-e-01', subject: 'science', title: 'Living Things', ageGroup: 'explorer', level: 1 },
  { id: 'sci-e-02', subject: 'science', title: 'Plants & Animals', ageGroup: 'explorer', level: 2, prerequisite: 'sci-e-01' },
  // Science — Strategist
  { id: 'sci-s-01', subject: 'science', title: 'Human Body', ageGroup: 'strategist', level: 1 },
  { id: 'sci-s-02', subject: 'science', title: 'Basic Chemistry', ageGroup: 'strategist', level: 2, prerequisite: 'sci-s-01' },
  // Social Studies — Explorer
  { id: 'soc-e-01', subject: 'social', title: 'My Family', ageGroup: 'explorer', level: 1 },
  { id: 'soc-e-02', subject: 'social', title: 'My Community', ageGroup: 'explorer', level: 2, prerequisite: 'soc-e-01' },
  // Social Studies — Strategist
  { id: 'soc-s-01', subject: 'social', title: 'Nigeria — States & Capital', ageGroup: 'strategist', level: 1 },
  { id: 'soc-s-02', subject: 'social', title: 'Nigerian History', ageGroup: 'strategist', level: 2, prerequisite: 'soc-s-01' },
];
