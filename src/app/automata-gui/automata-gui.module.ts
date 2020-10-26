import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { RulesSelectorComponent } from "./automata-rules-selector/rules-selector.component";
import { AutomataControlComponent } from "./automata-control/automata-control.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AutomataColorPickerComponent } from "./automata-color-picker/automata-color-picker.component";
import { ColorPickerModule } from "ngx-color-picker";
import { MatSliderModule } from "@angular/material/slider";
import { AutomataCellSizeSliderComponent } from "./automata-cell-size-slider/automata-cell-size-slider.component";
import { AutomataCreatorComponent } from "./automata-creator/automata-creator.component";
import { MonacoEditorModule } from "ngx-monaco-editor";

@NgModule({
  declarations: [
    RulesSelectorComponent,
    AutomataControlComponent,
    AutomataColorPickerComponent,
    AutomataCellSizeSliderComponent,
    AutomataCreatorComponent,
  ],
  imports: [
    CommonModule,
    MatSelectModule,
    MatSliderModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    ColorPickerModule,
    MonacoEditorModule,
  ],
})
export class AutomataGuiModule {}
