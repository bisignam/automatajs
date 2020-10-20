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

  toRgbaString(): string {
    return (
      "rgba(" +
      this.red +
      "," +
      this.green +
      "," +
      this.blue +
      "," +
      this.alpha +
      ")"
    );
  }

  static fromRgbaString(color: string): Color {
    const rgbaParts = color
      .replace("rgba(", "")
      .replace(")", "")
      .split(",")
      .map((element) => {
        return Number.parseFloat(element);
      });
    return new Color(rgbaParts[0], rgbaParts[1], rgbaParts[2], rgbaParts[3]);
  }
}
