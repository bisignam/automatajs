import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { AdditionalColorType, CellularAutomaton } from 'src/app/automata-engine/cellularautomaton';
import { DefaultSettings } from 'src/app/automata-engine/defaultSettings';
import { ThreeService } from 'src/app/automata-engine/three-service';
import { BriansBrain } from 'src/app/automata-rules/briansbrain';
import { DayAndNight } from 'src/app/automata-rules/dayandnight';
import { GameOfLife } from 'src/app/automata-rules/gameoflife';
import { Maze } from 'src/app/automata-rules/maze';
import { Seeds } from 'src/app/automata-rules/seeds';
import { SimulationConfig, SimulationStatus, UiState, UiTab } from '../ui-state';

interface RulePreset {
  id: string;
  label: string;
  summary: string;
  automaton: CellularAutomaton;
}

@Component({
  selector: 'app-automata-control',
  templateUrl: './automata-control.component.html',
  styleUrls: ['./automata-control.component.scss'],
  standalone: false,
})
export class AutomataControlComponent implements OnChanges {
  @ViewChild('ruleCarousel') private ruleCarousel?: ElementRef<HTMLDivElement>;
  private ruleCarouselIndex = 0;
  @Input() config: SimulationConfig = {
    speed: DefaultSettings.fpsCap,
    cellSize: DefaultSettings.pixelSize,
  };
  @Output() configChange = new EventEmitter<SimulationConfig>();

  @Input() status: SimulationStatus = 'idle';
  @Output() statusChange = new EventEmitter<SimulationStatus>();
  @Input() autoImmersivePreference: 'unknown' | 'enabled' | 'disabled' = 'unknown';
  @Output() autoImmersivePreferenceChange = new EventEmitter<'enabled' | 'disabled'>();

  @Input() uiState?: UiState;
  @Output() uiStateChange = new EventEmitter<Partial<UiState>>();

  readonly tabs: { id: UiTab; label: string }[] = [
    { id: 'presets', label: 'Presets' },
    { id: 'rule', label: 'Rule' },
    { id: 'visual', label: 'Visual' },
    { id: 'grid', label: 'Grid' },
  ];

  readonly rulePresets: RulePreset[] = [
    {
      id: 'life',
      label: 'Game of Life',
      summary: 'Conway’s playground of gliders, blinkers, and glider guns.',
      automaton: new GameOfLife(),
    },
    {
      id: 'brians-brain',
      label: "Brian's Brain",
      summary: 'Neurons fire once, then fade like neon trails.',
      automaton: new BriansBrain(),
    },
    {
      id: 'seeds',
      label: 'Seeds',
      summary: 'Hyper-reactive cells ignite and disappear every tick.',
      automaton: new Seeds(),
    },
    {
      id: 'maze',
      label: 'Maze',
      summary: 'Birth rules carve angular corridors until a maze appears.',
      automaton: new Maze(),
    },
    {
      id: 'day-night',
      label: 'Day & Night',
      summary: 'Symmetric births keep yin-yang ripples balanced.',
      automaton: new DayAndNight(),
    },
  ];

  selectedPreset: RulePreset = this.rulePresets[0];
  backgroundColor: THREE.Color = DefaultSettings.backgroundColor.clone();
  activationColor: THREE.Color = DefaultSettings.activationColor.clone();

