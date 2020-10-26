import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AutomataCanvasComponent } from "./automata-canvas/automata-canvas.component";
import { RulesSelectorComponent } from "./automata-gui/automata-rules-selector/rules-selector.component";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { AutomataControlComponent } from "./automata-gui/automata-control/automata-control.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { HttpClientModule } from "@angular/common/http";
import { HeaderComponent } from "./header/header.component";
import { ColorPickerModule } from "ngx-color-picker";
import { AutomataColorPickerComponent } from "./automata-gui/automata-color-picker/automata-color-picker.component";
import { MatSliderModule } from "@angular/material/slider";
import { AutomataCellSizeSliderComponent } from "./automata-gui/automata-cell-size-slider/automata-cell-size-slider.component";
import { MonacoEditorModule } from "ngx-monaco-editor";
import { MatSidenavModule } from "@angular/material/sidenav";
import { AutomataCreatorComponent } from "./automata-gui/automata-creator/automata-creator.component";

@NgModule({
  declarations: [
    AppComponent,
    AutomataColorPickerComponent,
    AutomataCanvasComponent,
    RulesSelectorComponent,
    AutomataControlComponent,
    HeaderComponent,
    AutomataColorPickerComponent,
    AutomataCellSizeSliderComponent,
    AutomataCreatorComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    ColorPickerModule,
    MatSliderModule,
    MatSidenavModule,
    MonacoEditorModule.forRoot(),
    BrowserAnimationsModule,
    NgbModule,
    HttpClientModule, //needed for registering custom material icons
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
