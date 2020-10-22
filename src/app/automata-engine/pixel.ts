import { Color } from "./color";

export class Pixel {
  private x: number;
  private y: number;
  private color: Color;
  private originalColor: Color;

  constructor(x: number, y: number, color: Color, originalColor: Color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.originalColor = originalColor;
  }

  static fromPixel(anotherPixel: Pixel): Pixel {
    return new Pixel(
      anotherPixel.x,
      anotherPixel.y,
      anotherPixel.color,
      anotherPixel.originalColor
    );
  }

  static XY(x: number, y: number): Pixel {
    return new Pixel(
      x,
      y,
      new Color(255, 255, 255, 1),
      new Color(255, 255, 255, 1)
    );
  }

  static XYColor(x: number, y: number, c: Color): Pixel {
    return new Pixel(x, y, c, new Color(0, 0, 0, 0));
  }

  setColor(color: Color): void {
    this.color = color;
  }

  getColor(): Color {
    return this.color;
  }

  getOriginalColor(): Color {
    return this.originalColor;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }
}
