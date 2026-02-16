export enum AppView {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  GAME_AUNTIE = 'GAME_AUNTIE',
  GAME_DICE = 'GAME_DICE',
  GAME_OVER = 'GAME_OVER'
}

export interface AuntieResponse {
  score: number;
  comment: string;
  isPass: boolean;
}

export interface GameState {
  balance: number;
  initialBalance: number;
  history: string[];
}
