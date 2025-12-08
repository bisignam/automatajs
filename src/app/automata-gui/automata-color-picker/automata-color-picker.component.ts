import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import 'vanilla-colorful/hex-color-picker.js';

@Component({
  selector: 'app-color-picker',
  templateUrl: './automata-color-picker.component.html',
  styleUrls: ['./automata-color-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AutomataColorPickerComponent implements AfterViewInit {
  @Input() label = '';
  private _color = '#ff0000';
  @ViewChild('hexPicker') set hexPickerRef(ref: ElementRef<HTMLElement> | undefined) {
    this.hexPickerEl = ref?.nativeElement;
    if (this.hexPickerEl) {
      this.suppressNextEvent = true;
    }
    this.scheduleHexPickerSync();
  }
  private hexPickerEl?: HTMLElement;
  private suppressNextEvent = false;
  private isReady = false;

  @Input()
  get color(): string {
    return this._color;
  }

  set color(color: string) {
    this._color = this.normalizeHex(color);
    this.suppressNextEvent = true;
    this.scheduleHexPickerSync();
  }

  @Output('chosenColor')
  readonly colorChange = new EventEmitter<THREE.Color>();

  ngAfterViewInit(): void {
    this.scheduleHexPickerSync();
    queueMicrotask(() => {
      this.isReady = true;
    });
  }

  onColorChanged(event: Event): void {
    const detail = (event as CustomEvent<{ value: string }>).detail;
    const next = this.normalizeHex(detail?.value);
    if (!this.isReady) {
      return;
    }
    if (this.suppressNextEvent) {
      this.suppressNextEvent = false;
      return;
    }
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

  private scheduleHexPickerSync(): void {
    queueMicrotask(() => {
      const picker = this.hexPickerEl as unknown as { color?: string } | undefined;
      if (picker && this._color && picker.color !== this._color) {
        picker.color = this._color;
      }
    });
  }
}
