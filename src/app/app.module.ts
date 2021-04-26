import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AutomataCanvasComponent } from './automata-gui/automata-canvas/automata-canvas.component';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { AutomataControlComponent } from './automata-gui/automata-control/automata-control.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './header/header.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { MatSliderModule } from '@angular/material/slider';
import { AutomataGuiModule } from './automata-gui/automata-gui.module';

@NgModule({
  declarations: [AppComponent, AutomataCanvasComponent, HeaderComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    ColorPickerModule,
    AutomataGuiModule,
    MatSliderModule,
    BrowserAnimationsModule,
    NgbModule,
    HttpClientModule, //needed for registering custom material icons
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
