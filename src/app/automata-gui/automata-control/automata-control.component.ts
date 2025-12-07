import { Component } from '@angular/core';
import { ThreeService } from 'src/app/automata-engine/three-service';

@Component({
  selector: 'app-automata-control',
  templateUrl: './automata-control.component.html',
  standalone: false,
})
export class AutomataControlComponent {
  private threeService: ThreeService;
  private _started: boolean;

  constructor(threeService: ThreeService) {
    this.threeService = threeService;
  }

  get started(): boolean {
    return this._started;
  }

  playAutomata(): void {
    this._started = true;
    this.threeService.startAutomata(100); //TODO Parametrize maxStep
  }

  stopAutomata(): void {
    this._started = false;
    this.threeService.stopAutomata();
  }

  clearGrid(): void {
    let previousActiveColor = this.threeService.clear();
    this._started = false;
    this.threeService.stopAutomata();
  }
}
