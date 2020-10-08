import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import { P5Service } from "../automata-engine/p5-service";
import { Color } from "../automata-engine/color";

@Component({
  selector: "app-automata-canvas",
  templateUrl: "./automata-canvas.component.html",
  styleUrls: ["./automata-canvas.component.scss"],
})
export class AutomataCanvasComponent implements AfterViewInit {
  @ViewChild("automataCanvasContainer")
  automataCanvasContainer: ElementRef;
  p5Service: P5Service;

  constructor(p5Service: P5Service) {
    this.p5Service = p5Service;
  }

  ngAfterViewInit(): void {
    this.p5Service.createCanvas(
      new Color(0, 0, 0, 255),
      this.automataCanvasContainer.nativeElement
    );
  }
}
