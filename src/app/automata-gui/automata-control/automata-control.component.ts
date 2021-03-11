import { Component } from '@angular/core';
import { CellularAutomaton } from 'src/app/automata-engine/cellularautomaton';
import { ThreeService } from 'src/app/automata-engine/three-service';

@Component({
  selector: 'app-automata-control',
  templateUrl: './automata-control.component.html',
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
    this._started = false;
    this.threeService.reset();
  }
}
