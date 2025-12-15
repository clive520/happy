export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum PowerUpType {
  EXPAND_PADDLE = 'EXPAND_PADDLE',
  MULTI_BALL = 'MULTI_BALL',
  BOMB = 'BOMB',
  LIFE_UP = 'LIFE_UP'
}

export enum BrickType {
  NORMAL = 'NORMAL',
  HARD = 'HARD', // Takes 2 hits
  UNBREAKABLE = 'UNBREAKABLE', // Wall
  EXPLOSIVE = 'EXPLOSIVE' // Blows up neighbors
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Ball extends Entity {
  radius: number;
  dx: number;
  dy: number;
  speed: number;
  active: boolean;
}

export interface Brick extends Entity {
  id: string;
  type: BrickType;
  hitsLeft: number;
  color: string;
  value: number;
  visible: boolean;
}

export interface PowerUp extends Entity {
  id: string;
  type: PowerUpType;
  dy: number;
  active: boolean;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface LevelConfig {
  rows: number;
  cols: number;
  bricks: Brick[];
}