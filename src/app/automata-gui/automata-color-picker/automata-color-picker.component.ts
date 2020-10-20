import { Component, Output, EventEmitter, Input } from "@angular/core";
import { Color } from "src/app/automata-engine/color";

@Component({
  selector: "app-color-picker",
  templateUrl: "./automata-color-picker.component.html",
  styleUrls: ["./automata-color-picker.component.scss"],
})
export class AutomataColorPickerComponent {
  private _color: Color;
  @Output()
  private chosenColor = new EventEmitter<Color>();

  @Input()
  get color(): string {
    return (
      "rgba(" +
      this._color.red +
      "," +
      this._color.green +
      "," +
      this._color.blue +
      "," +
      this._color.alpha +
      ")"
    );
  }

  set color(color: string) {
    const rgbaParts = color
      .replace("rgba(", "")
      .replace(")", "")
      .split(",")
      .map((element) => {
        return Number.parseFloat(element);
      });
    this._color = new Color(
      rgbaParts[0],
      rgbaParts[1],
      rgbaParts[2],
      rgbaParts[3]
    );
    this.chosenColor.emit(this._color);
  }
}
