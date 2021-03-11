import { Component, Output, EventEmitter, Input } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-color-picker',
  templateUrl: './automata-color-picker.component.html',
  styleUrls: ['./automata-color-picker.component.scss'],
})
export class AutomataColorPickerComponent {
  private _color: THREE.Color;
  @Output()
  private chosenColor = new EventEmitter<THREE.Color>();

  @Input()
  get color(): string {
    return '#' + this._color.getHexString();
  }

  set color(color: string) {
    //NOTE: when setting up the first time it seems the colors hex have no # prepended
    if (!color.startsWith('#')) {
      color = '#' + color;
    }
    this._color = new THREE.Color(color);
    this.chosenColor.emit(this._color);
  }
}
