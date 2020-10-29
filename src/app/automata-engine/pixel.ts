import { CellularAutomaton } from "./cellularautomaton";
import { Color } from "./color";

export class Pixel {
  private x: number;
  private y: number;
  private color: Color;
  private originalColor: Color;
  private _colorBeforeRuleApplication: Color;

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

  applyRule(rule: CellularAutomaton): void {
    this._colorBeforeRuleApplication = this.color;
    this.color = rule.applyRule(this.x, this.y);
  }

  static XY(x: number, y: number): Pixel {
    return new Pixel(x, y, new Color(255, 255, 255), new Color(255, 255, 255));
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

  setOriginalColor(originalColor: Color): void {
    this.originalColor = originalColor;
  }

  get colorBeforeRuleApplication(): Color {
    return this._colorBeforeRuleApplication;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }
}
