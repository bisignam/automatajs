import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import { P5Service } from "../automata-engine/p5-service";

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
    this.p5Service.createCanvas(this.automataCanvasContainer.nativeElement);
  }
}
