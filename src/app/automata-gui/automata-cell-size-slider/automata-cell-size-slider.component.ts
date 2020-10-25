import { Component, OnInit } from "@angular/core";
import { P5Service } from "src/app/automata-engine/p5-service";

@Component({
  selector: "app-automata-cell-size-slider",
  templateUrl: "./automata-cell-size-slider.component.html",
  styleUrls: ["./automata-cell-size-slider.component.scss"],
})
export class AutomataCellSizeSliderComponent {
  _pixelSize = 10;
  private p5Service: P5Service;
  constructor(p5Service: P5Service) {
    this.p5Service = p5Service;
  }
  set pixelSize(pixelSize: number) {
    this._pixelSize = pixelSize;
    this.p5Service.grid.pixelSize = pixelSize;
    this.p5Service.reDraw();
  }
  get pixelSize(): number {
    return this._pixelSize;
  }
}
