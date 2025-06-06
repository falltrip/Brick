import { BaseEntity, EntityUpdateProps, EntityRenderProps } from './BaseEntity';

export enum PowerUpType {
  WidePaddle = 'WidePaddle',
  ExtraLife = 'ExtraLife',
  MultiBall = 'MultiBall',
  SlowBall = 'SlowBall',
  FastBall = 'FastBall',
  // TODO: Add more power-up types if needed
}

// 각 파워업 타입에 대한 시각적 표현 및 기본 속성 정의
interface PowerUpVisuals {
  color: string;
  text: string; // 간단한 텍스트로 아이템 종류 표시
}

const POWER_UP_CONFIG: Record<PowerUpType, PowerUpVisuals> = {
  [PowerUpType.WidePaddle]: { color: '#2196F3', text: 'W' }, // Blue
  [PowerUpType.ExtraLife]: { color: '#FF4081', text: '1UP' }, // Pink
  [PowerUpType.MultiBall]: { color: '#FF9800', text: 'MB' }, // Orange
  [PowerUpType.SlowBall]: { color: '#9E9E9E', text: 'S' },   // Grey
  [PowerUpType.FastBall]: { color: '#F44336', text: 'F' },   // Red
};

export class PowerUp extends BaseEntity {
  public type: PowerUpType;
  public speedY: number; // 아이템이 떨어지는 속도
  private visualConfig: PowerUpVisuals;
  private canvasHeight: number = 0; // Will be set if needed for off-screen check here

  constructor(x: number, y: number, type: PowerUpType, speedY: number = 100, canvasHeightRef?: number) {
    // 너비와 높이는 아이템 텍스트 크기나 아이콘에 따라 조절 가능
    super(x, y, 30, 20); // 임시 크기
    this.type = type;
    this.speedY = speedY;
    this.visualConfig = POWER_UP_CONFIG[this.type];
    if (canvasHeightRef) this.canvasHeight = canvasHeightRef;
  }

  update(props: EntityUpdateProps): void {
    const { deltaTime } = props;
    this.y += this.speedY * deltaTime;

    // 화면 하단으로 나가면 자동 제거 (GameEngine에서 처리하는 것이 더 중앙집중적일 수 있음)
    // if (this.canvasHeight && this.y > this.canvasHeight) {
    //   this.destroy();
    // }
  }

  render(props: EntityRenderProps): void {
    const { ctx } = props;
    if (this.isDestroyed) return;

    // 아이템 박스
    ctx.fillStyle = this.visualConfig.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 아이템 텍스트
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.visualConfig.text, this.x + this.width / 2, this.y + this.height / 2);
  }
}
