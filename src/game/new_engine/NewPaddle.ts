import { BaseEntity, EntityUpdateProps, EntityRenderProps } from './BaseEntity';
import { InputManager } from './InputManager';

export class NewPaddle extends BaseEntity {
  public speed: number;
  private inputManager: InputManager;
  public canvasWidth: number; // 패들이 움직일 수 있는 최대 너비 (캔버스 너비) - public으로 변경하여 GameEngine에서 접근 가능하도록

  constructor(x: number, y: number, width: number, height: number, speed: number, canvasWidth: number) {
    super(x, y, width, height);
    this.speed = speed;
    this.inputManager = InputManager.getInstance();
    this.canvasWidth = canvasWidth;
  }

  update(props: EntityUpdateProps): void {
    const { deltaTime } = props;
    let dx = 0;

    // 키 입력에 따른 이동 방향 결정
    // 'a'와 'd'도 소문자로 확인 (InputManager에서 toLowerCase() 사용하지만, 일관성 유지)
    if (this.inputManager.isKeyPressed('arrowleft') || this.inputManager.isKeyPressed('a') || this.inputManager.isKeyPressed('key_a')) {
      dx = -1;
    }
    if (this.inputManager.isKeyPressed('arrowright') || this.inputManager.isKeyPressed('d') || this.inputManager.isKeyPressed('key_d')) {
      dx = 1;
    }

    // 패들 위치 업데이트
    this.x += dx * this.speed * deltaTime;

    // 화면 경계 처리
    if (this.x < 0) {
      this.x = 0;
    }
    if (this.x + this.width > this.canvasWidth) {
      this.x = this.canvasWidth - this.width;
    }
  }

  render(props: EntityRenderProps): void {
    const { ctx } = props;
    if (this.isDestroyed) return;

    // 몸체 그라데이션 (예: 밝은 핑크에서 좀 더 진한 핑크로)
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    gradient.addColorStop(0, "#FFC0CB"); // LightPink
    gradient.addColorStop(1, "#FF69B4"); // HotPink

    ctx.fillStyle = gradient;
    ctx.beginPath();
    // 둥근 모서리 적용 (기존 NewPaddle의 둥근 모서리 로직 활용 또는 Path2D 사용)
    const cornerRadius = Math.min(this.width, this.height) * 0.3; // 좀 더 둥글게
    ctx.moveTo(this.x + cornerRadius, this.y);
    ctx.lineTo(this.x + this.width - cornerRadius, this.y);
    ctx.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + cornerRadius);
    ctx.lineTo(this.x + this.width, this.y + this.height - cornerRadius);
    ctx.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + this.width - cornerRadius, this.y + this.height);
    ctx.lineTo(this.x + cornerRadius, this.y + this.height);
    ctx.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height - cornerRadius);
    ctx.lineTo(this.x, this.y + cornerRadius);
    ctx.quadraticCurveTo(this.x, this.y, this.x + cornerRadius, this.y);
    ctx.closePath();
    ctx.fill();

    // 하이라이트 (윗부분)
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.roundRect(this.x + this.width * 0.1, this.y + this.height * 0.1, this.width * 0.8, this.height * 0.3, 5);
    ctx.fill();

    // 눈 그리기 (선택 사항: 귀여운 스타일)
    const eyeRadius = this.height * 0.15;
    const eyeY = this.y + this.height * 0.4;
    const pupilRadius = eyeRadius * 0.5;

    // 왼쪽 눈
    ctx.beginPath();
    ctx.arc(this.x + this.width * 0.3, eyeY, eyeRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + this.width * 0.3, eyeY, pupilRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#333";
    ctx.fill();

    // 오른쪽 눈
    ctx.beginPath();
    ctx.arc(this.x + this.width * 0.7, eyeY, eyeRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + this.width * 0.7, eyeY, pupilRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#333";
    ctx.fill();
  }

  // 아이템 효과 등으로 패들 너비 변경 시 호출될 수 있는 메소드
  public setWidth(newWidth: number): void {
    // 너비 변경 시 x 위치를 조정하여 중앙을 유지하거나 한쪽을 기준으로 변경
    const diff = newWidth - this.width;
    this.x -= diff / 2; // 중앙 기준 변경
    this.width = newWidth;

    // 경계 재확인
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > this.canvasWidth) this.x = this.canvasWidth - this.width;
  }
}
