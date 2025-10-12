export enum QuestionType {
  TEXT = 'text',
  AUDIO = 'audio',
  // Add more as needed
}

export enum HintLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum Language {
  EN = 'en',
  ES = 'es',
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  hint: string;
  evaluatePoints: string[];
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  activityContext: string;
  level: string;
  questions: Question[];
  metadata: {
    duration: number; // in minutes
    difficulty: string;
    tags: string[];
  };
}

export enum BotState {
  INIT = 'INIT',
  READY_CHECK = 'READY_CHECK',
  ASK = 'ASK',
  LISTEN_INPUT = 'LISTEN_INPUT',
  EVALUATE = 'EVALUATE',
  FEEDBACK = 'FEEDBACK',
  NEXT_PROMPT = 'NEXT_PROMPT',
  SUMMARY = 'SUMMARY',
  EXIT = 'EXIT',
}

export interface StateMachine {
  currentState: BotState;
  transition(to: BotState): void;
}

export interface Message {
  id: string;
  type: 'assistant' | 'user' | 'hint' | 'feedback' | 'greeting' | 'waiting' | 'error';
  content: string;
  timestamp: Date;
}

/**
 * Representa el estado guardado de una pregunta individual
 * Se persiste en localStorage para permitir navegación entre preguntas
 */
export interface QuestionStateData {
  questionId: string;
  userResponse: string;
  feedback: string;
  hintUsed: boolean;
  timestamp: number;
  completed: boolean;
}

/**
 * Estructura completa de datos guardados en localStorage para una actividad
 */
export interface ActivityStorageData {
  activityId: string;
  questions: Record<string, QuestionStateData>;
  currentQuestionIndex: number;
}

export enum NavigationState {
  CAN_GO_BACK = 'CAN_GO_BACK',
  CAN_GO_NEXT = 'CAN_GO_NEXT',
  BLOCKED = 'BLOCKED'
}

export interface NavigationMetadata {
  canGoBack: boolean;
  canGoNext: boolean;
  currentIndex: number;
  totalQuestions: number;
  currentQuestionAnswered: boolean;
}