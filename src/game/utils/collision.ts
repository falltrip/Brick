import { Ball } from '../entities/Ball';
import { Block } from '../entities/Block';

interface CollisionResult {
  collided: boolean;
  direction: 'top' | 'right' | 'bottom' | 'left' | null;
}

export function checkCollision(ball: Ball, block: Block): CollisionResult {
  // Calculate the nearest point on the block to the ball center
  const nearestX = Math.max(block.x, Math.min(ball.x, block.x + block.width));
  const nearestY = Math.max(block.y, Math.min(ball.y, block.y + block.height));
  
  // Calculate the distance between the nearest point and the ball center
  const deltaX = ball.x - nearestX;
  const deltaY = ball.y - nearestY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  // Check if the distance is less than the ball's radius
  if (distance < ball.radius) {
    // Determine collision direction
    let direction: 'top' | 'right' | 'bottom' | 'left' | null = null;
    
    // Check if the ball is hitting the block from the sides or top/bottom
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Ball is hitting from the sides
      direction = deltaX > 0 ? 'left' : 'right';
    } else {
      // Ball is hitting from the top or bottom
      direction = deltaY > 0 ? 'top' : 'bottom';
    }
    
    return { collided: true, direction };
  }
  
  return { collided: false, direction: null };
}