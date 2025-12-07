import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { RulesSelectorComponent } from './automata-rules-selector/rules-selector.component';
import { AutomataControlComponent } from './automata-control/automata-control.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutomataColorPickerComponent } from './automata-color-picker/automata-color-picker.component';
import { AutomataCellSizeSliderComponent } from './automata-cell-size-slider/automata-cell-size-slider.component';
import { MatButtonModule } from '@angular/material/button';
import { AutomataFPSSliderComponent } from './automata-fps-slider/automata-fps-cap-slider.component';
import { LucideAngularModule } from 'lucide-angular';

@NgModule({
  exports: [
    RulesSelectorComponent,
    AutomataControlComponent,
    AutomataColorPickerComponent,
    AutomataCellSizeSliderComponent,
    AutomataFPSSliderComponent,
  ],
  declarations: [
    RulesSelectorComponent,
    AutomataControlComponent,
    AutomataColorPickerComponent,
    AutomataCellSizeSliderComponent,
    AutomataFPSSliderComponent,
  ],
  imports: [
    CommonModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    LucideAngularModule,
  ],
})
export class AutomataGuiModule {}
