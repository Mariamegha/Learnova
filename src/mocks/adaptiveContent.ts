// Mock data for Adaptive Content Generator (Phase 17)

export type ContentStyle = 'reels' | 'meme' | 'character' | 'notes' | 'exam';
export type DifficultyLevel = 'elementary' | 'middle' | 'high' | 'college' | 'graduate';
export type ToneType = 'casual' | 'academic' | 'humorous' | 'eli5' | 'professional';

export interface ContentGeneratorInput {
  topic: string;
  style: ContentStyle;
  difficulty: DifficultyLevel;
  tone: ToneType;
  targetAge?: number;
}

export interface ReelsContent {
  style: 'reels';
  title: string;
  hook: string;
  segments: Array<{
    timestamp: string;
    text: string;
    visual: string;
  }>;
  cta: string;
  duration: string;
}

export interface MemeContent {
  style: 'meme';
  topText: string;
  bottomText: string;
  template: string;
  context: string;
}

export interface CharacterContent {
  style: 'character';
  characters: string[];
  dialogue: Array<{
    speaker: string;
    text: string;
    emotion?: string;
  }>;
  setting: string;
}

export interface NotesContent {
  style: 'notes';
  title: string;
  keyPoints: string[];
  formulas?: string[];
  examples?: string[];
  summary: string;
}

export interface ExamContent {
  style: 'exam';
  title: string;
  questions: Array<{
    question: string;
    answer: string;
    difficulty: string;
  }>;
  keyFormulas: string[];
  studyTips: string[];
}

export type GeneratedContent = ReelsContent | MemeContent | CharacterContent | NotesContent | ExamContent;

// Mock generated content examples
export const MOCK_REELS_CONTENT: ReelsContent = {
  style: 'reels',
  title: 'Photosynthesis in 60 Seconds! 🌱',
  hook: '🤯 Plants are basically solar-powered food factories!',
  segments: [
    {
      timestamp: '0:00-0:15',
      text: 'Plants capture sunlight with chlorophyll (the green stuff)',
      visual: '☀️ → 🍃',
    },
    {
      timestamp: '0:15-0:30',
      text: 'They grab CO₂ from air + H₂O from roots',
      visual: '💨 + 💧',
    },
    {
      timestamp: '0:30-0:45',
      text: 'Mix it all together → GLUCOSE (plant food!) + O₂',
      visual: '🍬 + 🌬️',
    },
    {
      timestamp: '0:45-1:00',
      text: 'Formula: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂',
      visual: '🧪',
    },
  ],
  cta: 'Save this for your bio exam! 📚',
  duration: '60 seconds',
};

export const MOCK_MEME_CONTENT: MemeContent = {
  style: 'meme',
  topText: 'MITOCHONDRIA:',
  bottomText: 'THE POWERHOUSE OF THE CELL',
  template: 'Drake Pointing',
  context: 'Every biology student knows this one meme. The mitochondria really IS the powerhouse - it makes ATP (energy currency) through cellular respiration!',
};

export const MOCK_CHARACTER_CONTENT: CharacterContent = {
  style: 'character',
  characters: ['Stewie Griffin', 'Peter Griffin'],
  dialogue: [
    {
      speaker: 'Stewie',
      text: 'Peter, do you have ANY idea what quantum entanglement is?',
      emotion: 'condescending',
    },
    {
      speaker: 'Peter',
      text: 'Uhh... is it like when you get tangled in Christmas lights?',
      emotion: 'confused',
    },
    {
      speaker: 'Stewie',
      text: '*sighs* No, you simpleton. When two particles are entangled, measuring one INSTANTLY affects the other - even across the universe!',
      emotion: 'explaining',
    },
    {
      speaker: 'Peter',
      text: 'Ohhh, like how when Lois is mad at me, she\'s also mad at Brian?',
      emotion: 'realization',
    },
    {
      speaker: 'Stewie',
      text: 'That\'s... actually not a terrible analogy. Spooky action at a distance!',
      emotion: 'impressed',
    },
  ],
  setting: 'Griffin Living Room',
};

