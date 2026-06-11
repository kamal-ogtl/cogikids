/**
 * Word bank — spelling words for the Spelling Bee, each with a definition and
 * translations in the supported Nigerian languages. pickWords samples a round's
 * words by age group; getNativeHint surfaces a translation hint.
 */
import type { AgeGroup } from './curriculum';
import type { SupportedLanguage } from './languages';

export interface BeeWord {
  word: string;
  definition: string;
  hausa: string;
  yoruba: string;
  igbo: string;
  english: string;
}

// Explorer words — ages 5-9, 3-5 letters, everyday objects
const EXPLORER_WORDS: BeeWord[] = [
  { word: 'cat',  definition: 'A small furry animal that says meow',         hausa: 'kyanwa',       yoruba: 'ologbo',   igbo: 'nkịta ọcha',   english: 'A small furry pet' },
  { word: 'dog',  definition: 'A friendly animal that barks',                 hausa: 'kare',         yoruba: 'aja',      igbo: 'nkịta',        english: 'A loyal pet that barks' },
  { word: 'sun',  definition: 'The bright star that gives us light and heat', hausa: 'rana',         yoruba: 'oorun',    igbo: 'anyanwụ',      english: 'The star that lights our sky' },
  { word: 'rain', definition: 'Water that falls from clouds in the sky',      hausa: 'ruwan sama',   yoruba: 'ojo',      igbo: 'ozuzo',        english: 'Water falling from clouds' },
  { word: 'fish', definition: 'An animal that lives and swims in water',      hausa: 'kifi',         yoruba: 'eja',      igbo: 'azụ',          english: 'A creature that swims in water' },
  { word: 'bird', definition: 'An animal with wings and feathers that flies', hausa: 'tsuntsu',      yoruba: 'eye',      igbo: 'nnụnụ',        english: 'A feathered animal that flies' },
  { word: 'book', definition: 'Pages filled with words and pictures',         hausa: 'littafi',      yoruba: 'iwe',      igbo: 'akwụkwọ',      english: 'Pages you read to learn' },
  { word: 'tree', definition: 'A tall plant with a trunk, branches and leaves', hausa: 'itace',      yoruba: 'igi',      igbo: 'osisi',        english: 'A tall plant that grows in the ground' },
  { word: 'fire', definition: 'Hot bright flames that give light and warmth', hausa: 'wuta',         yoruba: 'ina',      igbo: 'ọkụ',          english: 'Hot glowing flames' },
  { word: 'home', definition: 'The house or place where you live',            hausa: 'gida',         yoruba: 'ile',      igbo: 'ulo',          english: 'The place where you live' },
  { word: 'food', definition: 'What you eat to grow big and strong',          hausa: 'abinci',       yoruba: 'onje',     igbo: 'nri',          english: 'What you eat to stay healthy' },
  { word: 'play', definition: 'Having fun with friends or toys',              hausa: 'wasa',         yoruba: 'ere',      igbo: 'egwuregwu',    english: 'Having fun and games' },
  { word: 'milk', definition: 'A white drink that makes your bones strong',   hausa: 'madara',       yoruba: 'wara',     igbo: 'mmiri ara',    english: 'A white drink from cows' },
  { word: 'hand', definition: 'The part of your body at the end of your arm', hausa: 'hannu',        yoruba: 'owo',      igbo: 'aka',          english: 'The part at the end of your arm' },
  { word: 'sand', definition: 'Tiny grains of rock found on beaches',         hausa: 'yashi',        yoruba: 'iyanrin',  igbo: 'ọtịtị',       english: 'Fine grains found at the beach' },
];

// Strategist words — ages 10-15, 5-7 letters, school vocabulary
const STRATEGIST_WORDS: BeeWord[] = [
  { word: 'school',  definition: 'A place where children go to learn',           hausa: 'makaranta',  yoruba: 'ile-iwe',  igbo: 'ulo akwukwo',  english: 'A place to study and learn' },
  { word: 'friend',  definition: 'A person you like, trust, and care about',     hausa: 'aboki',      yoruba: 'ore',      igbo: 'enyi',         english: 'Someone you like and trust' },
  { word: 'market',  definition: 'A place where people buy and sell goods',      hausa: 'kasuwa',     yoruba: 'oja',      igbo: 'ahia',         english: 'Where you buy and sell things' },
  { word: 'bridge',  definition: 'A structure built to cross over a river',      hausa: 'gada',       yoruba: 'afara',    igbo: 'ọwa',          english: 'A path built over water' },
  { word: 'farmer',  definition: 'A person who grows crops on a farm',           hausa: 'manomi',     yoruba: 'agbe',     igbo: 'onye ọrụ ugbo', english: 'A person who grows food on a farm' },
  { word: 'planet',  definition: 'A huge round ball that orbits a star',         hausa: 'duniya',     yoruba: 'aye',      igbo: 'ụwa',          english: 'A large body that orbits a star' },
  { word: 'forest',  definition: 'A large area of land covered with many trees', hausa: 'kurmi',      yoruba: 'igbo',     igbo: 'ọhịa',        english: 'A large area full of trees' },
  { word: 'energy',  definition: 'The power needed to do work or move',          hausa: 'karfi',      yoruba: 'agbara',   igbo: 'ike',          english: 'The power to do work' },
  { word: 'garden',  definition: 'A piece of land where plants are grown',       hausa: 'lambu',      yoruba: 'ogba',     igbo: 'ogige',        english: 'Land where plants are grown' },
  { word: 'health',  definition: 'The state of being well and strong',           hausa: 'lafiya',     yoruba: 'ilera',    igbo: 'ahụike',       english: 'The state of being well' },
  { word: 'animal',  definition: 'Any living creature that can move and breathe', hausa: 'dabba',     yoruba: 'eranko',   igbo: 'anụmanụ',      english: 'A living creature that moves' },
  { word: 'nation',  definition: 'A country and its people',                     hausa: 'kasa',       yoruba: 'orilẹ-ede', igbo: 'mba',         english: 'A country and its people' },
  { word: 'talent',  definition: 'A natural ability to do something well',       hausa: 'hazaka',     yoruba: 'talenti',  igbo: 'nkà',          english: 'A natural skill or ability' },
  { word: 'simple',  definition: 'Easy to understand or do',                     hausa: 'mai sauqi',  yoruba: 'rọrun',    igbo: 'dị mfe',       english: 'Easy to do or understand' },
  { word: 'honest',  definition: 'Always telling the truth',                     hausa: 'amintacce',  yoruba: 'olooto',   igbo: 'onye eziokwu', english: 'Always truthful and sincere' },
];

export function getWordBank(ageGroup: AgeGroup): BeeWord[] {
  return ageGroup === 'strategist' ? STRATEGIST_WORDS : EXPLORER_WORDS;
}

export function getNativeHint(word: BeeWord, language: SupportedLanguage): string {
  return word[language] ?? word.english;
}

/** Pick `count` random non-repeating words from the bank */
export function pickWords(ageGroup: AgeGroup, count: number): BeeWord[] {
  const bank = getWordBank(ageGroup);
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
