import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, Ball, Brick, PowerUp, PowerUpType, BrickType, Particle } from '../types';
import { generateLevel } from '../services/levelGenerator';
import { audioService } from '../services/audioService';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  level: number;
  setLevel: React.Dispatch<React.SetStateAction<number>>;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  lives: number;
  setLives: React.Dispatch<React.SetStateAction<number>>;
  onLevelComplete: () => void;
  onGameOver: () => void;
}

// Game Constants
const PADDLE_WIDTH_BASE = 120;
const PADDLE_HEIGHT = 16;
const BALL_RADIUS = 7;
const BALL_SPEED_BASE = 8; 
const MAX_BALL_SPEED = 14;

const GameCanvas: React.FC<GameCanvasProps> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Use a Ref to hold latest props so the loop doesn't need to restart when props change
  const propsRef = useRef(props);
  useEffect(() => { propsRef.current = props; });

  // Game State Refs (The Physics Truth)
  const paddleRef = useRef({ x: 350, width: PADDLE_WIDTH_BASE });
  const ballsRef = useRef<Ball[]>([]);
  const bricksRef = useRef<Brick[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  
  // Cache bounds to avoid layout thrashing on mousemove
  const boundsRef = useRef({ left: 0, top: 0, scaleX: 1 });

  // Internal tracking
  const internalStateRef = useRef({
    score: props.score,
    lives: props.lives,
    paddleEffectTimer: 0,
    initializedLevel: 0
  });

  // --- Helpers ---

  const updateBounds = useCallback(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      boundsRef.current = {
        left: rect.left,
        top: rect.top,
        scaleX: canvasRef.current.width / rect.width
      };
    }
  }, []);

  useEffect(() => {
    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, [updateBounds]);

  const createParticles = (x: number, y: number, color: string, count: number = 8) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x, y,
        dx: (Math.random() - 0.5) * 6,
        dy: (Math.random() - 0.5) * 6,
        life: 1.0,
        maxLife: 1.0,
        color: color,
        size: Math.random() * 4 + 2
      });
    }
  };

  const spawnPowerUp = (x: number, y: number) => {
    // 25% drop rate
    if (Math.random() > 0.25) return;
    
    const r = Math.random();
    let type = PowerUpType.EXPAND_PADDLE;
    if (r < 0.35) type = PowerUpType.EXPAND_PADDLE;
    else if (r < 0.65) type = PowerUpType.MULTI_BALL;
    else if (r < 0.85) type = PowerUpType.BOMB;
    else type = PowerUpType.LIFE_UP;

    let color = '#fff';
    switch(type) {
      case PowerUpType.EXPAND_PADDLE: color = '#00f3ff'; break; 
      case PowerUpType.MULTI_BALL: color = '#ffff00'; break; 
      case PowerUpType.BOMB: color = '#ff0000'; break; 
      case PowerUpType.LIFE_UP: color = '#ff00ff'; break; 
    }

    powerUpsRef.current.push({
      id: Math.random().toString(),
      x, y,
      width: 25, 
      height: 25,
      dy: 3.5, 
      active: true,
      color,
      type
    });
  };

  const triggerBombEffect = () => {
    const visibleBricks = bricksRef.current.filter(b => b.visible && b.type !== BrickType.UNBREAKABLE);
    if (visibleBricks.length === 0) return;
    
    audioService.playExplosion();
    
    // Destroy up to 5 random bricks
    visibleBricks.sort(() => Math.random() - 0.5);
    const targets = visibleBricks.slice(0, 5);
    
    targets.forEach(b => {
      b.visible = false;
      internalStateRef.current.score += b.value;
      createParticles(b.x + b.width/2, b.y + b.height/2, '#ef4444', 15);
    });
    
    propsRef.current.setScore(internalStateRef.current.score);
  };

  const initLevel = (levelNum: number) => {
    if (!canvasRef.current) return;
    const { width, height } = canvasRef.current;
    
    internalStateRef.current.initializedLevel = levelNum;
    
    paddleRef.current = { x: (width - PADDLE_WIDTH_BASE)/2, width: PADDLE_WIDTH_BASE };
    internalStateRef.current.paddleEffectTimer = 0;

    ballsRef.current = [{
      x: width / 2,
      y: height - 40,
      dx: 0,
      dy: 0,
      radius: BALL_RADIUS,
      speed: BALL_SPEED_BASE + (levelNum * 0.4),
      active: true,
      width: BALL_RADIUS * 2,
      height: BALL_RADIUS * 2
    }];

    bricksRef.current = generateLevel(levelNum, width, height);
    powerUpsRef.current = [];
    particlesRef.current = [];
  };

  // --- Game Loop ---

  const update = () => {
    if (propsRef.current.gameState !== GameState.PLAYING || !canvasRef.current) return;
    const { width, height } = canvasRef.current;
    const paddle = paddleRef.current;

    // 1. Paddle Effects
    if (internalStateRef.current.paddleEffectTimer > 0) {
      internalStateRef.current.paddleEffectTimer--;
      if (internalStateRef.current.paddleEffectTimer <= 0) {
        paddle.width = PADDLE_WIDTH_BASE;
      }
    }

    // 2. Balls
    let activeBalls = 0;
    ballsRef.current.forEach(ball => {
      if (!ball.active) return;
      activeBalls++;

      if (ball.dx !== 0 || ball.dy !== 0) {
        ball.x += ball.dx;
        ball.y += ball.dy;
      } else {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = height - 40;
      }

      // Walls
      if (ball.x + ball.radius > width) { 
        ball.x = width - ball.radius; 
        ball.dx *= -1; 
        audioService.playHitWall(); 
      }
      if (ball.x - ball.radius < 0) { 
        ball.x = ball.radius; 
        ball.dx *= -1; 
        audioService.playHitWall(); 
      }
      if (ball.y - ball.radius < 0) { 
        ball.y = ball.radius; 
        ball.dy *= -1; 
        audioService.playHitWall(); 
      }
      
      // Lost Ball
      if (ball.y - ball.radius > height) {
        ball.active = false;
        audioService.playLifeLost();
      }

      // Paddle Collision (Fixed Y Check)
      // Paddle Top is at `height - 30`
      const paddleTop = height - 30;
      const paddleBottom = height - 30 + PADDLE_HEIGHT;
      
      if (ball.dy > 0 && 
          ball.y + ball.radius >= paddleTop && 
          ball.y - ball.radius <= paddleBottom &&
          ball.x >= paddle.x && 
          ball.x <= paddle.x + paddle.width) {
        
        audioService.playHitPaddle();
        // Ensure ball is moving up
        ball.dy = -Math.abs(ball.dy);
        
        // Push ball out of paddle to prevent sticking
        ball.y = paddleTop - ball.radius - 1;

        // English/Spin
        const hitPoint = ball.x - (paddle.x + paddle.width/2);
        ball.dx = hitPoint * 0.25; 

        // Speed management
        const currentSpeed = Math.sqrt(ball.dx*ball.dx + ball.dy*ball.dy);
        const targetSpeed = Math.min(ball.speed * 1.02, MAX_BALL_SPEED);
        ball.speed = targetSpeed;
        
        ball.dx = (ball.dx / currentSpeed) * targetSpeed;
        ball.dy = (ball.dy / currentSpeed) * targetSpeed;
      }

      // Brick Collision
      const bricks = bricksRef.current;
      for (let i = 0; i < bricks.length; i++) {
        const b = bricks[i];
        if (!b.visible) continue;

        if (ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + b.width &&
            ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + b.height) {
          
          ball.dy *= -1;
          audioService.playHitBrick();

          if (b.type !== BrickType.UNBREAKABLE) {
            b.hitsLeft--;
            if (b.hitsLeft <= 0) {
              b.visible = false;
              internalStateRef.current.score += b.value;
              propsRef.current.setScore(internalStateRef.current.score);
              
              createParticles(b.x + b.width/2, b.y + b.height/2, b.color);
              spawnPowerUp(b.x + b.width/2, b.y);

              if (b.type === BrickType.EXPLOSIVE) {
                audioService.playExplosion();
                bricks.forEach(nb => {
                  if (nb.visible && Math.abs(nb.x - b.x) < 80 && Math.abs(nb.y - b.y) < 60) {
                     nb.visible = false;
                     internalStateRef.current.score += nb.value;
                     createParticles(nb.x+nb.width/2, nb.y+nb.height/2, '#ef4444');
                  }
                });
                propsRef.current.setScore(internalStateRef.current.score);
              }
            } else {
              b.color = '#94a3b8';
            }
          }
          break;
        }
      }
    });

    // Level Clear
    const remaining = bricksRef.current.filter(b => b.visible && b.type !== BrickType.UNBREAKABLE).length;
    if (remaining === 0) {
      propsRef.current.onLevelComplete();
    }

    // Check Lives
    if (activeBalls === 0) {
      if (internalStateRef.current.lives > 1) {
        internalStateRef.current.lives--;
        propsRef.current.setLives(internalStateRef.current.lives);
        
        // Reset balls array to clear dead balls and add one new one
        ballsRef.current = [{
          x: paddle.x + paddle.width/2,
          y: height - 40,
          dx: 0, dy: 0,
          radius: BALL_RADIUS,
          speed: BALL_SPEED_BASE + (propsRef.current.level * 0.4),
          active: true,
          width: BALL_RADIUS*2,
          height: BALL_RADIUS*2
        }];
      } else {
        internalStateRef.current.lives = 0;
        propsRef.current.setLives(0);
        propsRef.current.onGameOver();
      }
    }

    // 3. PowerUps
    powerUpsRef.current.forEach(p => {
      if (!p.active) return;
      p.y += p.dy;

      // Collision box for powerup
      const pRadius = 12;
      const pLeft = p.x - pRadius;
      const pRight = p.x + pRadius;
      const pTop = p.y - pRadius;
      const pBottom = p.y + pRadius;
      
      const paddleTop = height - 30;
      const paddleBottom = height - 30 + PADDLE_HEIGHT;

      // Check overlap
      if (pBottom >= paddleTop && pTop <= paddleBottom &&
          pRight >= paddle.x && pLeft <= paddle.x + paddle.width) {
        
        p.active = false;
        audioService.playPowerUp();
        
        switch (p.type) {
          case PowerUpType.EXPAND_PADDLE:
            paddle.width = PADDLE_WIDTH_BASE * 1.5;
            internalStateRef.current.paddleEffectTimer = 900; 
            break;
          case PowerUpType.MULTI_BALL:
            const newBalls: Ball[] = [];
            ballsRef.current.forEach(b => {
              if (b.active) {
                newBalls.push({ ...b, dx: b.dx * -1, dy: b.dy });
                newBalls.push({ ...b, dx: b.dx * 0.5, dy: b.dy * 1.1 });
              }
            });
            ballsRef.current = [...ballsRef.current, ...newBalls];
            break;
          case PowerUpType.LIFE_UP:
            internalStateRef.current.lives = Math.min(internalStateRef.current.lives + 1, 5);
            propsRef.current.setLives(internalStateRef.current.lives);
            break;
          case PowerUpType.BOMB:
            triggerBombEffect();
            break;
        }
      }
      
      if (p.y > height) p.active = false;
    });

    // 4. Particles
    particlesRef.current.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      p.life -= 0.02;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
  };

  const draw = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvasRef.current;

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Paddle
    ctx.fillStyle = '#00f3ff';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00f3ff';
    ctx.fillRect(paddleRef.current.x, height - 30, paddleRef.current.width, PADDLE_HEIGHT);
    ctx.shadowBlur = 0;

    // Bricks
    bricksRef.current.forEach(b => {
      if (!b.visible) return;
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.width, b.height);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(b.x, b.y, b.width, b.height/2);
    });

    // Balls
    ballsRef.current.forEach(b => {
      if (!b.active) return;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffffff';
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.closePath();
    });

    // PowerUps
    powerUpsRef.current.forEach(p => {
      if (!p.active) return;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let icon = '?';
      if (p.type === PowerUpType.BOMB) icon = '💣';
      else if (p.type === PowerUpType.EXPAND_PADDLE) icon = '↔';
      else if (p.type === PowerUpType.MULTI_BALL) icon = 'ooo';
      else if (p.type === PowerUpType.LIFE_UP) icon = '♥';
      ctx.fillText(icon, p.x, p.y);
    });

    // Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
  };

  useEffect(() => {
    const loop = () => {
      update();
      draw();
      requestRef.current = requestAnimationFrame(loop);
    };
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  useEffect(() => {
    if (internalStateRef.current.initializedLevel !== props.level) {
      initLevel(props.level);
    }
  }, [props.level]);

  useEffect(() => {
     if (props.score === 0 && internalStateRef.current.score !== 0) {
       internalStateRef.current.score = 0;
     }
     if (props.lives === 3 && internalStateRef.current.lives !== 3) {
       internalStateRef.current.lives = 3;
     }
  }, [props.score, props.lives]);

  // Optimized Input Handling
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      
      // Use cached bounds to prevent layout thrashing (Reflow)
      const { left, scaleX } = boundsRef.current;
      
      // Calculate X relative to the scaled canvas
      const relativeX = (e.clientX - left) * scaleX;
      
      let newX = relativeX - paddleRef.current.width / 2;
      
      // Clamp
      if (newX < 0) newX = 0;
      if (newX + paddleRef.current.width > canvasRef.current.width) {
        newX = canvasRef.current.width - paddleRef.current.width;
      }
      
      paddleRef.current.x = newX;
    };

    const handleClick = () => {
       if (propsRef.current.gameState === GameState.PLAYING) {
         const balls = ballsRef.current;
         // Find stuck ball - improved logic to find ANY stuck ball, not just the first one
         const stuckBall = balls.find(b => b.active && b.dx === 0 && b.dy === 0);
         
         if (stuckBall) {
           stuckBall.dx = (Math.random() * 2 - 1) * stuckBall.speed;
           stuckBall.dy = -stuckBall.speed;
           audioService.startBGM();
         }
       }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mousedown', handleClick);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="bg-slate-900 border-4 border-slate-700 shadow-2xl rounded-lg cursor-none"
    />
  );
};

export default GameCanvas;