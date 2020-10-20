import { Component } from "@angular/core";
import { BriansBrain } from "src/app/automata-rules/briansbrain";
import { Seeds } from "src/app/automata-rules/seeds";
import { GameOfLife } from "src/app/automata-rules/gameoflife";
import { CellularAutomaton } from "src/app/automata-engine/cellularautomaton";
import { P5Service } from "src/app/automata-engine/p5-service";

interface Rule {
  value: CellularAutomaton;
  viewValue: string;
}

@Component({
  selector: "app-rules-selector",
  templateUrl: "./rules-selector.component.html",
  styleUrls: ["./rules-selector.component.scss"],
})
export class RulesSelectorComponent {
  rules: Rule[] = [
    { value: new BriansBrain(), viewValue: "Brian's Brain" },
    { value: new Seeds(), viewValue: "Seeds" },
    { value: new GameOfLife(), viewValue: "Game Of Life" },
  ];
  private p5Service: P5Service;
  private _selectedRule: CellularAutomaton = this.rules.find(
    (e) => e.viewValue === "Brian's Brain"
  ).value;

  constructor(p5Service: P5Service) {
    this.p5Service = p5Service;
  }

  get selectedRule(): CellularAutomaton {
    return this._selectedRule;
  }

  set selectedRule(rule: CellularAutomaton) {
    this._selectedRule = rule;
    this.p5Service.setAutomataAndStopCurrent(rule);
  }
}
