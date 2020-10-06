import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { NgModule } from '@angular/core'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { AutomataCanvasComponent } from './automata-canvas/automata-canvas.component'
import { RulesSelectorComponent } from './automata-gui/automata-rules-selector/rules-selector.component'
import { MatSelectModule } from '@angular/material/select'
import { MatIconModule } from '@angular/material/icon'
import { MatGridListModule } from '@angular/material/grid-list'
import { AutomataControlComponent } from './automata-gui/automata-control/automata-control.component'

@NgModule({
  declarations: [
    AppComponent,
    AutomataCanvasComponent,
    RulesSelectorComponent,
    AutomataControlComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSelectModule,
    MatIconModule,
    MatGridListModule,
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
