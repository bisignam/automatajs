import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AutomataCanvasComponent } from './automata-engine/automata-canvas/automata-canvas.component';

@NgModule({
  declarations: [AppComponent, AutomataCanvasComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
