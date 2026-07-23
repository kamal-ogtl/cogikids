// Lesson content for every curriculum node.
// Each lesson has intro text, 2–3 content slides, and 3 quiz questions.

export interface LessonSlide {
  emoji: string;
  heading: string;
  body: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number; // index into options
}

export interface LessonContent {
  nodeId: string;
  tagline: string;    // one-line hook shown on the intro screen
  slides: LessonSlide[];
  quiz: QuizQuestion[];
}

const LESSONS: LessonContent[] = [

  // ── English Explorer ──────────────────────────────────────────────────────

  {
    nodeId: 'eng-e-01',
    tagline: 'Every word starts with a letter!',
    slides: [
      {
        emoji: '🔤',
        heading: 'The Alphabet',
        body: 'English has 26 letters: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z.\nThe first 5 are vowels: A, E, I, O, U. All others are consonants.',
      },
      {
        emoji: '🔊',
        heading: 'Letter Sounds',
        body: '"A" sounds like "ah" as in Apple.\n"B" sounds like "buh" as in Ball.\n"C" sounds like "kuh" as in Cat.\nEvery letter has its own special sound!',
      },
      {
        emoji: '✍️',
        heading: 'Upper & Lower Case',
        body: 'Each letter has two forms.\nUPPERCASE: A B C D E …\nlowercase: a b c d e …\nWe use uppercase at the start of names and sentences.',
      },
    ],
    quiz: [
      { question: 'How many letters are in the English alphabet?', options: ['24', '25', '26', '28'], correct: 2 },
      { question: 'Which of these is a vowel?', options: ['B', 'C', 'E', 'G'], correct: 2 },
      { question: '"Apple" starts with which letter?', options: ['B', 'A', 'E', 'P'], correct: 1 },
    ],
  },

  {
    nodeId: 'eng-e-02',
    tagline: 'Build your first word bank!',
    slides: [
      {
        emoji: '🐱',
        heading: 'Everyday Words',
        body: 'Simple words describe things around us.\nExamples: cat, dog, sun, ball, tree, book, home, food.',
      },
      {
        emoji: '🧩',
        heading: 'Short & Long Words',
        body: 'Short words have 3–4 letters: cat, run, big.\nLong words have more: elephant, butterfly.\nStart with short words — they are easier to spell!',
      },
      {
        emoji: '💡',
        heading: 'Tip: Say It Out Loud',
        body: 'When you see a new word, say it out loud.\nBreak it into sounds: c-a-t, d-o-g.\nThis helps you remember how to spell it.',
      },
    ],
    quiz: [
      { question: 'Which is a simple 3-letter word?', options: ['Elephant', 'Cat', 'School', 'Butterfly'], correct: 1 },
      { question: 'How many letters does "ball" have?', options: ['3', '4', '5', '6'], correct: 1 },
      { question: 'Which word describes an animal?', options: ['Run', 'Big', 'Dog', 'Blue'], correct: 2 },
    ],
  },

  {
    nodeId: 'eng-e-03',
    tagline: 'Say hello in English!',
    slides: [
      {
        emoji: '👋',
        heading: 'Common Greetings',
        body: 'Hello / Hi — to say hi to someone.\nGood morning — before noon.\nGood afternoon — after noon.\nGood evening — in the evening.\nGoodbye / Bye — when leaving.',
      },
      {
        emoji: '🗣️',
        heading: 'Useful Phrases',
        body: 'Please — to ask politely.\nThank you — to show gratitude.\nSorry — to apologise.\nExcuse me — to get attention.\nYes / No — to answer questions.',
      },
      {
        emoji: '🤝',
        heading: 'Introducing Yourself',
        body: 'My name is [name].\nI am [age] years old.\nI am from Nigeria.\nNice to meet you!',
      },
    ],
    quiz: [
      { question: 'What do you say when you leave?', options: ['Hello', 'Please', 'Goodbye', 'Sorry'], correct: 2 },
      { question: 'Which phrase shows gratitude?', options: ['Excuse me', 'Thank you', 'Yes', 'No'], correct: 1 },
      { question: '"Good morning" is said before:', options: ['Noon', 'Evening', 'Midnight', 'Sunset'], correct: 0 },
    ],
  },

  {
    nodeId: 'eng-e-04',
    tagline: 'Count and name numbers in English!',
    slides: [
      {
        emoji: '🔢',
        heading: 'Numbers 1–10',
        body: '1 = One, 2 = Two, 3 = Three, 4 = Four, 5 = Five,\n6 = Six, 7 = Seven, 8 = Eight, 9 = Nine, 10 = Ten.',
      },
      {
        emoji: '📏',
        heading: 'Numbers 11–20',
        body: '11 = Eleven, 12 = Twelve, 13 = Thirteen,\n14 = Fourteen, 15 = Fifteen, 16 = Sixteen,\n17 = Seventeen, 18 = Eighteen, 19 = Nineteen, 20 = Twenty.',
      },
      {
        emoji: '💯',
        heading: 'Big Round Numbers',
        body: '30 = Thirty, 40 = Forty, 50 = Fifty,\n60 = Sixty, 70 = Seventy, 80 = Eighty,\n90 = Ninety, 100 = One Hundred.',
      },
    ],
    quiz: [
      { question: 'How do you write 7 in words?', options: ['Six', 'Eight', 'Seven', 'Nine'], correct: 2 },
      { question: 'What number comes after Twelve?', options: ['Eleven', 'Fourteen', 'Thirteen', 'Fifteen'], correct: 2 },
      { question: '50 in words is:', options: ['Fifteen', 'Forty', 'Sixty', 'Fifty'], correct: 3 },
    ],
  },

  {
    nodeId: 'eng-e-05',
    tagline: 'Name the colours and shapes around you!',
    slides: [
      {
        emoji: '🌈',
        heading: 'Colours',
        body: 'Red 🔴, Blue 🔵, Yellow 🟡, Green 🟢,\nOrange 🟠, Purple 🟣, Black ⚫, White ⚪,\nBrown 🟤, Pink (light red).',
      },
      {
        emoji: '🔺',
        heading: 'Basic Shapes',
        body: 'Circle — round with no corners.\nSquare — 4 equal sides.\nRectangle — 2 long + 2 short sides.\nTriangle — 3 sides.\nStar — pointy shape with 5 points.',
      },
      {
        emoji: '👀',
        heading: 'Colours + Shapes Together',
        body: 'We can combine them:\n"A red circle", "a blue triangle".\nLook around — what colour and shape is your book? Your door?',
      },
    ],
    quiz: [
      { question: 'Which colour is the sky on a sunny day?', options: ['Red', 'Blue', 'Green', 'Yellow'], correct: 1 },
      { question: 'How many sides does a triangle have?', options: ['2', '3', '4', '5'], correct: 1 },
      { question: 'A square has:', options: ['3 equal sides', '4 equal sides', '5 sides', '0 sides'], correct: 1 },
    ],
  },

  // ── English Strategist ────────────────────────────────────────────────────

  {
    nodeId: 'eng-s-01',
    tagline: 'Put words together the right way!',
    slides: [
      {
        emoji: '📐',
        heading: 'Parts of a Sentence',
        body: 'Every sentence has a Subject (who/what) and a Predicate (what they do).\nExample: "The boy runs." — Subject: The boy. Predicate: runs.',
      },
      {
        emoji: '🔍',
        heading: 'Types of Sentences',
        body: 'Statement: "She reads books."\nQuestion: "Does she read books?"\nCommand: "Read the book!"\nExclamation: "What a great book!"',
      },
      {
        emoji: '✅',
        heading: 'Punctuation',
        body: 'Every sentence starts with a Capital letter.\nStatements end with a full stop (.).\nQuestions end with a question mark (?).\nExclamations end with an exclamation mark (!).',
      },
    ],
    quiz: [
      { question: 'In "The cat sleeps.", what is the subject?', options: ['sleeps', 'The cat', 'a', 'the'], correct: 1 },
      { question: 'Which punctuation ends a question?', options: ['.', '!', '?', ','], correct: 2 },
      { question: 'A sentence must start with a:', options: ['full stop', 'lowercase letter', 'capital letter', 'comma'], correct: 2 },
    ],
  },

  {
    nodeId: 'eng-s-02',
    tagline: 'Understand what you read!',
    slides: [
      {
        emoji: '📖',
        heading: 'What is Comprehension?',
        body: 'Reading comprehension means understanding what a text is about.\nYou should be able to say: Who is it about? What happened? Where? When? Why?',
      },
      {
        emoji: '🗺️',
        heading: 'Finding the Main Idea',
        body: 'Every passage has a main idea — the most important point.\nTip: Read the first and last sentence of each paragraph.\nAsk: "What is this mostly about?"',
      },
      {
        emoji: '❓',
        heading: 'Answering Questions',
        body: 'Literal questions: the answer is directly in the text.\nInferential questions: you must think beyond the text.\nAlways go back and reread before answering.',
      },
    ],
    quiz: [
      { question: 'What does "comprehension" mean?', options: ['Writing fast', 'Understanding a text', 'Drawing pictures', 'Counting words'], correct: 1 },
      { question: 'Where do you often find the main idea?', options: ['Middle of text', 'In pictures', 'First/last sentence', 'In the title only'], correct: 2 },
      { question: 'An inferential question requires you to:', options: ['Copy text word for word', 'Think beyond the text', 'Only look at pictures', 'Guess randomly'], correct: 1 },
    ],
  },

  {
    nodeId: 'eng-s-03',
    tagline: 'Express your ideas in writing!',
    slides: [
      {
        emoji: '📝',
        heading: 'Essay Structure',
        body: 'An essay has 3 parts:\n1. Introduction — state your topic and main point.\n2. Body — 2–3 paragraphs with details and examples.\n3. Conclusion — summarise and restate your main point.',
      },
      {
        emoji: '🧠',
        heading: 'Planning Your Essay',
        body: 'Before writing, plan:\n• What is my topic?\n• What are my 3 main points?\n• What examples support each point?\nA plan makes writing faster and clearer.',
      },
      {
        emoji: '✨',
        heading: 'Good Writing Tips',
        body: 'Use varied sentence lengths.\nAvoid repeating the same words.\nUse connectives: however, therefore, in addition.\nAlways proofread — check spelling and grammar.',
      },
    ],
    quiz: [
      { question: 'How many main parts does an essay have?', options: ['1', '2', '3', '4'], correct: 2 },
      { question: 'What goes in the Introduction?', options: ['Conclusion only', 'All your examples', 'Topic and main point', 'Random facts'], correct: 2 },
      { question: 'Which word is a connective?', options: ['Cat', 'Run', 'Therefore', 'Blue'], correct: 2 },
    ],
  },

  // ── Math Explorer ─────────────────────────────────────────────────────────

  {
    nodeId: 'math-e-01',
    tagline: 'Learn to count 1 to 10!',
    slides: [
      {
        emoji: '🔢',
        heading: 'Numbers 1 to 10',
        body: '1 = One ⚽\n2 = Two ⚽⚽\n3 = Three ⚽⚽⚽\n4 = Four\n5 = Five\n6 = Six\n7 = Seven\n8 = Eight\n9 = Nine\n10 = Ten',
      },
      {
        emoji: '📈',
        heading: 'Counting Order',
        body: 'Numbers go in order: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10.\nCounting forward: go up by 1 each time.\nCounting backward: 10, 9, 8, 7, 6, 5, 4, 3, 2, 1.',
      },
      {
        emoji: '🖐️',
        heading: 'Count with Your Fingers',
        body: 'You have 10 fingers — perfect for counting!\nPractice: hold up 3 fingers → say "Three".\nThen 7 fingers → say "Seven".\nCount objects around you!',
      },
    ],
    quiz: [
      { question: 'What number comes after 5?', options: ['4', '6', '7', '3'], correct: 1 },
      { question: 'How many fingers do you have?', options: ['8', '9', '10', '12'], correct: 2 },
      { question: 'Count backwards: after 8 comes?', options: ['9', '10', '7', '6'], correct: 2 },
    ],
  },

  {
    nodeId: 'math-e-02',
    tagline: 'Add numbers together!',
    slides: [
      {
        emoji: '➕',
        heading: 'What is Addition?',
        body: 'Addition means putting numbers together to get a bigger number.\nWe use the + sign.\nExample: 3 + 2 = 5\nRead as: "Three plus two equals five."',
      },
      {
        emoji: '🍎',
        heading: 'Adding with Objects',
        body: 'Imagine 2 apples on a table. Add 3 more.\n2 + 3 = 5 apples total.\nYou can use fingers, counters, or draw dots to help you add.',
      },
      {
        emoji: '💡',
        heading: 'Tips for Adding',
        body: 'Always start with the bigger number.\n5 + 2 = 7 (count on 2 from 5: 6, 7).\nDoubles are easy: 3 + 3 = 6, 4 + 4 = 8.\nPractice makes addition fast!',
      },
    ],
    quiz: [
      { question: '4 + 3 = ?', options: ['6', '7', '8', '5'], correct: 1 },
      { question: '2 + 2 = ?', options: ['3', '5', '4', '6'], correct: 2 },
      { question: 'What sign do we use for addition?', options: ['-', '×', '÷', '+'], correct: 3 },
    ],
  },

  {
    nodeId: 'math-e-03',
    tagline: 'Take numbers away!',
    slides: [
      {
        emoji: '➖',
        heading: 'What is Subtraction?',
        body: 'Subtraction means taking a number away from another.\nWe use the − sign.\nExample: 7 − 3 = 4\nRead as: "Seven minus three equals four."',
      },
      {
        emoji: '🍌',
        heading: 'Subtracting with Objects',
        body: 'You have 6 bananas. You eat 2.\n6 − 2 = 4 bananas left.\nCount backward to subtract:\n6 … 5 … 4 ← stop after 2 steps.',
      },
      {
        emoji: '🔄',
        heading: 'Addition & Subtraction Link',
        body: 'They are opposites!\n3 + 4 = 7  →  7 − 4 = 3\nKnowing your addition helps with subtraction.\nIf 5 + 2 = 7, then 7 − 2 = 5.',
      },
    ],
    quiz: [
      { question: '8 − 3 = ?', options: ['4', '5', '6', '3'], correct: 1 },
      { question: 'What sign is used for subtraction?', options: ['+', '−', '×', '='], correct: 1 },
      { question: 'If 5 + 3 = 8, then 8 − 3 = ?', options: ['4', '6', '5', '3'], correct: 2 },
    ],
  },

  // ── Math Strategist ───────────────────────────────────────────────────────

  {
    nodeId: 'math-s-01',
    tagline: 'Multiply to get answers fast!',
    slides: [
      {
        emoji: '✖️',
        heading: 'What is Multiplication?',
        body: 'Multiplication is repeated addition.\n3 × 4 means: 3 added 4 times = 3+3+3+3 = 12.\nWe use × or *.\nThe result is called the product.',
      },
      {
        emoji: '📊',
        heading: 'Times Tables',
        body: 'The 2 times table: 2, 4, 6, 8, 10 …\nThe 5 times table: 5, 10, 15, 20, 25 …\nThe 10 times table: 10, 20, 30, 40 …\nLearning tables makes multiplication quick!',
      },
      {
        emoji: '💡',
        heading: 'Multiplication Tips',
        body: 'Any number × 1 = itself. (5 × 1 = 5)\nAny number × 0 = 0. (9 × 0 = 0)\nOrder doesn\'t matter: 3 × 4 = 4 × 3 = 12.',
      },
    ],
    quiz: [
      { question: '5 × 3 = ?', options: ['10', '15', '12', '8'], correct: 1 },
      { question: 'What is 7 × 0?', options: ['7', '1', '0', '70'], correct: 2 },
      { question: '4 × 4 = ?', options: ['8', '12', '16', '20'], correct: 2 },
    ],
  },

  {
    nodeId: 'math-s-02',
    tagline: 'Split numbers equally!',
    slides: [
      {
        emoji: '➗',
        heading: 'What is Division?',
        body: 'Division splits a number into equal groups.\n12 ÷ 3 = 4 (12 split into 3 groups → 4 in each group).\nThe result is called the quotient.',
      },
      {
        emoji: '🍕',
        heading: 'Division with Examples',
        body: 'Share 10 sweets equally among 2 friends.\n10 ÷ 2 = 5 sweets each.\nShare 15 pencils in 3 groups.\n15 ÷ 3 = 5 pencils per group.',
      },
      {
        emoji: '🔗',
        heading: 'Division & Multiplication Link',
        body: 'They are opposites!\n4 × 3 = 12  →  12 ÷ 3 = 4\nKnowing multiplication makes division easier.\nIf 6 × 2 = 12, then 12 ÷ 2 = 6.',
      },
    ],
    quiz: [
      { question: '20 ÷ 4 = ?', options: ['4', '5', '6', '8'], correct: 1 },
      { question: '15 ÷ 3 = ?', options: ['4', '6', '5', '3'], correct: 2 },
      { question: 'If 5 × 4 = 20, then 20 ÷ 4 = ?', options: ['4', '5', '6', '8'], correct: 1 },
    ],
  },

  {
    nodeId: 'math-s-03',
    tagline: 'Work with parts of a whole!',
    slides: [
      {
        emoji: '🍕',
        heading: 'What is a Fraction?',
        body: 'A fraction shows part of a whole.\n1/2 means 1 out of 2 equal parts (one half).\n1/4 means 1 out of 4 equal parts (one quarter).\nTop number = numerator. Bottom = denominator.',
      },
      {
        emoji: '📊',
        heading: 'Comparing Fractions',
        body: '1/2 is bigger than 1/4.\n(Bigger denominator = smaller piece)\n2/4 = 1/2 (they are equal — called equivalent fractions).\nAlways compare fractions with the same denominator.',
      },
      {
        emoji: '➕',
        heading: 'Adding Simple Fractions',
        body: 'If denominators are the same, just add numerators:\n1/4 + 2/4 = 3/4.\nIf denominators differ, find a common denominator first.\n1/2 + 1/4: convert 1/2 to 2/4, then 2/4 + 1/4 = 3/4.',
      },
    ],
    quiz: [
      { question: 'What does the denominator tell you?', options: ['Parts taken', 'Total equal parts', 'The whole number', 'Nothing'], correct: 1 },
      { question: '1/2 + 1/2 = ?', options: ['1/4', '2/4', '1', '2'], correct: 2 },
      { question: 'Which is bigger: 1/2 or 1/4?', options: ['1/4', '1/2', 'They are equal', 'Cannot tell'], correct: 1 },
    ],
  },

  // ── Science Explorer ──────────────────────────────────────────────────────

  {
    nodeId: 'sci-e-01',
    tagline: 'What makes something alive?',
    slides: [
      {
        emoji: '🌱',
        heading: 'Living Things',
        body: 'Living things can grow, breathe, eat, move, and reproduce.\nExamples: people, animals, plants, bacteria.\nNon-living things cannot do these: rock, chair, water.',
      },
      {
        emoji: '🫀',
        heading: 'Needs of Living Things',
        body: 'All living things need:\n• Food and water (for energy)\n• Air (for breathing)\n• Space (to grow and move)\n• The right temperature',
      },
      {
        emoji: '🔬',
        heading: 'Grouping Living Things',
        body: 'Scientists group living things:\nAnimals — move and eat other things.\nPlants — make their own food from sunlight.\nFungi — like mushrooms, break down dead things.\nMicro-organisms — too small to see without a microscope.',
      },
    ],
    quiz: [
      { question: 'Which of these is a living thing?', options: ['Rock', 'Water', 'Tree', 'Chair'], correct: 2 },
      { question: 'What do ALL living things need?', options: ['Sunlight only', 'Food, water and air', 'Just water', 'Just food'], correct: 1 },
      { question: 'Plants make their food from:', options: ['Soil only', 'Other animals', 'Sunlight', 'Water only'], correct: 2 },
    ],
  },

  {
    nodeId: 'sci-e-02',
    tagline: 'Explore plants and animals!',
    slides: [
      {
        emoji: '🌿',
        heading: 'Parts of a Plant',
        body: 'Root — absorbs water from soil.\nStem — supports the plant and carries water.\nLeaf — makes food using sunlight (photosynthesis).\nFlower — for reproduction.\nFruit/Seed — grows into a new plant.',
      },
      {
        emoji: '🦁',
        heading: 'Types of Animals',
        body: 'Mammals — have fur, feed young with milk. (dog, human)\nBirds — have feathers and wings. (eagle, parrot)\nReptiles — scaly skin. (lizard, snake)\nFish — live in water, have gills. (tilapia, catfish)\nInsects — 6 legs. (bee, ant)',
      },
      {
        emoji: '🌍',
        heading: 'Habitats',
        body: 'A habitat is where a living thing naturally lives.\nForest — trees, shade, rain.\nSavanna — grass, warm, dry.\nOcean — saltwater, fish.\nDesert — hot, dry, little water.\nAnimals are adapted to their habitat.',
      },
    ],
    quiz: [
      { question: 'Which part of a plant absorbs water from soil?', options: ['Leaf', 'Stem', 'Root', 'Flower'], correct: 2 },
      { question: 'How many legs does an insect have?', options: ['4', '6', '8', '10'], correct: 1 },
      { question: 'Where does a fish live?', options: ['Desert', 'Forest', 'Water', 'Sky'], correct: 2 },
    ],
  },

  // ── Science Strategist ────────────────────────────────────────────────────

  {
    nodeId: 'sci-s-01',
    tagline: 'Learn about the amazing human body!',
    slides: [
      {
        emoji: '🫀',
        heading: 'Major Body Systems',
        body: 'Skeletal — bones that give us shape and protection.\nMuscular — muscles that help us move.\nDigestive — breaks down food for energy.\nCirculatory — heart pumps blood around the body.\nRespiratory — lungs bring in oxygen.',
      },
      {
        emoji: '🧠',
        heading: 'The Nervous System',
        body: 'The brain is the control centre of the body.\nNerves carry messages between brain and body.\nThe spinal cord connects brain to the rest.\nSenses (sight, hearing, touch, smell, taste) send info to the brain.',
      },
      {
        emoji: '🏃',
        heading: 'Keeping the Body Healthy',
        body: 'Eat a balanced diet (carbs, protein, vitamins, minerals).\nExercise regularly — strengthens muscles and heart.\nSleep well — brain and body repair during sleep.\nDrink enough water — 6–8 glasses a day.',
      },
    ],
    quiz: [
      { question: 'Which organ pumps blood around the body?', options: ['Lungs', 'Brain', 'Heart', 'Stomach'], correct: 2 },
      { question: 'What does the skeletal system consist of?', options: ['Muscles', 'Bones', 'Nerves', 'Blood'], correct: 1 },
      { question: 'Which system digests food?', options: ['Circulatory', 'Respiratory', 'Digestive', 'Nervous'], correct: 2 },
    ],
  },

  {
    nodeId: 'sci-s-02',
    tagline: 'Discover matter and reactions!',
    slides: [
      {
        emoji: '⚗️',
        heading: 'States of Matter',
        body: 'Everything is made of matter.\nSolid — fixed shape & volume (rock, ice).\nLiquid — fixed volume, no fixed shape (water, juice).\nGas — no fixed shape or volume (air, steam).\nHeat can change states: ice → water → steam.',
      },
      {
        emoji: '🔬',
        heading: 'Atoms & Molecules',
        body: 'Atoms are the tiny building blocks of all matter.\nMolecules are groups of atoms joined together.\nH₂O (water) = 2 hydrogen + 1 oxygen atom.\nEverything you see is made of atoms!',
      },
      {
        emoji: '⚡',
        heading: 'Chemical & Physical Changes',
        body: 'Physical change: shape or state changes, but substance stays same.\n(Cutting paper, melting ice)\nChemical change: a NEW substance is formed.\n(Burning wood, rusting iron, cooking food)',
      },
    ],
    quiz: [
      { question: 'Water is in which state of matter?', options: ['Solid', 'Liquid', 'Gas', 'Plasma'], correct: 1 },
      { question: 'What are the building blocks of all matter?', options: ['Cells', 'Atoms', 'Molecules', 'Protons'], correct: 1 },
      { question: 'Burning wood is an example of:', options: ['Physical change', 'No change', 'Chemical change', 'State change'], correct: 2 },
    ],
  },

  // ── Social Studies Explorer ───────────────────────────────────────────────

  {
    nodeId: 'soc-e-01',
    tagline: 'Learn about your family!',
    slides: [
      {
        emoji: '👨‍👩‍👧‍👦',
        heading: 'Family Members',
        body: 'Nuclear family: father, mother, children.\nExtended family includes: grandparents, aunts, uncles, cousins.\nIn Nigeria, extended family is very important — we care for one another.',
      },
      {
        emoji: '💛',
        heading: 'Roles in the Family',
        body: 'Parents provide food, shelter, and love.\nChildren learn, go to school, and help at home.\nGrandparents share wisdom and stories.\nEveryone in the family has a role to play.',
      },
      {
        emoji: '🏠',
        heading: 'Family Values',
        body: 'Respect — treat everyone with kindness.\nCooperation — help each other.\nCommunication — talk about your feelings.\nIn Nigerian culture, greeting elders is very important.',
      },
    ],
    quiz: [
      { question: 'Who is in a nuclear family?', options: ['Only father', 'Father, mother & children', 'Only grandparents', 'Only cousins'], correct: 1 },
      { question: 'What do parents provide for children?', options: ['Nothing', 'Food, shelter and love', 'Only money', 'Only clothes'], correct: 1 },
      { question: 'In Nigerian culture, greeting elders shows:', options: ['Fear', 'Disrespect', 'Respect', 'Nothing'], correct: 2 },
    ],
  },

  {
    nodeId: 'soc-e-02',
    tagline: 'Explore your neighbourhood!',
    slides: [
      {
        emoji: '🏘️',
        heading: 'What is a Community?',
        body: 'A community is a group of people living in the same area.\nPeople in a community share resources and help each other.\nExamples: your village, town, or city neighbourhood.',
      },
      {
        emoji: '🏫',
        heading: 'Community Helpers',
        body: 'Teachers — educate children.\nDoctors/Nurses — keep us healthy.\nPolice — protect us.\nFarmers — grow our food.\nTraders — sell goods in the market.\nEvery job is important!',
      },
      {
        emoji: '🌿',
        heading: 'Keeping Our Community Clean',
        body: 'Don\'t litter — use dustbins.\nPlant trees for shade and clean air.\nJoin community clean-up days.\nA clean community is a healthy community.',
      },
    ],
    quiz: [
      { question: 'What is a community?', options: ['A school only', 'People living in the same area', 'Just your family', 'A single house'], correct: 1 },
      { question: 'Who grows our food?', options: ['Police', 'Teachers', 'Doctors', 'Farmers'], correct: 3 },
      { question: 'How do we keep our community clean?', options: ['Litter everywhere', 'Use dustbins', 'Burn rubbish in streets', 'Ignore waste'], correct: 1 },
    ],
  },

  // ── Social Studies Strategist ─────────────────────────────────────────────

  {
    nodeId: 'soc-s-01',
    tagline: 'Know your country!',
    slides: [
      {
        emoji: '🇳🇬',
        heading: 'Nigeria — Key Facts',
        body: 'Capital city: Abuja (FCT).\nLargest city: Lagos.\nNigeria has 36 states + FCT.\nNational language: English.\nCurrency: Naira (₦).',
      },
      {
        emoji: '🗺️',
        heading: 'Geopolitical Zones',
        body: 'Nigeria is divided into 6 zones:\n1. North West (Kano, Sokoto…)\n2. North East (Borno, Yobe…)\n3. North Central (FCT, Benue…)\n4. South West (Lagos, Oyo…)\n5. South East (Anambra, Imo…)\n6. South South (Rivers, Delta…)',
      },
      {
        emoji: '🏛️',
        heading: 'Government',
        body: 'Nigeria is a Federal Republic.\nThree arms of government:\n• Executive — President & cabinet.\n• Legislature — Senate + House of Reps.\n• Judiciary — Courts & judges.\nEach state has a Governor.',
      },
    ],
    quiz: [
      { question: 'What is Nigeria\'s capital city?', options: ['Lagos', 'Kano', 'Abuja', 'Ibadan'], correct: 2 },
      { question: 'How many states does Nigeria have?', options: ['30', '36', '40', '24'], correct: 1 },
      { question: 'What is Nigeria\'s currency?', options: ['Cedi', 'Dollar', 'Naira', 'Franc'], correct: 2 },
    ],
  },

  {
    nodeId: 'soc-s-02',
    tagline: 'Discover Nigeria\'s story!',
    slides: [
      {
        emoji: '📜',
        heading: 'Pre-Colonial Nigeria',
        body: 'Before British rule, powerful kingdoms existed:\n• Kanem-Borno Empire (north)\n• Oyo Empire (Yoruba, south-west)\n• Benin Kingdom (Edo, south)\n• Igbo city-states (south-east)\nThese had trade, art, and government.',
      },
      {
        emoji: '⛓️',
        heading: 'Colonial Period',
        body: 'Britain colonised Nigeria in the 1800s–1900s.\n1914: Northern and Southern Nigeria were amalgamated by Lord Lugard.\nNigerians formed political parties and fought for independence.',
      },
      {
        emoji: '🎉',
        heading: 'Independence & Beyond',
        body: 'Nigeria gained independence on 1 October 1960.\nFirst Prime Minister: Tafawa Balewa.\nFirst President: Nnamdi Azikiwe.\n1963: Nigeria became a Republic.\nOctober 1st is celebrated as Independence Day.',
      },
    ],
    quiz: [
      { question: 'When did Nigeria gain independence?', options: ['1 Oct 1960', '1 Jan 1963', '1 Oct 1914', '1 Jan 1960'], correct: 0 },
      { question: 'Who was Nigeria\'s first Prime Minister?', options: ['Nnamdi Azikiwe', 'Yakubu Gowon', 'Tafawa Balewa', 'Obafemi Awolowo'], correct: 2 },
      { question: 'Nigeria was amalgamated in:', options: ['1960', '1914', '1800', '1963'], correct: 1 },
    ],
  },
];

const LESSON_MAP: Record<string, LessonContent> = {};
for (const l of LESSONS) {
  LESSON_MAP[l.nodeId] = l;
}

export function getLessonContent(nodeId: string): LessonContent | null {
  return LESSON_MAP[nodeId] ?? null;
}
