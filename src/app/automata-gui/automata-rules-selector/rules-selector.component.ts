import { Component } from '@angular/core';
import { GameOfLife } from 'src/app/automata-rules/gameoflife';
import { CellularAutomaton } from 'src/app/automata-engine/cellularautomaton';
import { ThreeService } from 'src/app/automata-engine/three-service';
import { Seeds } from 'src/app/automata-rules/seeds';
import { BriansBrain } from 'src/app/automata-rules/briansbrain';
import { Maze } from 'src/app/automata-rules/maze';
import { DayAndNight } from 'src/app/automata-rules/dayandnight';

interface Rule {
  value: CellularAutomaton;
  viewValue: string;
}
@Component({
  selector: 'app-rules-selector',
  templateUrl: './rules-selector.component.html',
  styleUrls: ['./rules-selector.component.scss'],
})
export class RulesSelectorComponent {
  rules: Rule[] = [
    { value: new GameOfLife(), viewValue: 'Game Of Life' },
    { value: new BriansBrain(), viewValue: "Brian's Brain" },
    { value: new Seeds(), viewValue: 'Seeds' },
    { value: new Maze(), viewValue: 'Maze' },
    { value: new DayAndNight(), viewValue: 'Day And Night' },
  ];
  private threeService: ThreeService;
  private _selectedRule: CellularAutomaton = this.rules.find(
    (e) => e.viewValue === 'Game Of Life'
  ).value;

  constructor(p5Service: ThreeService) {
    this.threeService = p5Service;
  }

  get selectedRule(): CellularAutomaton {
    return this._selectedRule;
  }

  set selectedRule(rule: CellularAutomaton) {
    this._selectedRule = rule;
    this.threeService.setAutomataAndStopCurrent(rule);
  }
}
