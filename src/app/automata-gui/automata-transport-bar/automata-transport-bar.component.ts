import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DefaultSettings } from '../../automata-engine/defaultSettings';
import { SimulationStatus } from '../ui-state';

@Component({
  selector: 'app-automata-transport-bar',
  templateUrl: './automata-transport-bar.component.html',
  styleUrls: ['./automata-transport-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, MatIconModule],
})
export class AutomataTransportBarComponent {
  @Input() status: SimulationStatus = 'idle';
  @Input() speed: number = DefaultSettings.fpsCap;

  @Output() play = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();
  @Output() step = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
  @Output() speedChange = new EventEmitter<number>();

  get isRunning(): boolean {
    return this.status === 'running';
  }

  onTogglePlay(): void {
    if (this.isRunning) {
      this.pause.emit();
      return;
    }
    this.play.emit();
  }

  onSpeedInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.valueAsNumber;
    if (!Number.isFinite(value)) {
      return;
    }
    this.speedChange.emit(value);
  }
}
