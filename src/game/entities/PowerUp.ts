import { Entity } from './Entity';
import { PowerUpType } from '../GameEngine';

export class PowerUp extends Entity {
  radius: number;
  type: PowerUpType;
  velocity: { x: number; y: number };
  rotation: number = 0;
  rotationSpeed: number;
  pulseAmount: number = 0;
  pulseDirection: number = 1;

  constructor(x: number, y: number, radius: number, type: PowerUpType) {
    super(x, y);
    this.radius = radius;
    this.type = type;
    
    // Set random velocity
    this.velocity = {
      x: (Math.random() - 0.5) * 2,
      y: Math.random() * 2 + 1
    };
    
    // Set random rotation speed
    this.rotationSpeed = (Math.random() - 0.5) * 0.2;
  }

  getColor(): string {
    switch (this.type) {
      case 'extraLife': return '#ff6b6b'; // Red
      case 'widePaddle': return '#48dbfb'; // Blue
      case 'multiball': return '#feca57'; // Yellow
      case 'slowBall': return '#1dd1a1'; // Green
      case 'fastBall': return '#ff9ff3'; // Pink
      default: return '#ffffff'; // White
    }
  }

  getIcon(): string {
    switch (this.type) {
      case 'extraLife': return '♥';
      case 'widePaddle': return '↔';
      case 'multiball': return '●●';
      case 'slowBall': return '⊝';
      case 'fastBall': return '⚡';
      default: return '?';
    }
  }

  update(deltaTime: number) {
    // Update position
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    
    // Update rotation
    this.rotation += this.rotationSpeed;
    
    // Bounce off walls
    if (this.x - this.radius < 0 || this.x + this.radius > 800) {
      this.velocity.x = -this.velocity.x;
    }
    
    // Pulse animation
    this.pulseAmount += this.pulseDirection * 0.03;
    if (this.pulseAmount > 0.3 || this.pulseAmount < 0) {
      this.pulseDirection *= -1;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    // Draw power-up glow
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * (1.2 + this.pulseAmount), 0, Math.PI * 2);
    ctx.fillStyle = `${this.getColor()}66`; // Add alpha
    ctx.fill();
    
    // Draw power-up background
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, this.getColor());
    
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw power-up border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw power-up icon
    ctx.fillStyle = 'white';
    ctx.font = `bold ${this.radius}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.getIcon(), 0, 0);
    
    ctx.restore();
  }
}