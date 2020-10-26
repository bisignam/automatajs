import { Color } from "./color";

export class Pixel {
  private x: number;
  private y: number;
  private _color: Color;
  private _originalColor: Color;

  constructor(x: number, y: number, color: Color, originalColor: Color) {
    this.x = x;
    this.y = y;
    this._color = color;
    this._originalColor = originalColor;
  }

  static fromPixel(anotherPixel: Pixel): Pixel {
    return new Pixel(
      anotherPixel.x,
      anotherPixel.y,
      anotherPixel._color,
      anotherPixel._originalColor
    );
  }

  static XY(x: number, y: number): Pixel {
    return new Pixel(x, y, new Color(255, 255, 255), new Color(255, 255, 255));
  }

  //TODO migrate to standard getters and setters
  setColor(color: Color): void {
    this._color = color;
  }

  //TODO migrate to standard setters and getters
  getColor(): Color {
    return this._color;
  }

  //TODO migrate to standard setters and getters
  getOriginalColor(): Color {
    return this._originalColor;
  }

  //TODO migrate to standard setters and getters
  getX(): number {
    return this.x;
  }

  //TODO migrate to standard setters and getters
  getY(): number {
    return this.y;
  }

  get originalColor(): Color {
    return this._originalColor;
  }

  set originalColor(originalColor: Color) {
    this._originalColor = originalColor;
  }

  get color(): Color {
    return this._color;
  }

  set color(color: Color) {
    this._color = color;
  }
}
