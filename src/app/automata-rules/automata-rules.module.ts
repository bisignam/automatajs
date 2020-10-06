import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AutomataEngineModule } from '../automata-engine/automata-engine.module'
import { BriansBrain } from './briansbrain'
import { Seeds } from './seeds'
import { GameOfLife } from './gameoflife'

@NgModule({
  declarations: [],
  exports: [BriansBrain, Seeds, GameOfLife],
  imports: [CommonModule, AutomataEngineModule],
})
export class AutomataRulesModule {}
