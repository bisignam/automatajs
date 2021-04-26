import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { AdditionalColorType } from 'src/app/automata-engine/cellularautomaton';
import { DefaultSettings } from 'src/app/automata-engine/defaultSettings';
import { ThreeService } from '../../automata-engine/three-service';

@Component({
  selector: 'app-automata-canvas',
  templateUrl: './automata-canvas.component.html',
  styleUrls: ['./automata-canvas.component.scss'],
})
export class AutomataCanvasComponent implements AfterViewInit {
  @ViewChild('automataCanvasContainer')
  automataCanvasContainer: ElementRef;
  threeService: ThreeService;
  hover: boolean;
  backgroundColor = DefaultSettings.backgroundColor;
  activationColor = DefaultSettings.activationColor;

  constructor(threeService: ThreeService) {
    this.threeService = threeService;
  }

  ngAfterViewInit(): void {
    this.threeService.setup(this.automataCanvasContainer);
  }

  toggleHover() {
    this.hover = true;
  }

  removeHover() {
    this.hover = false;
  }

  onBackgroundColorChosen(color: THREE.Color): void {
    this.threeService.deadColor = color;
  }

  onActivationColorChosen(color: THREE.Color): void {
    this.threeService.activeColor = color;
  }

  onAutomataColorChosen(displayName: string, color: THREE.Color): void {
    if (this.threeService.cellularAutomaton) {
      this.threeService.changeColor(displayName, color);
    }
  }

  getAdditionalColorsForAutomata(): Iterable<AdditionalColorType> {
    if (this.threeService.cellularAutomaton) {
      return this.threeService.cellularAutomaton.additionalColorsArray;
    }
    return new Array<AdditionalColorType>();
  }
}
