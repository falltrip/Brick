import { BaseEntity, EntityUpdateProps, EntityRenderProps } from './BaseEntity';

export class Particle extends BaseEntity {
  private velocityX: number;
  private velocityY: number;
  private lifeSpan: number; // 파티클 생존 시간 (ms)
  private age: number = 0; // 현재 파티클 나이
  private color: string;
  private initialRadius: number;

  constructor(
    x: number, y: number,
    velocityX: number, velocityY: number,
    radius: number, color: string, lifeSpan: number
  ) {
    super(x, y, radius * 2, radius * 2); // width/height는 반지름의 2배
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.initialRadius = radius;
    this.color = color;
    this.lifeSpan = lifeSpan;
  }

  update(props: EntityUpdateProps): void {
    const { deltaTime } = props;
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;

    // 중력 효과 (선택 사항)
    // this.velocityY += 200 * deltaTime;

    this.age += deltaTime * 1000; // ms 단위로 나이 증가
    if (this.age >= this.lifeSpan) {
      this.destroy();
    }
  }

  render(props: EntityRenderProps): void {
    const { ctx } = props;
    if (this.isDestroyed) return;

    const currentRadius = Math.max(0, this.initialRadius * (1 - this.age / this.lifeSpan));
    if (currentRadius === 0) { // 완전히 사라진 경우 그리지 않고, 혹시 모를 destroy 누락 방지
        this.destroy();
        return;
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = Math.max(0, 1 - this.age / this.lifeSpan); // 점점 투명해지는 효과
    ctx.fill();
    ctx.closePath();
    ctx.globalAlpha = 1; // globalAlpha 복원
  }
}
