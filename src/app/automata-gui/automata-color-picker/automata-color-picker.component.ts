import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import * as THREE from 'three';
import 'vanilla-colorful/hex-color-picker.js';

@Component({
  selector: 'app-color-picker',
  templateUrl: './automata-color-picker.component.html',
  styleUrls: ['./automata-color-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AutomataColorPickerComponent {
  @Input() label = '';
  private _color = '#ff0000';

  @Input()
  get color(): string {
    return this._color;
  }

  set color(color: string) {
    this._color = this.normalizeHex(color);
  }

  @Output('chosenColor')
  readonly colorChange = new EventEmitter<THREE.Color>();

  onColorChanged(event: Event): void {
    const detail = (event as CustomEvent<{ value: string }>).detail;
    const next = this.normalizeHex(detail?.value);
    if (next === this._color) {
      return;
    }
    this._color = next;
    this.colorChange.emit(new THREE.Color(next));
  }

  private normalizeHex(value?: string): string {
    const normalized = (value ?? '#ff0000').trim();
    return normalized.startsWith('#') ? normalized : `#${normalized}`;
  }
}
