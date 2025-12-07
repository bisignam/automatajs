import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
  summary: string;
}
@Component({
  selector: 'app-rules-selector',
  templateUrl: './rules-selector.component.html',
  styleUrls: ['./rules-selector.component.scss'],
  standalone: false,
})
export class RulesSelectorComponent implements OnInit {
  @Output()
  ruleChanged = new EventEmitter<{ label: string; summary: string }>();
  rules: Rule[] = [
    {
      value: new GameOfLife(),
      viewValue: 'Game Of Life',
      summary: 'A balanced playground of gliders, blinkers, and spaceships that never stop surprising you.',
    },
    {
      value: new BriansBrain(),
      viewValue: "Brian's Brain",
      summary: 'Two-phase neurons fire and fade like neon synapses, leaving dreamy shockwaves behind.',
    },
    {
      value: new Seeds(),
      viewValue: 'Seeds',
      summary: 'Cells only live for a single tick, so every tap erupts into pixel fireworks.',
    },
    {
      value: new Maze(),
      viewValue: 'Maze',
      summary: 'Birth rules carve right-angled corridors until the grid becomes a maze wallpaper.',
    },
    {
      value: new DayAndNight(),
      viewValue: 'Day And Night',
      summary: 'Alive and dead cells can swap places without breaking symmetry, creating yin–yang ripples.',
    },
  ];
  private threeService: ThreeService;
  private _selectedRule: CellularAutomaton = this.rules.find(
    (e) => e.viewValue === 'Game Of Life',
  ).value;

  constructor(p5Service: ThreeService) {
    this.threeService = p5Service;
  }

  get selectedRule(): CellularAutomaton {
    return this._selectedRule;
  }

  ngOnInit(): void {
    this.emitRuleDetails(this._selectedRule);
  }

  set selectedRule(rule: CellularAutomaton) {
    this._selectedRule = rule;
    this.threeService.setAutomataAndStopCurrent(rule);
    this.emitRuleDetails(rule);
  }

  private emitRuleDetails(rule: CellularAutomaton): void {
    const meta = this.rules.find((candidate) => candidate.value === rule);
    if (meta) {
      this.ruleChanged.emit({ label: meta.viewValue, summary: meta.summary });
    }
  }
}
