import { Component } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { P5Service } from "./automata-engine/p5-service";
import { Color } from "./automata-engine/color";
import { AdditionalColorType } from "./automata-engine/cellularautomaton";
import { DefaultSettings } from "./automata-engine/defaultSettings";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "AutomataJS";
  backgroundColor = DefaultSettings.backgroundColor;
  gridColor = DefaultSettings.gridColor;
  activationColor = DefaultSettings.activationColor;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private p5Service: P5Service
  ) {
    this.matIconRegistry.addSvgIcon(
      "automatajs",
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        "../assets/automatajs.svg"
      )
    );
    this.matIconRegistry.addSvgIcon(
      "github",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/github.svg")
    );
    this.p5Service = p5Service;
    this.p5Service.cellularAutomaton.activationColor = this.activationColor;
  }

  onBackgroundColorChosen(color: Color): void {
    if (this.p5Service.grid) {
      this.p5Service.grid.backgroundColor = color;
      this.p5Service.reDraw();
    }
  }

  onGridColorChosen(color: Color): void {
    if (this.p5Service.grid) {
      this.p5Service.grid.gridColor = color;
      this.p5Service.reDraw();
    }
  }

  onActivationColorChosen(color: Color): void {
    if (this.p5Service.cellularAutomaton) {
      this.p5Service.cellularAutomaton.activationColor = color;
      this.p5Service.reDraw();
    }
  }

  onAutomataColorChosen(name: string, color: Color): void {
    if (this.p5Service.cellularAutomaton) {
      this.p5Service.cellularAutomaton.setAdditionalColor(name, color);
    }
  }

  getAdditionalColorsForAutomata(): Array<AdditionalColorType> {
    if (this.p5Service.cellularAutomaton) {
      return this.p5Service.cellularAutomaton.additionalColors;
    }
    return new Array<AdditionalColorType>();
  }
}
