import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { RulesSelectorComponent } from './automata-rules-selector/rules-selector.component';
import { AutomataControlComponent } from './automata-control/automata-control.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutomataColorPickerComponent } from './automata-color-picker/automata-color-picker.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';
import { AutomataCellSizeSliderComponent } from './automata-cell-size-slider/automata-cell-size-slider.component';
import { MatButtonModule } from '@angular/material/button';
import { AutomataFPSSliderComponent } from './automata-fps-slider/automata-fps-cap-slider.component';

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
    MatCardModule,
    MatSliderModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    ColorPickerModule,
    MatButtonModule,
  ],
})
export class AutomataGuiModule {}
