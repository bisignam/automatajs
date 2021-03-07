import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ThreeService } from './automata-engine/three-service';
import { AdditionalColorType } from './automata-engine/cellularautomaton';
import { DefaultSettings } from './automata-engine/defaultSettings';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'AutomataJS';
  backgroundColor = DefaultSettings.backgroundColor;
  gridColor = DefaultSettings.gridColor;
  activationColor = DefaultSettings.activationColor;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private threeService: ThreeService
  ) {
    this.matIconRegistry.addSvgIcon(
      'automatajs',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/automatajs.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'github',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/github.svg')
    );
    this.threeService = threeService;
    this.threeService.activeColor = this.activationColor;
  }

  onBackgroundColorChosen(color: THREE.Color): void {
    this.threeService.deadColor = color;
  }

  onGridColorChosen(color: THREE.Color): void {
    //   if (this.threeService.grid) {
    //  //   this.threeService.grid.gridColor = color;
    //     this.threeService.reDraw();
    //   }
  }

  onActivationColorChosen(color: THREE.Color): void {
    this.threeService.activeColor = color;
  }

  onAutomataColorChosen(name: string, color: THREE.Color): void {
    // if (this.threeService.cellularAutomaton) {
    //   this.threeService.cellularAutomaton.setAdditionalColor(name, color);
    // }
  }

  getAdditionalColorsForAutomata(): Array<AdditionalColorType> {
    // if (this.threeService.cellularAutomaton) {
    //   return this.threeService.cellularAutomaton.additionalColors;
    // }
    return new Array<AdditionalColorType>();
  }
}