  constructor(private readonly three: ThreeService) {
    this.syncConfigToEngine();
    this.applyPreset(this.selectedPreset, false);
    this.syncColorsWithEngine();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && !changes['config'].firstChange) {
      this.syncConfigToEngine();
    }
  }

  get activeTab(): UiTab {
    return this.uiState?.activeTab ?? 'presets';
  }

  get isRunning(): boolean {
    return this.status === 'running';
  }

  get playIconClass(): string {
    switch (this.status) {
      case 'running':
        return 'play-icon--running';
      case 'paused':
        return 'play-icon--paused';
      default:
        return 'play-icon--idle';
    }
  }

  get additionalColors(): Iterable<AdditionalColorType> {
    if (this.three.cellularAutomaton) {
      return this.three.cellularAutomaton.additionalColorsArray;
    }
    return [];
  }

  handlePlayRequest(): void {
    this.syncConfigToEngine();
    this.three.startAutomata(100);
    this.statusChange.emit('running');
  }

  handlePauseRequest(): void {
    this.three.stopAutomata();
    this.statusChange.emit('paused');
  }

  handleResetRequest(): void {
    this.three.stopAutomata();
    void this.three.reset();
    this.statusChange.emit('idle');
  }

  handleStepRequest(): void {
    this.three.forwardAndDisplay();
    this.statusChange.emit('paused');
  }

  onAutoImmersiveToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.autoImmersivePreferenceChange.emit(checked ? 'enabled' : 'disabled');
  }

  togglePlay(): void {
    if (this.isRunning) {
      this.handlePauseRequest();
      return;
    }
    this.handlePlayRequest();
  }

  setActiveTab(tab: UiTab): void {
    if (tab === this.activeTab) {
      return;
    }
    this.uiStateChange.emit({ activeTab: tab, lastUserInteractionAt: Date.now() });
  }

  selectPreset(preset: RulePreset): void {
    this.applyPreset(preset, true);
    const presetIndex = this.rulePresets.findIndex((rule) => rule.id === preset.id);
    if (presetIndex >= 0) {
      this.ruleCarouselIndex = presetIndex;
      this.scrollToCarouselIndex(presetIndex);
    }
  }

  scrollCarousel(direction: number): void {
    const viewport = this.ruleCarousel?.nativeElement;
    if (!viewport) {
      return;
    }
    const pills = Array.from(viewport.querySelectorAll<HTMLButtonElement>('.rule-pill'));
    if (!pills.length) {
      return;
    }
    this.ruleCarouselIndex = Math.min(Math.max(this.ruleCarouselIndex + direction, 0), pills.length - 1);
    this.scrollToCarouselIndex(this.ruleCarouselIndex);
  }

  private scrollToCarouselIndex(index: number, behavior: ScrollBehavior = 'smooth'): void {
    const viewport = this.ruleCarousel?.nativeElement;
    if (!viewport) {
      return;
    }
    const pills = viewport.querySelectorAll<HTMLButtonElement>('.rule-pill');
    const pill = pills.item(index);
    if (!pill) {
      return;
    }
    pill.scrollIntoView({ behavior, inline: 'start', block: 'nearest' });
  }

  onSpeedChange(event: Event): void {
    const speed = (event.target as HTMLInputElement).valueAsNumber;
    if (!Number.isFinite(speed)) {
      return;
    }
    this.config = { ...this.config, speed };
    this.configChange.emit(this.config);
    this.three.fpsCap = speed;
  }

  onCellSizeChange(event: Event): void {
    const cellSize = (event.target as HTMLInputElement).valueAsNumber;
    if (!Number.isFinite(cellSize)) {
      return;
    }
    this.config = { ...this.config, cellSize };
    this.configChange.emit(this.config);
    void this.three.resizeAutomata(cellSize);
  }

  clearGrid(): void {
    this.three.clear();
    this.three.stopAutomata();
    this.statusChange.emit('idle');
  }

  onBackgroundColorChosen(color: THREE.Color): void {
    this.backgroundColor = color.clone();
    this.three.deadColor = color;
  }

  onActivationColorChosen(color: THREE.Color): void {
    this.activationColor = color.clone();
    this.three.activeColor = color;
  }

  onAdditionalColorChosen(label: string, color: THREE.Color): void {
    if (this.three.cellularAutomaton) {
      this.three.changeColor(label, color);
    }
  }

  private applyPreset(preset: RulePreset, emitReset: boolean): void {
    this.selectedPreset = preset;
    void this.three.setAutomataAndStopCurrent(preset.automaton);
    if (emitReset) {
      this.statusChange.emit('idle');
    }
  }

  private syncConfigToEngine(): void {
    this.three.fpsCap = this.config.speed;
    void this.three.resizeAutomata(this.config.cellSize);
  }

  private syncColorsWithEngine(): void {
    if (this.three.deadColor) {
      this.backgroundColor = this.three.deadColor.clone();
    } else {
      this.three.deadColor = this.backgroundColor;
    }
    if (this.three.activeColor) {
      this.activationColor = this.three.activeColor.clone();
    } else {
      this.three.activeColor = this.activationColor;
    }
  }
}
