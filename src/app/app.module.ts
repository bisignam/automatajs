import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AutomataCanvasComponent } from "./automata-canvas/automata-canvas.component";
import { RulesSelectorComponent } from "./automata-gui/automata-rules-selector/rules-selector.component";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatGridListModule } from "@angular/material/grid-list";
import { AutomataControlComponent } from "./automata-gui/automata-control/automata-control.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { HttpClientModule } from "@angular/common/http";
import { HeaderComponent } from "./header/header.component";

@NgModule({
  declarations: [
    AppComponent,
    AutomataCanvasComponent,
    RulesSelectorComponent,
    AutomataControlComponent,
    HeaderComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSelectModule,
    MatIconModule,
    MatGridListModule,
    MatToolbarModule,
    MatButtonModule,
    BrowserAnimationsModule,
    NgbModule,
    HttpClientModule, //needed for registering custom material icons
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
