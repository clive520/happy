import React from 'react';
import { GameState } from '../types';

interface GameOverlayProps {
  score: number;
  lives: number;
  level: number;
  gameState: GameState;
  onNextLevel: () => void;
  onRestart: () => void;
}

const GameOverlay: React.FC<GameOverlayProps> = ({ score, lives, level, gameState, onNextLevel, onRestart }) => {
  return (
    <>
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between text-white font-mono text-xl pointer-events-none">
        <div className="flex gap-6">
          <span className="text-neon-yellow">SCORE: {score}</span>
          <span className="text-neon-pink">LIVES: {'♥'.repeat(lives)}</span>
        </div>
        <span className="text-neon-blue">LEVEL {level}/10</span>
      </div>

      {/* Level Complete Modal */}
      {gameState === GameState.LEVEL_COMPLETE && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-40 backdrop-blur-sm">
          <h2 className="text-5xl font-bold text-neon-green mb-6 animate-bounce">LEVEL {level} COMPLETE!</h2>
          <button
            onClick={onNextLevel}
            className="px-6 py-3 bg-neon-green text-black font-bold rounded hover:bg-white shadow-[0_0_15px_rgba(0,255,0,0.5)]"
          >
            NEXT LEVEL
          </button>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState === GameState.GAME_OVER && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50">
          <h2 className="text-6xl font-bold text-red-500 mb-2">GAME OVER</h2>
          <p className="text-2xl text-white mb-8">Final Score: {score}</p>
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-red-500 text-white font-bold rounded hover:bg-red-400"
          >
            TRY AGAIN
          </button>
        </div>
      )}

       {/* Victory Modal */}
       {gameState === GameState.VICTORY && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50">
          <h2 className="text-6xl font-bold text-neon-yellow mb-2">YOU WIN!</h2>
          <p className="text-xl text-slate-300 mb-8">You conquered all 10 levels.</p>
          <p className="text-3xl text-white mb-8">Final Score: {score}</p>
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-neon-yellow text-black font-bold rounded hover:bg-white"
          >
            PLAY AGAIN
          </button>
        </div>
      )}
    </>
  );
};

export default GameOverlay;