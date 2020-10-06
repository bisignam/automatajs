import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core'
import { BriansBrain } from '../automata-rules/briansbrain'
import { P5Service } from '../automata-engine/p5-service'
import { Pixel } from '../automata-engine/pixel'
import { Color } from '../automata-engine/color'

@Component({
  selector: 'app-automata-canvas',
  templateUrl: './automata-canvas.component.html',
  styleUrls: ['./automata-canvas.component.scss'],
})
export class AutomataCanvasComponent implements OnInit {
  private p5Service: P5Service

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.p5Service = new P5Service(
      1,
      new Color(100, 0, 100, 255),
      this.el.nativeElement
    )
    this.p5Service.startAutomata(new BriansBrain(), this.oscillator(), 1)
  }

  oscillator(): Array<Pixel> {
    return [
      Pixel.XY(50, 50),
      Pixel.XY(50, 51),
      Pixel.XY(50, 52),
      Pixel.XY(51, 50),
    ]
  }
}
