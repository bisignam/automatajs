import { Component } from '@angular/core';
import { DefaultSettings } from 'src/app/automata-engine/defaultSettings';
import { ThreeService } from 'src/app/automata-engine/three-service';

@Component({
  selector: 'app-automata-fps-cap-slider',
  templateUrl: './automata-fps-cap-slider.component.html',
  styleUrls: ['./automata-fps-cap-slider.component.scss'],
})
export class AutomataFPSSliderComponent {
  private _fpsCap: number = DefaultSettings.fpsCap;
  private threeService: ThreeService;
  constructor(threeService: ThreeService) {
    this.threeService = threeService;
  }
  public get fpsCap(): number {
    return this._fpsCap;
  }
  public set fpsCap(value: number) {
    this._fpsCap = value;
    this.threeService.fpsCap = value;
  }
}
