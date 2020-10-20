import { Component } from "@angular/core";
import { P5Service } from "src/app/automata-engine/p5-service";
// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import { ColorPickerModule } from "ngx-color-picker";

@Component({
  selector: "app-automata-control",
  templateUrl: "./automata-control.component.html",
})
export class AutomataControlComponent {
  private p5Service: P5Service;
  private _started: boolean;

  constructor(p5Service: P5Service) {
    this.p5Service = p5Service;
  }

  get started(): boolean {
    return this._started;
  }

  playAutomata(): void {
    this._started = true;
    this.p5Service.startAutomata(100); //TODO Parametrize maxStep
  }

  stopAutomata(): void {
    this._started = false;
    this.p5Service.stopAutomata();
  }

  clearGrid(): void {
    this._started = false;
    this.p5Service.clearGrid();
  }
}
