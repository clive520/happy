import React from 'react';

interface MenuScreenProps {
  onStart: () => void;
  highScore: number;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ onStart, highScore }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50 text-white backdrop-blur-sm">
      <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-pink animate-pulse-fast">
        NEON BREAKOUT
      </h1>
      <p className="mb-8 text-slate-300">Destroy bricks. Catch power-ups. Survive.</p>
      
      <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-600 mb-8">
        <h2 className="text-xl text-center mb-2 text-neon-yellow">High Score</h2>
        <p className="text-4xl font-mono text-center">{highScore}</p>
      </div>

      <button
        onClick={onStart}
        className="px-8 py-4 bg-neon-blue text-slate-900 font-bold text-xl rounded hover:bg-white transition-all shadow-[0_0_20px_rgba(0,243,255,0.5)] transform hover:scale-105"
      >
        START GAME
      </button>

      <div className="mt-12 text-sm text-slate-500">
        <p>Mouse to move • Click to launch ball</p>
      </div>
    </div>
  );
};

export default MenuScreen;