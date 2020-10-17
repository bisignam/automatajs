import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { RulesSelectorComponent } from "./automata-rules-selector/rules-selector.component";
import { AutomataControlComponent } from "./automata-control/automata-control.component";
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [RulesSelectorComponent, AutomataControlComponent],
  imports: [CommonModule, MatSelectModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatIconModule],
})
export class AutomataGuiModule {}
