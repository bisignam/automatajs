import { Component } from "@angular/core";
import { DefaultSettings } from "src/app/automata-engine/defaultSettings";
import { P5Service } from "src/app/automata-engine/p5-service";

@Component({
  selector: "app-automata-cell-size-slider",
  templateUrl: "./automata-cell-size-slider.component.html",
  styleUrls: ["./automata-cell-size-slider.component.scss"],
})
export class AutomataCellSizeSliderComponent {
  private _pixelSize: number = DefaultSettings.pixelSize;
  private p5Service: P5Service;
  constructor(p5Service: P5Service) {
    this.p5Service = p5Service;
    this.p5Service.getPixelSize().subscribe((value) => {
      this._pixelSize = value;
    });
  }
  set pixelSize(pixelSize: number) {
    this._pixelSize = pixelSize;
    this.p5Service.resizePixelsAndRedraw(pixelSize);
  }
  get pixelSize(): number {
    return this._pixelSize;
  }
}
