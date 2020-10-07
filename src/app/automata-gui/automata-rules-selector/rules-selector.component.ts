import { Component } from "@angular/core";
import { BriansBrain } from "src/app/automata-rules/briansbrain";
import { Seeds } from "src/app/automata-rules/seeds";
import { GameOfLife } from "src/app/automata-rules/gameoflife";
import { CellularAutomaton } from "src/app/automata-engine/cellularautomaton";
import { P5Service } from "src/app/automata-engine/p5-service";
import { MatSelectChange } from "@angular/material/select";

interface Rule {
  value: CellularAutomaton;
  viewValue: string;
}

@Component({
  selector: "app-rules-selector",
  templateUrl: "./rules-selector.component.html",
})
export class RulesSelectorComponent {
  rules: Rule[] = [
    { value: new BriansBrain(), viewValue: "Brain's Brain" },
    { value: new Seeds(), viewValue: "Seeds" },
    { value: new GameOfLife(), viewValue: "Game Of Life" },
  ];
  private p5Service: P5Service;

  constructor(p5Service: P5Service) {
    this.p5Service = p5Service;
  }

  selectRule(event: MatSelectChange): void {
    this.p5Service.setAutomataAndStopCurrent(event.value);
  }
}
