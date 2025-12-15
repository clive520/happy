import { Brick, BrickType } from '../types';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7'];

export const generateLevel = (level: number, canvasWidth: number, canvasHeight: number): Brick[] => {
  const bricks: Brick[] = [];
  // Cap rows so it doesn't get too crowded at bottom
  const rows = Math.min(8, 4 + Math.floor(level / 2)); 
  const cols = 8 + Math.floor(level / 4);
  const padding = 8;
  const marginTop = 60;
  
  const brickWidth = (canvasWidth - (padding * (cols + 1))) / cols;
  const brickHeight = 24;

  const getBrickType = (r: number, c: number, lvl: number): BrickType => {
    const random = Math.random();
    // Increase special brick frequency
    if (lvl >= 3 && random > 0.92) return BrickType.EXPLOSIVE;
    if (lvl >= 2 && (r + c + lvl) % 7 === 0) return BrickType.HARD;
    return BrickType.NORMAL;
  };

  const getBrickColor = (type: BrickType, row: number): string => {
    if (type === BrickType.EXPLOSIVE) return '#ef4444'; // Red
    if (type === BrickType.HARD) return '#94a3b8'; // Slate-400
    return COLORS[row % COLORS.length];
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let active = true;
      let type = getBrickType(r, c, level);
      let hits = type === BrickType.HARD ? 2 : 1;

      // Level Designs
      if (level === 2 && (r + c) % 2 === 0) active = false; // Checker
      if (level === 3 && c % 2 === 0) active = true; 
      if (level === 4 && r > c) active = false; // Diagonal
      if (level === 5) { // Tunnel
         if (c > 2 && c < cols - 3) active = false;
      }
      if (level === 6) { // Circle-ish approximation or diamond
         const mid = cols / 2;
         if (Math.abs(c - mid) > r + 1) active = false;
      }
      if (level === 9 && r % 2 === 0) type = BrickType.HARD; // Stripes

      if (active) {
        const x = padding + c * (brickWidth + padding);
        const y = marginTop + r * (brickHeight + padding);
        
        bricks.push({
          id: `${level}-${r}-${c}`,
          x,
          y,
          width: brickWidth,
          height: brickHeight,
          type,
          hitsLeft: hits,
          color: getBrickColor(type, r),
          value: type === BrickType.EXPLOSIVE ? 50 : (type === BrickType.HARD ? 30 : 10),
          visible: true
        });
      }
    }
  }
  return bricks;
};