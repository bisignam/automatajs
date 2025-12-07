import { Component } from '@angular/core';
import { ThreeService } from 'src/app/automata-engine/three-service';

interface RuleSelection {
  label: string;
  summary: string;
}

@Component({
  selector: 'app-automata-control',
  templateUrl: './automata-control.component.html',
  styleUrls: ['./automata-control.component.scss'],
  standalone: false,
})
export class AutomataControlComponent {
  private threeService: ThreeService;
  private _started = false;
  currentRuleLabel = 'Game Of Life';
  currentRuleSummary =
    'Conway’s classic lets gliders, blinkers, and guns party across the grid forever.';

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
    this.threeService.clear();
    this._started = false;
    this.threeService.stopAutomata();
  }

  onRuleChanged(selection: RuleSelection): void {
    if (!selection) {
      return;
    }
    this.currentRuleLabel = selection.label;
    this.currentRuleSummary = selection.summary;
  }
}
