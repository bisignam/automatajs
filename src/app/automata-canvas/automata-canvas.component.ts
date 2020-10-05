import { Component, OnInit, ViewChild } from '@angular/core';

import * as p5 from 'p5';

import * as automataEngine from './automataEngine';

@Component({
  selector: 'app-automata-canvas',
  templateUrl: './automata-canvas.component.html',
  styleUrls: ['./automata-canvas.component.scss'],
})
export class AutomataCanvasComponent implements OnInit {
  constructor() {}

  @ViewChild('automata')
  private node: HTMLDivElement;

  createSketch(node: HTMLDivElement) {
    new p5((p) => {
      let x = 100;
      let y = 100;

      p.setup = () => {
        p.createCanvas(700, 410);
      };

      p.draw = () => {
        p.background(0);
        p.fill(255);
        p.rect(x, y, 50, 50);
      };
    }, node);
  }

  ngOnInit() {
    this.createSketch(this.node);
  }
}
