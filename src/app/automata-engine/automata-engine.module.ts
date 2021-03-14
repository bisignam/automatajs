import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutomataRulesModule } from '../automata-rules/automata-rules.module';
import { BriansBrain } from '../automata-rules/briansbrain';

@NgModule({
  declarations: [],
  imports: [CommonModule, AutomataRulesModule],
  exports: [BriansBrain],
})
export class AutomataEngineModule {}
