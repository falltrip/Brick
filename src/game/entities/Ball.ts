import { Entity } from './Entity';

export interface Velocity {
  x: number;
  y: number;
}

export class Ball extends Entity {
  radius: number;
  velocity: Velocity;
  trailPositions: Array<{ x: number; y: number; age: number }> = [];
  maxTrailLength = 10;

  constructor(x: number, y: number, radius: number, velocity: Velocity) {
    super(x, y);
    this.radius = radius;
    this.velocity = velocity;
  }

  update(deltaTime: number) {
    // Store current position in trail
    this.trailPositions.unshift({ x: this.x, y: this.y, age: 0 });
    
    // Limit trail length
    if (this.trailPositions.length > this.maxTrailLength) {
      this.trailPositions.pop();
    }
    
    // Age trail positions
    this.trailPositions.forEach(pos => pos.age += deltaTime);
    
    // Update position
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  render(ctx: CanvasRenderingContext2D) {
    // Draw trail
    this.trailPositions.forEach((pos, index) => {
      const alpha = 1 - (index / this.maxTrailLength);
      const radius = this.radius * (1 - index * 0.05);
      
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
      ctx.fill();
    });
    
    // Draw ball glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 1.3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 204, 0, 0.3)";
    ctx.fill();
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffcc00";
    ctx.fill();
    
    // Draw shine
    ctx.beginPath();
    ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fill();
    
    // Draw face
    // Eyes
    const eyeRadius = this.radius * 0.15;
    ctx.beginPath();
    ctx.arc(this.x - this.radius * 0.25, this.y - this.radius * 0.1, eyeRadius, 0, Math.PI * 2);
    ctx.arc(this.x + this.radius * 0.25, this.y - this.radius * 0.1, eyeRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#333";
    ctx.fill();
    
    // Smile
    ctx.beginPath();
    ctx.arc(this.x, this.y + this.radius * 0.1, this.radius * 0.3, 0, Math.PI);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = this.radius * 0.1;
    ctx.stroke();
  }
}