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
  standalone: false,
})
export class AppComponent {
  title = 'AutomataJS';
  backgroundColor = DefaultSettings.backgroundColor;
  activationColor = DefaultSettings.activationColor;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private threeService: ThreeService,
  ) {
    this.matIconRegistry.addSvgIcon(
      'automatajs',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/automatajs.svg',
      ),
    );
    this.matIconRegistry.addSvgIcon(
      'github',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/github.svg'),
    );
    this.threeService = threeService;
    this.threeService.activeColor = this.activationColor;
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
