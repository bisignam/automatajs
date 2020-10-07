import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { RulesSelectorComponent } from "./automata-rules-selector/rules-selector.component";
import { AutomataControlComponent } from "./automata-control/automata-control.component";

@NgModule({
  declarations: [RulesSelectorComponent, AutomataControlComponent],
  imports: [CommonModule, MatSelectModule, MatIconModule],
})
export class AutomataGuiModule {}
