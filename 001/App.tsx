import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import MenuScreen from './components/MenuScreen';
import GameOverlay from './components/GameOverlay';
import { GameState } from './types';
import { audioService } from './services/audioService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(0);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('breakout_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('breakout_highscore', score.toString());
    }
  }, [score, highScore]);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameState(GameState.PLAYING);
    // Audio context needs user interaction to start
    audioService.toggleMute(); 
    audioService.toggleMute(); 
    audioService.startBGM();
  };

  const nextLevel = () => {
    if (level >= 10) {
      setGameState(GameState.VICTORY);
      audioService.stopBGM();
    } else {
      setLevel(l => l + 1);
      setGameState(GameState.PLAYING);
      audioService.startBGM(); // Resume/Ensure music
    }
  };

  const handleLevelComplete = () => {
    setGameState(GameState.LEVEL_COMPLETE);
    audioService.playLevelComplete();
    audioService.stopBGM();
  };

  const handleGameOver = () => {
    setGameState(GameState.GAME_OVER);
    audioService.stopBGM();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="relative w-[800px] h-[600px] shadow-2xl rounded-lg overflow-hidden border-4 border-slate-800">
        
        {/* The Game Canvas handles the rendering and physics loop */}
        <GameCanvas 
          gameState={gameState}
          setGameState={setGameState}
          level={level}
          setLevel={setLevel}
          score={score}
          setScore={setScore}
          lives={lives}
          setLives={setLives}
          onLevelComplete={handleLevelComplete}
          onGameOver={handleGameOver}
        />

        {/* UI Layer */}
        {gameState === GameState.MENU ? (
          <MenuScreen onStart={startGame} highScore={highScore} />
        ) : (
          <GameOverlay 
            score={score} 
            lives={lives} 
            level={level} 
            gameState={gameState}
            onNextLevel={nextLevel}
            onRestart={startGame}
          />
        )}
      </div>
    </div>
  );
};

export default App;