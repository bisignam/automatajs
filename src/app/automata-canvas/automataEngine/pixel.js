export class Pixel {

    constructor(x, y, color, originalColor) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.originalColor = originalColor;
    }

    static fromPixel(anotherPixel) {
        return new Pixel(anotherPixel.x, anotherPixel.y, anotherPixel.color, anotherPixel.originalColor)
    }

    static XY(x, y) {
        return new Pixel(x, y, color(255, 255, 255, 255), color(255, 255, 255, 255));
    }

    static XYColor(x, y, c) {
        return new Pixel(x, y, c, c);
    }

}