export const MOCK_NOTES_CONTENT: NotesContent = {
  style: 'notes',
  title: 'Pythagorean Theorem - Quick Notes',
  keyPoints: [
    'Only works for RIGHT TRIANGLES (one 90° angle)',
    'a² + b² = c² where c is the hypotenuse (longest side)',
    'Used to find missing side lengths',
    'Foundation for distance formula and trigonometry',
    'Discovered ~500 BC by Pythagoras (maybe)',
  ],
  formulas: [
    'a² + b² = c²',
    'c = √(a² + b²)',
    'a = √(c² - b²)',
  ],
  examples: [
    'Triangle with sides 3, 4, ? → 3² + 4² = 9 + 16 = 25 → c = 5',
    'Triangle with sides ?, 12, 13 → a² + 144 = 169 → a² = 25 → a = 5',
  ],
  summary: 'The Pythagorean theorem relates the three sides of a right triangle. It\'s essential for geometry, physics, and engineering.',
};

export const MOCK_EXAM_CONTENT: ExamContent = {
  style: 'exam',
  title: 'Photosynthesis - Exam Prep',
  questions: [
    {
      question: 'What is the primary pigment in photosynthesis?',
      answer: 'Chlorophyll (absorbs red and blue light, reflects green)',
      difficulty: 'Easy',
    },
    {
      question: 'Where do light-dependent reactions occur?',
      answer: 'Thylakoid membranes in chloroplasts',
      difficulty: 'Medium',
    },
    {
      question: 'What is the Calvin Cycle and where does it happen?',
      answer: 'Light-independent reactions that convert CO₂ into glucose, occurs in the stroma',
      difficulty: 'Hard',
    },
  ],
  keyFormulas: [
    '6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂',
    'Light reactions: H₂O → O₂ + ATP + NADPH',
    'Calvin Cycle: CO₂ + ATP + NADPH → Glucose',
  ],
  studyTips: [
    'Remember: Light reactions produce energy (ATP), Calvin cycle uses it',
    'Draw the chloroplast structure - visual memory helps!',
    'Practice balancing the photosynthesis equation',
    'Compare with cellular respiration (they\'re opposites!)',
  ],
};

// Mock generation function
export const generateMockContent = async (
  input: ContentGeneratorInput
): Promise<GeneratedContent> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const contentMap: Record<ContentStyle, GeneratedContent> = {
    reels: MOCK_REELS_CONTENT,
    meme: MOCK_MEME_CONTENT,
    character: MOCK_CHARACTER_CONTENT,
    notes: MOCK_NOTES_CONTENT,
    exam: MOCK_EXAM_CONTENT,
  };

  return contentMap[input.style];
};

// Style preset configurations
export interface StylePreset {
  id: ContentStyle;
  label: string;
  description: string;
  icon: string;
  color: string;
  emoji: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'reels',
    label: 'Reels-Style',
    description: 'Short-form video script with timestamps',
    icon: 'Video',
    color: '#9586F2',
    emoji: '📱',
  },
  {
    id: 'meme',
    label: 'Short Meme',
    description: 'Concept as a relatable meme',
    icon: 'Laugh',
    color: '#C27BA0',
    emoji: '😂',
  },
  {
    id: 'character',
    label: 'Character-Driven',
    description: 'Dialogue between characters',
    icon: 'Users',
    color: '#6DAEDB',
    emoji: '💬',
  },
  {
    id: 'notes',
    label: 'Simple Notes',
    description: 'Clean bullet-point summary',
    icon: 'FileText',
    color: '#9586F2',
    emoji: '📝',
  },
  {
    id: 'exam',
    label: 'Exam-Ready',
    description: 'Practice questions and formulas',
    icon: 'Award',
    color: '#C27BA0',
    emoji: '🎯',
  },
];

export const DIFFICULTY_LEVELS: Array<{ value: DifficultyLevel; label: string }> = [
  { value: 'elementary', label: 'Elementary' },
  { value: 'middle', label: 'Middle School' },
  { value: 'high', label: 'High School' },
  { value: 'college', label: 'College' },
  { value: 'graduate', label: 'Graduate' },
];

export const TONE_OPTIONS: Array<{ value: ToneType; label: string; emoji: string }> = [
  { value: 'casual', label: 'Casual', emoji: '😊' },
  { value: 'academic', label: 'Academic', emoji: '🎓' },
  { value: 'humorous', label: 'Humorous', emoji: '😄' },
  { value: 'eli5', label: 'ELI5 (Explain Like I\'m 5)', emoji: '👶' },
  { value: 'professional', label: 'Professional', emoji: '💼' },
];

export const TOPIC_SUGGESTIONS = [
  'Photosynthesis',
  'Pythagorean Theorem',
  'World War II',
  'Quantum Mechanics',
  'Shakespeare\'s Hamlet',
  'Chemical Bonding',
  'Calculus Derivatives',
  'Machine Learning',
];
