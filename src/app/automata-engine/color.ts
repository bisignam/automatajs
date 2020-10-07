export class Color {
  red: number;
  green: number;
  blue: number;
  alpha: number;

  constructor(red: number, green: number, blue: number, alpha: number) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }

  equals(obj: Color): boolean {
    return (
      this.red === obj.red &&
      this.green === obj.green &&
      this.blue === obj.blue &&
      this.alpha === obj.alpha
    );
  }
}
