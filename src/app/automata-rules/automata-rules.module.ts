import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutomataEngineModule } from '../automata-engine/automata-engine.module';
import { BriansBrain } from './briansbrain';

@NgModule({
  declarations: [],
  exports: [
    BriansBrain
  ],
  imports: [
    CommonModule,
    AutomataEngineModule,
  ]
})
export class AutomataRulesModule { }
