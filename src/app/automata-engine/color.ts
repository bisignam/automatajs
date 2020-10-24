export class Color {
  red: number;
  green: number;
  blue: number;

  constructor(red: number, green: number, blue: number) {
    this.red = red;
    this.green = green;
    this.blue = blue;
  }

  equals(obj: Color): boolean {
    return (
      this.red === obj.red && this.green === obj.green && this.blue === obj.blue
    );
  }

  toRgbaString(): string {
    return "rgb(" + this.red + "," + this.green + "," + this.blue + ")";
  }

  static fromRgbaString(color: string): Color {
    const rgbaParts = color
      .replace("rgb(", "")
      .replace(")", "")
      .split(",")
      .map((element) => {
        return Number.parseFloat(element);
      });
    return new Color(rgbaParts[0], rgbaParts[1], rgbaParts[2]);
  }
}
