import { Component } from '@angular/core';
import { DefaultSettings } from 'src/app/automata-engine/defaultSettings';
import { ThreeService } from 'src/app/automata-engine/three-service';

@Component({
  selector: 'app-automata-cell-size-slider',
  templateUrl: './automata-cell-size-slider.component.html',
  styleUrls: ['./automata-cell-size-slider.component.scss'],
})
export class AutomataCellSizeSliderComponent {
  private _automataSize: number = DefaultSettings.pixelSize;
  private threeService: ThreeService;
  constructor(threeService: ThreeService) {
    this.threeService = threeService;
    this.threeService.getAutomataSizeObservable().subscribe((value) => {
      this._automataSize = value;
    });
  }
  set automataSize(automataSize: number) {
    this._automataSize = automataSize;
    this.threeService.resizeAutomata(automataSize);
  }
  get automataSize(): number {
    return this._automataSize;
  }
}
