import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { RulesSelectorComponent } from "./automata-rules-selector/rules-selector.component";
import { AutomataControlComponent } from "./automata-control/automata-control.component";
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutomataColorPickerComponent } from './automata-color-picker/automata-color-picker.component';
import { ColorPickerModule } from 'ngx-color-picker';


@NgModule({
  declarations: [RulesSelectorComponent, AutomataControlComponent, AutomataColorPickerComponent],
  imports: [CommonModule, MatSelectModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatIconModule, ColorPickerModule],
})
export class AutomataGuiModule {}
