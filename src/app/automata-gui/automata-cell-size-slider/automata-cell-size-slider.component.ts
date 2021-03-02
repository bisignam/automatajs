import { Component } from "@angular/core";
import { DefaultSettings } from "src/app/automata-engine/defaultSettings";
import { ThreeService } from "src/app/automata-engine/three-service";

@Component({
  selector: "app-automata-cell-size-slider",
  templateUrl: "./automata-cell-size-slider.component.html",
  styleUrls: ["./automata-cell-size-slider.component.scss"],
})
export class AutomataCellSizeSliderComponent {
  private _pixelSize: number = DefaultSettings.pixelSize;
  private threeService: ThreeService;
  constructor(p5Service: ThreeService) {
    this.threeService = p5Service;
    this.threeService.getPixelSize().subscribe((value) => {
      this._pixelSize = value;
    });
  }
  set pixelSize(pixelSize: number) {
    this._pixelSize = pixelSize;
    //this.threeService.resizePixelsAndRedraw(pixelSize);
  }
  get pixelSize(): number {
    return this._pixelSize;
  }
}
