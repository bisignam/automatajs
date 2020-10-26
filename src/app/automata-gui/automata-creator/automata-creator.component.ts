import { Component } from "@angular/core";

@Component({
  selector: "app-automata-creator",
  templateUrl: "./automata-creator.component.html",
  styleUrls: ["./automata-creator.component.scss"],
})
export class AutomataCreatorComponent {
  showFiller = false;
  editorOptions = { theme: "vs-dark", language: "javascript" };
  code = "ciao";
}
