
export enum AppView {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  GAME_AUNTIE = 'GAME_AUNTIE',
  GAME_DICE = 'GAME_DICE',
  GAME_DREAM = 'GAME_DREAM',
  GAME_RELATIVE = 'GAME_RELATIVE',
  GAME_OVER = 'GAME_OVER'
}

export interface AuntieResponse {
  score: number;
  comment: string;
  isPass: boolean;
}

export interface DreamResponse {
  type: 'GOOD' | 'BAD';
  explanation: string;
  multiplier: number;
}

export interface GameState {
  balance: number;
  initialBalance: number;
  history: string[];
}

export interface RelativeQuestion {
  description: string;
}

export interface RelativeJudgeResponse {
  isCorrect: boolean;
  correctAnswer: string;
  comment: string;
}
