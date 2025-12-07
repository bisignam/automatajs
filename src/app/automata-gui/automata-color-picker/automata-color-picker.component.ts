import { Component, Output, EventEmitter, Input } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-color-picker',
  templateUrl: './automata-color-picker.component.html',
  styleUrls: ['./automata-color-picker.component.scss'],
  standalone: false,
})
export class AutomataColorPickerComponent {
  private _color: THREE.Color = new THREE.Color('#000000');
  @Output()
  private chosenColor = new EventEmitter<THREE.Color>();

  @Input()
  get color(): string {
    return '#' + this._color.getHexString();
  }

  set color(color: string) {
    this._color = this.parseColor(color);
  }

  onColorPickerChange(value: string): void {
    this._color = this.parseColor(value);
    this.chosenColor.emit(this._color.clone());
  }

  private parseColor(rawColor: string): THREE.Color {
    if (!rawColor) {
      return new THREE.Color('#000000');
    }
    const normalized = rawColor.startsWith('#') ? rawColor : `#${rawColor}`;
    return new THREE.Color(normalized);
  }
}
