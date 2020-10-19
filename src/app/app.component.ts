import { Component, OnInit } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { P5Service } from './automata-engine/p5-service';
import { Color } from './automata-engine/color';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {

  title = "AutomataJS";
  
    constructor(
      private matIconRegistry: MatIconRegistry,
      private domSanitizer: DomSanitizer,
      private p5Service: P5Service) {
      this.matIconRegistry.addSvgIcon(
        "automatajs",
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          "../assets/automatajs.svg"
        )
      );
      this.matIconRegistry.addSvgIcon(
        "github",
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          "../assets/github.svg"
        )
      );
      this.p5Service = p5Service;
    }
  
  onBackgroundColorChosen(color: Color) {
    this.p5Service.cellularAutomaton.defaultColor = color;
    this.p5Service.reDraw();
  }

  onActivationColorChosen(color: Color) {
    this.p5Service.cellularAutomaton.activationColor = color;
    this.p5Service.reDraw();
  }
}
