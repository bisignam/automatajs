import { Component, OnInit, ViewChild } from '@angular/core';
import * as p5 from 'p5';
import { CellularAutomaton } from '../cellularautomaton';
import { BriansBrain } from 'src/app/automata-rules/briansbrain';
import { Grid } from '../grid';
import { P5Service } from '../p5-service';
import { Pixel } from '../pixel';
import { GameOfLife } from 'src/app/automata-rules/gameoflife';
import { Seeds } from 'src/app/automata-rules/seeds';

@Component({
  selector: 'app-automata-canvas',
  templateUrl: './automata-canvas.component.html',
})
export class AutomataCanvasComponent implements OnInit {

  @ViewChild('automata')
  private node: HTMLDivElement;

  ngOnInit() {
    new P5Service(this.oscillator(), new BriansBrain(), this.node);
  }

  oscillator(): Array<Pixel> {
    return [Pixel.XY(50, 50), Pixel.XY(50, 51), Pixel.XY(50, 52), Pixel.XY(51, 50)]
  }

}
