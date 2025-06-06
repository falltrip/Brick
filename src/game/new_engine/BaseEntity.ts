export interface EntityRenderProps {
  ctx: CanvasRenderingContext2D;
}

export interface EntityUpdateProps {
  deltaTime: number;
  // 필요한 경우 다른 게임 상태나 입력 상태를 전달할 수 있음
  // 예: inputState: { [key: string]: boolean };
  //     gameSpeed: number;
}

export abstract class BaseEntity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isDestroyed: boolean = false; // 엔티티 제거 여부 플래그

  constructor(x: number, y: number, width: number, height: number) {
    this.id = crypto.randomUUID(); // 고유 ID 생성
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  // 엔티티의 로직 업데이트
  abstract update(props: EntityUpdateProps): void;

  // 엔티티 렌더링
  abstract render(props: EntityRenderProps): void;

  // 엔티티를 제거 상태로 표시
  destroy(): void {
    this.isDestroyed = true;
  }

  // 충돌 처리 (기본 구현은 비워두거나, 필요시 기본적인 바운딩 박스 충돌 감지 로직 추가)
  // onCollision(otherEntity: BaseEntity): void {
  //   // 기본 충돌 처리 로직 (선택 사항)
  // }
}
