import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Grid } from './grid';
import { CellularAutomaton } from './cellularautomaton';
import { AutomataRulesModule } from '../automata-rules/automata-rules.module';
import { BriansBrain } from '../automata-rules/briansbrain';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AutomataRulesModule
  ],
  exports: [
    Grid, BriansBrain
  ]
})
export class AutomataEngineModule { }
