import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutomataEngineModule } from '../automata-engine/automata-engine.module';
import { GameOfLife } from './gameoflife';
import { BriansBrain } from './briansbrain';
import { Maze } from './maze';
import { DayAndNight } from './dayandnight';
import { Seeds } from './seeds';
@NgModule({
  declarations: [],
  exports: [GameOfLife, BriansBrain, Maze, DayAndNight, Seeds],
  imports: [CommonModule, AutomataEngineModule],
})
export class AutomataRulesModule {}
