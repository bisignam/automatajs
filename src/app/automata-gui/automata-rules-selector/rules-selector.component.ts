import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { BriansBrain } from "src/app/automata-rules/briansbrain";
import { Seeds } from "src/app/automata-rules/seeds";
import { GameOfLife } from "src/app/automata-rules/gameoflife";
import { CellularAutomaton } from "src/app/automata-engine/cellularautomaton";

interface Rule {
  value: CellularAutomaton;
  viewValue: string;
}

@Component({
  selector: "app-rules-selector",
  templateUrl: "./rules-selector.component.html",
})
export class RulesSelectorComponent {
  constructor() {}

  toppings = new FormControl();

  rules: Rule[] = [
    { value: new BriansBrain(), viewValue: "Brain's Brain" },
    { value: new Seeds(), viewValue: "Seeds" },
    { value: new GameOfLife(), viewValue: "Game Of Life" },
  ];
}
