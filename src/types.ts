// Shared TypeScript types for StudyCopilot AI

export type StudyMode = 
  | 'dashboard'
  | 'summarize' 
  | 'explain' 
  | 'mcqs' 
  | 'flashcards' 
  | 'viva' 
  | 'revision' 
  | 'presentation';

export interface SummaryData {
  summary: string;
  keyTakeaways: string[];
  glossary: {
    term: string;
    definition: string;
  }[];
}

export interface ExplanationData {
  concept: string;
  simpleExplanation: string;
  keyAnalogy: string;
  corePrinciples: {
    title: string;
    explanation: string;
  }[];
  commonMisconception: string;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface MCQData {
  questions: MCQQuestion[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint: string;
}

export interface FlashcardData {
  flashcards: Flashcard[];
}

export interface VivaQuestion {
  id: string;
  question: string;
  modelAnswer: string;
  keywordsRequired: string[];
  difficulty: string;
}

export interface VivaData {
  questions: VivaQuestion[];
}

export interface RevisionDay {
  dayNumber: number;
  topic: string;
  tasks: string[];
  estimatedMinutes: number;
}

export interface RevisionWeek {
  weekNumber: number;
  focus: string;
  days: RevisionDay[];
}

export interface RevisionPlanData {
  title: string;
  overview: string;
  weeks: RevisionWeek[];
}

export interface Slide {
  slideNumber: number;
  title: string;
  points: string[];
  visualSuggestion: string;
}

export interface PresentationData {
  title: string;
  subtitle: string;
  themeColor: string;
  slides: Slide[];
}
