import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ThreeService } from '../automata-engine/three-service';

@Component({
  selector: 'app-automata-canvas',
  templateUrl: './automata-canvas.component.html',
  styleUrls: ['./automata-canvas.component.scss'],
  standalone: false,
})
export class AutomataCanvasComponent implements AfterViewInit {
  @ViewChild('automataCanvasContainer')
  automataCanvasContainer: ElementRef;
  threeService: ThreeService;

  constructor(threeService: ThreeService) {
    this.threeService = threeService;
  }

  ngAfterViewInit(): void {
    this.threeService.setup(this.automataCanvasContainer);
  }
}
