import { Component } from "@angular/core";
import { P5Service } from "src/app/automata-engine/p5-service";

@Component({
  selector: "app-automata-control",
  templateUrl: "./automata-control.component.html",
})
export class AutomataControlComponent {
  private p5Service: P5Service;

  constructor(p5Service: P5Service) {
    this.p5Service = p5Service;
  }

  playAutomata(): void {
    this.p5Service.startAutomata(100); //TODO Parametrize maxStep
  }

  stopAutomata(): void {
    this.p5Service.stopAutomata();
  }
}
