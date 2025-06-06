export abstract class Entity {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  abstract render(ctx: CanvasRenderingContext2D): void;
}