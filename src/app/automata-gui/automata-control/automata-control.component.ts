import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import * as THREE from 'three';
import { Subscription } from 'rxjs';
import { AdditionalColorType, CellularAutomaton } from 'src/app/automata-engine/cellularautomaton';
import { DefaultSettings } from 'src/app/automata-engine/defaultSettings';
import { ThreeService } from 'src/app/automata-engine/three-service';
import { SimulationConfig, SimulationStatus, UiState, UiTab } from '../ui-state';
import { animate } from '@motionone/dom';
import { RULE_PRESETS, RulePreset } from '../rule-presets';

@Component({
  selector: 'app-automata-control',
  templateUrl: './automata-control.component.html',
  styleUrls: ['./automata-control.component.scss'],
  standalone: false,
})
export class AutomataControlComponent implements OnChanges, OnInit, OnDestroy, AfterViewInit {
  @ViewChild('ruleCarousel') private ruleCarousel?: ElementRef<HTMLDivElement>;
  @ViewChild('quickPresetRow') private quickPresetRow?: ElementRef<HTMLDivElement>;
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
  @Input() variant: 'panel' | 'quick-rule' = 'panel';

  readonly tabs: { id: UiTab; label: string }[] = [
    { id: 'presets', label: 'Presets' },
    { id: 'rule', label: 'Rule' },
    { id: 'visual', label: 'Visual' },
    { id: 'grid', label: 'Grid' },
  ];

  readonly rulePresets: RulePreset[] = RULE_PRESETS;
  ruleSearchTerm = '';

  selectedPreset: RulePreset = this.rulePresets[0];
  backgroundColor: THREE.Color = DefaultSettings.backgroundColor.clone();
  activationColor: THREE.Color = DefaultSettings.activationColor.clone();
  quickColorPopoverTarget: string | null = null;
  private automataSizeSub?: Subscription;
  private quickPresetNudgePlayed = false;

  constructor(private readonly three: ThreeService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.syncConfigToEngine();
    this.initializePresetFromEngine();
    this.syncColorsWithEngine();
    this.automataSizeSub = this.three.getAutomataSizeObservable().subscribe((size) => {
      if (this.config.cellSize === size) {
        return;
      }
      this.config = { ...this.config, cellSize: size };
      this.configChange.emit(this.config);
    });
  }
  ngAfterViewInit(): void {
    this.playQuickPresetNudge();
    this.realignCarouselIndex();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && !changes['config'].firstChange) {
      this.syncConfigToEngine();
    }
  }

  ngOnDestroy(): void {
    this.automataSizeSub?.unsubscribe();
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

  get isQuickVariant(): boolean {
    return this.variant === 'quick-rule';
  }

  get filteredRulePresets(): RulePreset[] {
    const term = this.ruleSearchTerm.trim().toLowerCase();
    if (!term) {
      return this.rulePresets;
    }
    return this.rulePresets.filter((preset) => preset.label.toLowerCase().includes(term));
  }

  get shouldShowAutoImmersiveToggle(): boolean {
    return !this.isQuickVariant && this.uiState?.isMobile !== true;
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
    this.applyPreset(this.selectedPreset, true, {
      preserveRunningState: false,
      preserveState: false,
    });
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
    this.applyPreset(preset, true, { preserveRunningState: true });
    const source = this.isQuickVariant ? this.filteredRulePresets : this.rulePresets;
    const presetIndex = source.findIndex((rule) => rule.id === preset.id);
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

  onRuleCarouselWheel(event: WheelEvent): void {
    const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (!delta) {
      return;
    }
    event.preventDefault();
    this.scrollCarousel(delta > 0 ? 1 : -1);
  }

  onRuleSearchChange(term: string): void {
    this.ruleSearchTerm = term;
    this.realignCarouselIndex();
  }

  clearRuleSearch(): void {
    if (!this.ruleSearchTerm) {
      return;
    }
    this.ruleSearchTerm = '';
    this.realignCarouselIndex();
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

  private realignCarouselIndex(): void {
    const list = this.filteredRulePresets;
    if (!list.length) {
      this.ruleCarouselIndex = 0;
      return;
    }
    const selectedIndex = list.findIndex((preset) => preset.id === this.selectedPreset.id);
    this.ruleCarouselIndex = selectedIndex >= 0 ? selectedIndex : Math.min(this.ruleCarouselIndex, list.length - 1);
    queueMicrotask(() => this.scrollToCarouselIndex(this.ruleCarouselIndex, 'auto'));
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
    this.deferColorUpdate(() => {
      this.backgroundColor = color.clone();
      this.three.deadColor = color;
    });
  }

  onActivationColorChosen(color: THREE.Color): void {
    this.deferColorUpdate(() => {
      this.activationColor = color.clone();
      this.three.activeColor = color;
    });
  }

  onAdditionalColorChosen(label: string, color: THREE.Color): void {
    this.deferColorUpdate(() => {
      if (this.three.cellularAutomaton) {
        this.three.changeColor(label, color);
      }
    });
  }

  toggleQuickColorPopover(target: string): void {
    if (!this.isQuickVariant) {
      return;
    }
    this.quickColorPopoverTarget = this.quickColorPopoverTarget === target ? null : target;
  }

  isQuickColorPopoverOpen(target: string): boolean {
    return this.quickColorPopoverTarget === target;
  }

  closeQuickColorPopover(): void {
    this.quickColorPopoverTarget = null;
  }

  colorToHex(color?: THREE.Color): string {
    if (!color) {
      return '#ffffff';
    }
    return `#${color.getHexString()}`;
  }

  private applyPreset(
    preset: RulePreset,
    emitReset: boolean,
    options?: { preserveRunningState?: boolean; preserveState?: boolean },
  ): void {
    this.selectedPreset = preset;
    this.emitSelectedRuleInfo();
    const shouldResume = this.isRunning && !!options?.preserveRunningState;
    const automaton = preset.createAutomaton();
    const preserveState = options?.preserveState ?? true;
    void this.three.setAutomataAndStopCurrent(automaton, { preserveState });
    if (emitReset) {
      this.statusChange.emit(shouldResume ? 'running' : 'idle');
    }
  }

  private syncConfigToEngine(): void {
    this.three.fpsCap = this.config.speed;
    void this.three.resizeAutomata(this.config.cellSize);
  }

  private initializePresetFromEngine(): void {
    const currentAutomaton = this.three.cellularAutomaton;
    if (!currentAutomaton) {
      this.applyPreset(this.selectedPreset, false);
      return;
    }
    const existingPreset = this.rulePresets.find((preset) => preset.matches(currentAutomaton));
    if (existingPreset) {
      this.selectedPreset = existingPreset;
      this.emitSelectedRuleInfo();
      return;
    }
    this.applyPreset(this.selectedPreset, false);
  }

  private emitSelectedRuleInfo(): void {
    if (this.selectedPreset) {
      this.uiStateChange.emit({
        ruleName: this.selectedPreset.label,
        ruleDescription: this.selectedPreset.summary,
      });
    }
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

  private playQuickPresetNudge(): void {
    if (!this.isQuickVariant || this.quickPresetNudgePlayed) {
      return;
    }
    const row = this.quickPresetRow?.nativeElement;
    if (!row) {
      return;
    }
    this.quickPresetNudgePlayed = true;
    animate(
      row,
      { transform: ['translateX(0)', 'translateX(-4px)', 'translateX(0)'] },
      { duration: 0.4, easing: 'ease-in-out' },
    );
  }

  private deferColorUpdate(updater: () => void): void {
    queueMicrotask(() => {
      updater();
      this.cdr.markForCheck();
    });
  }
}
