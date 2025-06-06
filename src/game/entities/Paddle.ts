import { Entity } from './Entity';

export class Paddle extends Entity {
  width: number;
  height: number;
  targetX: number;
  speed: number = 0.5;

  constructor(x: number, y: number, width: number, height: number) {
    super(x, y);
    this.width = width;
    this.height = height;
    this.targetX = x;
  }

  update() {
    const diff = this.targetX - this.x;
    if (Math.abs(diff) > 0.1) {
      this.x += diff * 0.5; // 패들 이동 속도 계수를 0.3에서 0.5로 변경
    } else {
      this.x = this.targetX;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(this.x + 3, this.y + 3, this.width, this.height);
    
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    gradient.addColorStop(0, "#ff66cc");
    gradient.addColorStop(1, "#cc33aa");
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 10);
    ctx.fill();
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.roundRect(this.x + 5, this.y + 2, this.width - 10, this.height / 3, 5);
    ctx.fill();
    
    const eyeRadius = this.height * 0.25;
    const eyeY = this.y + this.height / 2;
    ctx.beginPath();
    ctx.arc(this.x + this.width * 0.25, eyeY, eyeRadius, 0, Math.PI * 2);
    ctx.arc(this.x + this.width * 0.75, eyeY, eyeRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(this.x + this.width * 0.25, eyeY, eyeRadius * 0.5, 0, Math.PI * 2);
    ctx.arc(this.x + this.width * 0.75, eyeY, eyeRadius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = "#333";
    ctx.fill();
  }
}