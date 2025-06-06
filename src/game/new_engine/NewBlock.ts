import { BaseEntity, EntityUpdateProps, EntityRenderProps } from './BaseEntity';

export enum BlockType {
  Normal = 1,
  Strong = 2, // 두 번 맞아야 깨짐
  Unbreakable = 3, // 안깨짐
}

export class NewBlock extends BaseEntity {
  public points: number;
  public health: number;
  private initialHealth: number;
  public blockType: BlockType;
  private colors: { [key in BlockType]: string[] } = {
    [BlockType.Normal]: ['#AED9E0', '#93C6D3'], // Light Sky Blue
    [BlockType.Strong]: ['#FFDAB9', '#FFBFA0', '#FFA07A'], // Peach Puff / Light Salmon
    [BlockType.Unbreakable]: ['#B0C4DE', '#A0B4CE'], // Light Steel Blue
  };

  constructor(x: number, y: number, width: number, height: number, blockType: BlockType, points: number = 10) {
    super(x, y, width, height);
    this.blockType = blockType;
    this.points = points;

    switch(blockType) {
      case BlockType.Strong:
        this.health = 2; // 예시: 강한 블록은 체력 2
        break;
      case BlockType.Unbreakable:
        this.health = Infinity; // 안깨지는 블록
        break;
      case BlockType.Normal:
      default:
        this.health = 1;
        break;
    }
    this.initialHealth = this.health; // Store initial health for color logic
  }

  update(props: EntityUpdateProps): void {
    // 대부분의 블록은 스스로 업데이트하지 않음
    // 특별한 애니메이션 효과 등이 있다면 여기에 구현
  }

  render(props: EntityRenderProps): void {
    const { ctx } = props;
    if (this.isDestroyed) return;

    const colorSet = this.colors[this.blockType];
    // 체력에 따라 색상 변경 (Strong 타입의 경우)
    let currentColor = colorSet[0];
    if (this.blockType === BlockType.Strong && this.health < this.initialHealth && this.health > 0) { // Check health > 0
         // initialHealth가 2이고 health가 1이면, colorSet[2-1] = colorSet[1] (두번째 색)
         // initialHealth가 3이고 health가 2이면, colorSet[3-2] = colorSet[1]
         // initialHealth가 3이고 health가 1이면, colorSet[3-1] = colorSet[2]
         currentColor = colorSet[this.initialHealth - this.health] || colorSet[colorSet.length -1];
    }


    ctx.fillStyle = currentColor;
    // ctx.fillRect(this.x, this.y, this.width, this.height); // Replaced by rounded rect path

    // Rounded rectangle path
    const cornerRadius = 5;
    ctx.beginPath();
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

    // 간단한 내부 하이라이트/그림자 효과로 입체감 부여
    if (this.blockType !== BlockType.Unbreakable) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height / 3);
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(this.x + 2, this.y + this.height - this.height / 3 - 2, this.width - 4, this.height / 3);
    } else { // Unbreakable 블록은 좀 더 단단하게
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke(); // 둥근 사각형 테두리 다시 한번 강조
    }
  }

  public hit(): boolean { // boolean 반환: 파괴되었는지 여부
    if (this.blockType === BlockType.Unbreakable) {
      return false; // 안깨지는 블록은 아무 변화 없음
    }

    this.health--;
    if (this.health <= 0) {
      this.destroy(); // BaseEntity의 destroy 호출
      return true; // 파괴됨
    }
    return false; // 아직 파괴되지 않음 (체력만 감소)
  }
}
