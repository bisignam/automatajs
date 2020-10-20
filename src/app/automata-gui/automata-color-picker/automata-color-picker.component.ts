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
    return this._color.toRgbaString();
  }

  set color(color: string) {
    this._color = Color.fromRgbaString(color);
    this.chosenColor.emit(this._color);
  }
}
