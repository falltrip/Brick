import { BaseEntity, EntityUpdateProps, EntityRenderProps } from './BaseEntity';

export class NewBall extends BaseEntity {
  public radius: number;
  public dx: number; // x축 속도
  public dy: number; // y축 속도
  private canvasWidth: number;
  private canvasHeight: number;
  private originalDx: number;
  private originalDy: number;
  private speedEffectActive: boolean = false;

  constructor(
    x: number, y: number, radius: number,
    initialDx: number, initialDy: number,
    canvasWidth: number, canvasHeight: number
  ) {
    super(x, y, radius * 2, radius * 2); // width/height는 반지름의 2배로 설정
    this.radius = radius;
    this.dx = initialDx;
    this.dy = initialDy;
    this.originalDx = initialDx; // 초기 속도 저장
    this.originalDy = initialDy; // 초기 속도 저장
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  update(props: EntityUpdateProps): void {
    const { deltaTime } = props;

    this.x += this.dx * deltaTime;
    this.y += this.dy * deltaTime;

    // 화면 경계 충돌 처리 (상하좌우)
    if (this.x - this.radius < 0) { // 왼쪽 벽
      this.x = this.radius;
      this.dx = -this.dx;
    } else if (this.x + this.radius > this.canvasWidth) { // 오른쪽 벽
      this.x = this.canvasWidth - this.radius;
      this.dx = -this.dx;
    }

    if (this.y - this.radius < 0) { // 위쪽 벽
      this.y = this.radius;
      this.dy = -this.dy;
    }
    // 아래쪽 벽 충돌은 GameEngine에서 놓친 것으로 처리 (생명 감소 등)
    // else if (this.y + this.radius > this.canvasHeight) {
    //   this.y = this.canvasHeight - this.radius;
    //   this.dy = -this.dy;
    //   // 혹은 여기서 Game Over 로직을 위한 플래그 설정 또는 콜백 호출
    // }
  }

  render(props: EntityRenderProps): void {
    const { ctx } = props;
    if (this.isDestroyed) return;

    ctx.beginPath();
    // 그라데이션 (중심에서 바깥으로 밝아지는 효과)
    const gradient = ctx.createRadialGradient(
      this.x - this.radius * 0.2, this.y - this.radius * 0.2, this.radius * 0.1, // 하이라이트 위치 및 크기
      this.x, this.y, this.radius
    );
    gradient.addColorStop(0, 'rgba(173, 216, 230, 1)'); // LightBlue (하이라이트)
    gradient.addColorStop(0.8, 'rgba(0, 0, 255, 1)');    // Blue
    gradient.addColorStop(1, 'rgba(0, 0, 139, 1)');    // DarkBlue (외곽)

    ctx.fillStyle = gradient;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  // 외부에서 캔버스 크기 변경 시 호출
  public setCanvasSize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    // 공이 화면 밖으로 나갔을 경우 위치 조정 로직 추가 가능
    if (this.x + this.radius > this.canvasWidth) this.x = this.canvasWidth - this.radius;
    if (this.x - this.radius < 0) this.x = this.radius;
    if (this.y + this.radius > this.canvasHeight) this.y = this.canvasHeight - this.radius; // Not strictly needed due to game over logic
    if (this.y - this.radius < 0) this.y = this.radius;
  }

  public multiplySpeed(factor: number): void {
    if (!this.speedEffectActive) { // 효과가 적용되지 않았을 때만 현재 속도를 original로 간주
      this.originalDx = this.dx;
      this.originalDy = this.dy;
      this.speedEffectActive = true;
    }
    // 이미 speedEffectActive 상태에서 또 multiplySpeed가 불리면,
    // originalDx/Dy는 이미 이전 효과 시작 전 값으로 설정되어 있으므로,
    // factor는 original 값에 곱해져야 함.
    // 그러나 현재 로직은 this.dx/dy에 factor를 곱하므로 중첩 효과가 발생함.
    // ex) slow (0.7) -> dx = originalDx*0.7. fast(1.3) -> dx = (originalDx*0.7)*1.3
    // 프롬프트에서는 "단순 중첩 불가로 가정" 했으므로,
    // clearPowerUpEffect에서 resetSpeed()를 호출하여 이전 효과를 제거한 후 새 효과를 적용하는 방식이므로,
    // 이 multiplySpeed는 항상 resetSpeed() 후 호출된다고 가정하면 아래 로직이 맞음.
    // 즉, multiplySpeed는 항상 공의 "기본" 속도에서 factor를 곱하는게 아니라, "현재" 속도에서 factor를 곱함.
    // 하지만 resetSpeed는 originalDx/Dy(최초 기본속도 또는 마지막 multiplySpeed 전 속도)로 돌림.
    // 일관성을 위해, multiplySpeed는 항상 originalDx/Dy를 기준으로 하는 것이 좋을 수 있음.
    // 또는, resetSpeed가 호출되면 speedEffectActive가 false가 되므로, 다음 multiplySpeed는 새 original값을 설정함.
    // 이 구조는 "마지막으로 적용된 단일 속도 효과만 기억하고 되돌림"을 의미.
    this.dx *= factor;
    this.dy *= factor;
  }

  public resetSpeed(): void {
    if (this.speedEffectActive) {
      this.dx = this.originalDx;
      this.dy = this.originalDy;
      this.speedEffectActive = false;
    }
  }
}
