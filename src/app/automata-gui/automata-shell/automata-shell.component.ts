import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DefaultSettings } from '../../automata-engine/defaultSettings';
import { AutomataControlComponent } from '../automata-control/automata-control.component';
import { SimulationConfig, SimulationStatus, UiState } from '../ui-state';
import { animate } from '@motionone/dom';
import type { Easing } from '@motionone/types';
import * as THREE from 'three';
import { RULE_PRESETS, RulePreset } from '../rule-presets';

interface MobilePaletteSwatch {
  id: string;
  label: string;
  color: string;
}

@Component({
  selector: 'app-automata-shell',
  templateUrl: './automata-shell.component.html',
  styleUrls: ['./automata-shell.component.scss'],
  standalone: false,
})
export class AutomataShellComponent implements OnInit, OnDestroy, AfterViewInit {
  private controlComponent?: AutomataControlComponent;

  @ViewChild('controlBridge') set controlBridgeRef(component: AutomataControlComponent | undefined) {
    this.controlComponent = component;
    if (component) {
      Promise.resolve().then(() => {
        this.updateMobilePaletteSwatches();
        this.syncRulePickerToCurrentRule();
      });
    }
  }

  private readonly escapeKey = 'Escape';
  private readonly idleCountdownSeconds = 3;
  private readonly idleCountdownDelayMs = 2000;
  private readonly immersiveTransportAutoHideMs = 4000;
  private readonly autoImmersiveIdleMs = 20000;
  private readonly autoImmersiveDialogMs = 8000;
  private readonly immersiveEase: Easing = [0.33, 1, 0.68, 1];

  simulationConfig: SimulationConfig = {
    speed: DefaultSettings.fpsCap,
    cellSize: DefaultSettings.pixelSize,
  };

  uiState: UiState = {
    status: 'idle',
    isControlPanelOpen: true,
    isImmersive: false,
    isMobile: false,
    activeTab: 'presets',
    lastUserInteractionAt: Date.now(),
    ruleName: '',
    ruleDescription: '',
  };
  readonly rulePresets: RulePreset[] = RULE_PRESETS;
  readonly rulePickerOffsets = [-2, -1, 0, 1, 2];

  isAboutOpen = false;
  transportVisible = true;
  idleCountdownVisible = false;
  idleCountdownRemaining = 0;
  exitPillVisible = false;
  showAutoImmersiveOptIn = false;
  private readonly autoImmersivePreferenceKey = 'automatajs_autoImmersivePreference';
  autoImmersivePreference: 'unknown' | 'enabled' | 'disabled' = 'unknown';

  @ViewChild('appHeader') private headerRef?: ElementRef<HTMLElement>;
  @ViewChild('shellMain') private shellRef?: ElementRef<HTMLElement>;
  @ViewChild('canvasSection') private canvasRef?: ElementRef<HTMLElement>;
  @ViewChild('controlPanel') set controlPanelRef(ref: ElementRef<HTMLElement> | undefined) {
    this.controlPanelEl = ref?.nativeElement;
    if (this.controlPanelEl && this.pendingPanelEnterAnimation) {
      this.pendingPanelEnterAnimation = false;
      this.playPanelEnterAnimation();
    }
  }
  @ViewChild('transportBar') set transportBarRef(ref: ElementRef<HTMLElement> | undefined) {
    this.transportBarEl = ref?.nativeElement;
    if (this.transportBarEl) {
      this.applyTransportVisibility(this.transportVisible, true);
    }
  }
  @ViewChild('bottomHandle') set bottomHandleRef(ref: ElementRef<HTMLButtonElement> | undefined) {
    if (ref) {
      this.animateHandleEnter(ref.nativeElement);
    }
  }
  @ViewChild('exitPillButton') set exitPillButtonRef(ref: ElementRef<HTMLButtonElement> | undefined) {
    this.exitPillEl = ref?.nativeElement;
    if (this.exitPillEl) {
      this.animateExitPillEnter(this.exitPillEl);
    }
  }
  @ViewChild('autoImmersiveBanner') set autoImmersiveBannerRef(ref: ElementRef<HTMLDivElement> | undefined) {
    this.autoImmersiveBannerEl = ref?.nativeElement;
    if (this.autoImmersiveBannerEl) {
      this.animateAutoImmersiveBannerEnter(this.autoImmersiveBannerEl);
    }
  }
  @ViewChild('mobileDock') set mobileDockRef(ref: ElementRef<HTMLElement> | undefined) {
    this.mobileDockEl = ref?.nativeElement;
    if (this.pendingMobileDockEnter && this.mobileDockEl) {
      this.pendingMobileDockEnter = false;
      requestAnimationFrame(() => this.animateMobileDock(false));
    }
  }

  private controlPanelEl?: HTMLElement;
  private transportBarEl?: HTMLElement;
  private pendingPanelEnterAnimation = false;
  private panelAnimation?: ReturnType<typeof animate>;
  private transportAnimation?: ReturnType<typeof animate>;
  private immersiveHandleAnimations = new WeakMap<HTMLElement, ReturnType<typeof animate>>();
  private immersiveHandleIconAnimations = new WeakMap<HTMLElement, ReturnType<typeof animate>>();
  private exitPillHoverAnimations = new WeakMap<HTMLElement, ReturnType<typeof animate>>();
  private exitPillEl?: HTMLElement;
  private autoImmersiveBannerEl?: HTMLElement;
  private mobileDockEl?: HTMLElement;
  private mobileDockAnimation?: ReturnType<typeof animate>;
  private pendingMobileDockEnter = false;
  private autoImmersiveOptInDismissTimerId?: number;
  private autoImmersiveIdleTimerId?: number;
  private idleCountdownIntervalId?: number;
  private idleDelayTimeoutId?: number;
  private transportAutoHideTimeoutId?: number;
  private headerExpandedHeight = 48;
  private readonly headerPaddingTop = 8;
  private readonly shellPadding = { top: 12, right: 20, bottom: 20, left: 20 };
  private readonly shellGap = 16;
  private readonly canvasRadius = 18;
  private rulePickerSwipeStartY: number | null = null;
  private readonly rulePickerSwipeThreshold = 32;
  isMobileLayout = false;
  isMobileFullScreen = false;
  mobileDockCollapsed = false;
  mobileDockAnimating = false;
  isMobileRulePickerOpen = false;
  rulePickerIndex = 0;
  mobilePaletteSwatches: MobilePaletteSwatch[] = [];
  isMobileColorPickerOpen = false;
  activeColorSwatchId: string | null = null;
  activeColorLabel: string | null = null;
  activeColorValue = '';
  isMobileCellSizeOverlayOpen = false;
  ruleOverlayDockOpen = true;
  ruleOverlayImmersiveOpen = false;
  private readonly updateIsMobileLayoutBound = () => this.updateIsMobileLayout();

  ngOnInit(): void {
    this.loadAutoImmersivePreference();
    this.updateIsMobileLayout();
    window.addEventListener('resize', this.updateIsMobileLayoutBound);
    this.updateAutoImmersiveState();
  }

  ngAfterViewInit(): void {
    if (this.headerRef?.nativeElement) {
      this.headerExpandedHeight = this.headerRef.nativeElement.offsetHeight || this.headerExpandedHeight;
    }
  }

  ngOnDestroy(): void {
    this.cancelIdleCountdown();
    this.clearIdleDelayTimeout();
    this.clearTransportAutoHide();
    this.clearAutoImmersiveOptInDismissTimer();
    this.clearAutoImmersiveIdleTimer();
    window.removeEventListener('resize', this.updateIsMobileLayoutBound);
  }

  get isImmersive(): boolean {
    return this.uiState.isImmersive;
  }

  get effectiveImmersive(): boolean {
    return this.isMobileLayout ? true : this.isImmersive;
  }

  get panelOpen(): boolean {
    return this.uiState.isControlPanelOpen;
  }

  get hasActiveRule(): boolean {
    return !!this.uiState.ruleName;
  }

  get shouldShowRuleOverlayDock(): boolean {
    return !this.isMobileLayout && this.hasActiveRule;
  }

  get isDesktopRuleOverlayExpanded(): boolean {
    if (!this.shouldShowRuleOverlayDock) {
      return false;
    }
    return this.isImmersive ? this.ruleOverlayImmersiveOpen : this.ruleOverlayDockOpen;
  }

  toggleControls(): void {
    if (this.isImmersive) {
      this.exitImmersiveMode();
      return;
    }
    this.patchUiState({ isControlPanelOpen: !this.panelOpen, lastUserInteractionAt: Date.now() });
  }

  toggleDesktopRuleOverlay(): void {
    if (!this.shouldShowRuleOverlayDock) {
      return;
    }
    if (this.isImmersive) {
      this.ruleOverlayImmersiveOpen = !this.ruleOverlayImmersiveOpen;
      return;
    }
    this.ruleOverlayDockOpen = !this.ruleOverlayDockOpen;
  }

  onImmersiveHandleHover(event: MouseEvent | FocusEvent, entering: boolean, variant: 'control' | 'transport'): void {
    if (!(event.currentTarget instanceof HTMLElement)) {
      return;
    }
    const handle = event.currentTarget;
    this.animateImmersiveHandle(handle, entering, variant);
    const iconWrapper = handle.querySelector<HTMLElement>('.immersive-handle__icon-stack, .immersive-handle__icon-row');
    if (iconWrapper) {
      this.animateImmersiveHandleIcon(iconWrapper, entering);
    }
  }

  onExitPillHover(event: MouseEvent | FocusEvent, entering: boolean): void {
    if (!(event.currentTarget instanceof HTMLElement)) {
      return;
    }
    const pill = event.currentTarget;
    this.exitPillHoverAnimations.get(pill)?.cancel();
    const animation = animate(
      pill,
      {
        transform: entering ? ['scale(1)', 'scale(1.05)'] : ['scale(1.05)', 'scale(1)'],
      },
      { duration: 0.16, easing: 'ease-out' },
    );
    this.exitPillHoverAnimations.set(pill, animation);
    animation.finished.finally(() => {
      if (this.exitPillHoverAnimations.get(pill) === animation && !entering) {
        pill.style.transform = '';
        this.exitPillHoverAnimations.delete(pill);
      }
    });
  }

  enterImmersive(): void {
    if (this.isImmersive) {
      return;
    }
    this.clearIdleDelayTimeout();
    this.cancelIdleCountdown();
    this.clearTransportAutoHide();
    this.ruleOverlayImmersiveOpen = false;
    this.setTransportVisibility(false, { animate: true });
    this.patchUiState({
      isImmersive: true,
      isControlPanelOpen: false,
      lastUserInteractionAt: Date.now(),
    });
    this.exitPillVisible = true;
    this.playImmersiveSceneTransition(true);
  }

  exitImmersiveMode(): void {
    if (!this.isImmersive) {
      return;
    }
    this.animateExitPillExit();
    this.setTransportVisibility(true, { animate: true });
    this.clearTransportAutoHide();
    this.pendingPanelEnterAnimation = true;
    this.ruleOverlayImmersiveOpen = false;
    this.patchUiState({
      isImmersive: false,
      isControlPanelOpen: true,
      lastUserInteractionAt: Date.now(),
    });
    this.playImmersiveSceneTransition(false);
    this.scheduleAutoImmersive();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.isImmersive && event.key === this.escapeKey) {
      this.exitImmersiveMode();
    }
  }

  @HostListener('document:mousemove')
  onDocumentMouseMove(): void {
    this.handleIdleActivity();
  }

  @HostListener('document:mousedown')
  onDocumentMouseDown(): void {
    this.handleIdleActivity();
  }

  @HostListener('document:touchstart')
  onDocumentTouchStart(): void {
    this.handleIdleActivity();
  }

  onConfigChange(config: SimulationConfig): void {
    this.simulationConfig = { ...config };
    this.markInteraction(false);
    this.updateMobilePaletteSwatches();
  }

  onStatusChange(status: SimulationStatus): void {
    this.patchUiState({ status });
    this.updateAutoImmersiveState();
    if (status !== 'running') {
      this.exitImmersiveMode();
    }
    this.markInteraction(false);
  }

  onUiStateChange(patch: Partial<UiState>): void {
    this.patchUiState(patch);
    if (Object.prototype.hasOwnProperty.call(patch, 'ruleName')) {
      this.syncRulePickerToCurrentRule();
      this.updateMobilePaletteSwatches();
    }
    this.markInteraction(false);
  }

  onPlay(): void {
    this.controlComponent?.handlePlayRequest();
    this.patchUiState({ status: 'running' });
    this.updateAutoImmersiveState();
    this.markInteraction(false);
  }

  onPause(): void {
    this.controlComponent?.handlePauseRequest();
    this.patchUiState({ status: 'paused' });
    this.updateAutoImmersiveState();
    this.exitImmersiveMode();
    this.markInteraction(true);
  }

  onStep(): void {
    this.controlComponent?.handleStepRequest();
    this.patchUiState({ status: 'paused' });
    this.updateAutoImmersiveState();
    this.exitImmersiveMode();
    this.markInteraction(true);
  }

  onReset(): void {
    this.controlComponent?.handleResetRequest();
    this.patchUiState({ status: 'idle' });
    this.updateAutoImmersiveState();
    this.exitImmersiveMode();
    this.markInteraction(true);
  }

  onSpeedChange(speed: number): void {
    this.simulationConfig = { ...this.simulationConfig, speed };
    this.markInteraction(false);
  }

  openPanel(): void {
    this.requestPanelOpen(false);
    this.patchUiState({ isImmersive: false });
    this.updateAutoImmersiveState();
    this.markInteraction(false);
  }

  closePanel(): void {
    this.requestPanelClose(false);
    this.updateAutoImmersiveState();
    this.markInteraction(false);
  }

  openAbout(): void {
    this.isAboutOpen = true;
  }

  closeAbout(): void {
    this.isAboutOpen = false;
  }

  onRequestMobileFullScreen(): void {
    if (!this.isMobileLayout) {
      return;
    }
    this.isMobileFullScreen = true;
  }

  onExitMobileFullScreen(): void {
    this.isMobileFullScreen = false;
  }

  toggleMobileDockCollapsed(): void {
    if (!this.isMobileLayout) {
      return;
    }
    const nextCollapsed = !this.mobileDockCollapsed;
    this.mobileDockAnimating = true;
    if (nextCollapsed) {
      this.mobileDockCollapsed = true;
      this.pendingMobileDockEnter = false;
      if (this.mobileDockEl) {
        this.animateMobileDock(true);
      } else {
        this.mobileDockAnimating = false;
      }
      return;
    }
    this.mobileDockCollapsed = false;
    if (!this.mobileDockEl) {
      this.pendingMobileDockEnter = true;
      return;
    }
    this.pendingMobileDockEnter = false;
    this.animateMobileDock(false);
  }

  private animateMobileDock(collapsing: boolean): void {
    const dock = this.mobileDockEl;
    if (!dock) {
      this.mobileDockAnimating = false;
      return;
    }
    this.mobileDockAnimation?.cancel();
    const animation = animate(
      dock,
      collapsing
        ? { transform: ['translateX(0)', 'translateX(28px)'], opacity: [1, 0] }
        : { transform: ['translateX(28px)', 'translateX(0)'], opacity: [0, 1] },
      { duration: 0.24, easing: this.immersiveEase },
    );
    this.mobileDockAnimation = animation;
    animation.finished.finally(() => {
      if (this.mobileDockAnimation !== animation) {
        return;
      }
      dock.style.transform = '';
      dock.style.opacity = '';
      this.mobileDockAnimation = undefined;
      this.mobileDockAnimating = false;
    });
  }

  openMobileRulePicker(): void {
    if (!this.isMobileLayout) {
      return;
    }
    this.rulePickerIndex = this.getRuleIndexByName(this.uiState.ruleName);
    this.isMobileRulePickerOpen = true;
  }

  closeMobileRulePicker(): void {
    this.isMobileRulePickerOpen = false;
  }

  onRulePickerTouchStart(event: TouchEvent | PointerEvent): void {
    this.rulePickerSwipeStartY = this.getRulePickerClientY(event);
  }

  onRulePickerTouchEnd(event: TouchEvent | PointerEvent): void {
    if (this.rulePickerSwipeStartY === null) {
      return;
    }
    const endY = this.getRulePickerClientY(event);
    if (endY === null) {
      this.rulePickerSwipeStartY = null;
      return;
    }
    const delta = endY - this.rulePickerSwipeStartY;
    this.rulePickerSwipeStartY = null;
    if (Math.abs(delta) < this.rulePickerSwipeThreshold) {
      return;
    }
    this.cycleMobileRulePicker(delta > 0 ? 1 : -1);
  }

  onRulePickerTouchCancel(): void {
    this.rulePickerSwipeStartY = null;
  }

  cycleMobileRulePicker(direction: 1 | -1): void {
    if (!this.isMobileRulePickerOpen || !this.rulePresets.length) {
      return;
    }
    const length = this.rulePresets.length;
    this.rulePickerIndex = (this.rulePickerIndex + direction + length) % length;
    this.applyRulePickerSelection();
  }

  getRulePreview(offset: number): RulePreset | null {
    if (!this.rulePresets.length) {
      return null;
    }
    const length = this.rulePresets.length;
    const index = (this.rulePickerIndex + offset + length) % length;
    return this.rulePresets[index] ?? null;
  }

  openMobileColorPicker(swatch: MobilePaletteSwatch): void {
    if (!this.isMobileLayout) {
      return;
    }
    this.activeColorSwatchId = swatch.id;
    this.activeColorLabel = swatch.label;
    this.activeColorValue = swatch.color;
    this.isMobileColorPickerOpen = true;
  }

  closeMobileColorPicker(): void {
    this.isMobileColorPickerOpen = false;
    this.activeColorSwatchId = null;
    this.activeColorLabel = null;
  }

  onMobileColorChosen(color: THREE.Color): void {
    if (!this.activeColorSwatchId) {
      return;
    }
    if (this.activeColorSwatchId === 'dead') {
      this.controlComponent?.onBackgroundColorChosen(color);
    } else if (this.activeColorSwatchId === 'alive') {
      this.controlComponent?.onActivationColorChosen(color);
    } else if (this.activeColorSwatchId.startsWith('extra:')) {
      const label = this.activeColorSwatchId.slice(6);
      if (label) {
        this.controlComponent?.onAdditionalColorChosen(label, color);
      }
    }
    this.updateMobilePaletteSwatches();
    this.closeMobileColorPicker();
  }

  openMobileCellSizeOverlay(): void {
    if (!this.isMobileLayout) {
      return;
    }
    this.isMobileCellSizeOverlayOpen = true;
  }

  closeMobileCellSizeOverlay(): void {
    this.isMobileCellSizeOverlayOpen = false;
  }

  onMobileCellSizeInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.valueAsNumber;
    if (!Number.isFinite(value)) {
      return;
    }
    this.simulationConfig = { ...this.simulationConfig, cellSize: value };
    this.markInteraction(false);
  }

  onMobileSpeedInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.valueAsNumber;
    if (!Number.isFinite(value)) {
      return;
    }
    this.onSpeedChange(value);
  }

  toggleMobilePlay(): void {
    if (this.uiState.status === 'running') {
      this.onPause();
    } else {
      this.onPlay();
    }
  }

  onClearGrid(): void {
    this.controlComponent?.clearGrid();
    this.markInteraction(false);
  }

  showTransport(): void {
    if (this.isMobileLayout) {
      return;
    }
    this.setTransportVisibility(true, { animate: true });
    this.resetTransportAutoHideTimer();
  }

  onImmersiveTransportInteraction(): void {
    if (this.isMobileLayout || !this.isImmersive || !this.transportVisible) {
      return;
    }
    this.resetTransportAutoHideTimer();
  }

  private applyRulePickerSelection(): void {
    const preset = this.rulePresets[this.rulePickerIndex];
    if (!preset || !this.controlComponent) {
      return;
    }
    this.controlComponent.selectPreset(preset);
  }

  private getRulePickerClientY(event: TouchEvent | PointerEvent): number | null {
    if ('touches' in event) {
      const touch = event.changedTouches?.[0] ?? event.touches?.[0];
      return touch ? touch.clientY : null;
    }
    return (event as PointerEvent).clientY ?? null;
  }

  private getRuleIndexByName(name?: string): number {
    if (!name) {
      return 0;
    }
    const index = this.rulePresets.findIndex((preset) => preset.label === name);
    return index >= 0 ? index : 0;
  }

  private syncRulePickerToCurrentRule(): void {
    this.rulePickerIndex = this.getRuleIndexByName(this.uiState.ruleName);
  }

  private updateMobilePaletteSwatches(): void {
    const control = this.controlComponent;
    if (!control) {
      this.mobilePaletteSwatches = [];
      return;
    }
    const swatches: MobilePaletteSwatch[] = [
      {
        id: 'dead',
        label: 'Background',
        color: `#${control.backgroundColor.getHexString()}`,
      },
      {
        id: 'alive',
        label: 'Alive',
        color: `#${control.activationColor.getHexString()}`,
      },
    ];
    for (const extra of Array.from(control.additionalColors)) {
      if (swatches.length >= 3) {
        break;
      }
      swatches.push({
        id: `extra:${extra.displayName}`,
        label: extra.displayName,
        color: `#${extra.color.getHexString()}`,
      });
    }
    this.mobilePaletteSwatches = swatches.slice(0, 3);
  }

  private updateAutoImmersiveState(): void {
    if (this.shouldAutoImmersive()) {
      this.scheduleAutoImmersive();
      return;
    }
    this.cancelIdleCountdown();
    this.clearIdleDelayTimeout();
    this.clearAutoImmersiveIdleTimer();
    this.hideAutoImmersiveOptIn();
  }

  private patchUiState(partial: Partial<UiState>): void {
    this.uiState = {
      ...this.uiState,
      ...partial,
      lastUserInteractionAt: partial.lastUserInteractionAt ?? this.uiState.lastUserInteractionAt,
    };
  }

  private markInteraction(keepPanelOpen: boolean): void {
    const basePatch: Partial<UiState> = {
      lastUserInteractionAt: Date.now(),
    };
    if (keepPanelOpen) {
      basePatch.isControlPanelOpen = true;
      basePatch.isImmersive = false;
    }
    this.patchUiState(basePatch);
  }

  private updateResponsiveState(width: number): void {
    const isMobile = width <= 900;
    this.patchUiState({
      isMobile,
      isControlPanelOpen: !isMobile || this.uiState.isControlPanelOpen,
    });
    this.updateAutoImmersiveState();
  }

  private updateIsMobileLayout(): void {
    const width = window.innerWidth;
    const nextIsMobileLayout = width <= 960;
    const previousIsMobileLayout = this.isMobileLayout;
    this.isMobileLayout = nextIsMobileLayout;
    if (!nextIsMobileLayout) {
      this.isMobileFullScreen = false;
    }
    if (previousIsMobileLayout !== nextIsMobileLayout) {
      if (nextIsMobileLayout) {
        this.isMobileFullScreen = false;
      } else {
        this.ruleOverlayDockOpen = true;
      }
      this.mobileDockCollapsed = false;
      this.mobileDockAnimating = false;
      this.pendingMobileDockEnter = false;
      this.mobileDockAnimation?.cancel();
      this.mobileDockAnimation = undefined;
      this.isMobileRulePickerOpen = false;
      this.isMobileColorPickerOpen = false;
      this.isMobileCellSizeOverlayOpen = false;
    }
    this.updateResponsiveState(width);
  }

  private handleIdleActivity(): void {
    this.clearAutoImmersiveIdleTimer();
    if (!this.shouldAutoImmersive()) {
      this.cancelIdleCountdown();
      this.clearIdleDelayTimeout();
      return;
    }
    this.scheduleAutoImmersive();
  }

  private scheduleAutoImmersive(): void {
    this.clearIdleDelayTimeout();
    this.cancelIdleCountdown();
    if (!this.shouldAutoImmersive()) {
      this.clearAutoImmersiveIdleTimer();
      return;
    }
    if (this.autoImmersivePreference === 'disabled') {
      this.clearAutoImmersiveIdleTimer();
      return;
    }
    if (this.autoImmersivePreference === 'unknown') {
      this.startAutoImmersiveOptInIdleTimer();
      return;
    }
    this.clearAutoImmersiveIdleTimer();
    this.idleDelayTimeoutId = window.setTimeout(() => this.startIdleCountdown(), this.idleCountdownDelayMs);
  }

  private startIdleCountdown(): void {
    if (!this.shouldAutoImmersive()) {
      return;
    }
    this.idleCountdownRemaining = this.idleCountdownSeconds;
    this.idleCountdownVisible = true;
    this.idleCountdownIntervalId = window.setInterval(() => {
      this.idleCountdownRemaining -= 1;
      if (this.idleCountdownRemaining <= 0) {
        this.cancelIdleCountdown();
        this.enterImmersive();
      }
    }, 1000);
  }

  private cancelIdleCountdown(): void {
    if (this.idleCountdownIntervalId) {
      window.clearInterval(this.idleCountdownIntervalId);
      this.idleCountdownIntervalId = undefined;
    }
    this.idleCountdownVisible = false;
    this.idleCountdownRemaining = 0;
  }

  private clearIdleDelayTimeout(): void {
    if (this.idleDelayTimeoutId) {
      window.clearTimeout(this.idleDelayTimeoutId);
      this.idleDelayTimeoutId = undefined;
    }
  }

  private resetTransportAutoHideTimer(): void {
    this.clearTransportAutoHide();
    if (!this.isImmersive || this.isMobileLayout) {
      return;
    }
    this.transportAutoHideTimeoutId = window.setTimeout(() => {
      this.setTransportVisibility(false, { animate: true });
      this.transportAutoHideTimeoutId = undefined;
    }, this.immersiveTransportAutoHideMs);
  }

  private clearTransportAutoHide(): void {
    if (this.transportAutoHideTimeoutId) {
      window.clearTimeout(this.transportAutoHideTimeoutId);
      this.transportAutoHideTimeoutId = undefined;
    }
  }

  private playImmersiveSceneTransition(entering: boolean): void {
    this.animateHeader(entering);
    this.animateShell(entering);
    this.animateCanvas(entering);
  }

  private animateHeader(entering: boolean): void {
    const header = this.headerRef?.nativeElement;
    if (!header) {
      return;
    }
    header.style.overflow = 'hidden';
    const fromHeight = entering ? this.headerExpandedHeight : 0;
    const toHeight = entering ? 0 : this.headerExpandedHeight;
    const paddingTop = this.headerPaddingTop;
    const animation = animate(
      header,
      {
        height: [`${fromHeight}px`, `${toHeight}px`],
        opacity: entering ? [1, 0] : [0, 1],
        paddingTop: entering ? [`${paddingTop}px`, '0px'] : ['0px', `${paddingTop}px`],
      },
      { duration: 0.5, easing: this.immersiveEase },
    );
    animation.finished.finally(() => {
      header.style.overflow = '';
      header.style.height = '';
      header.style.opacity = '';
      header.style.paddingTop = '';
    });
  }

  private animateShell(entering: boolean): void {
    const shell = this.shellRef?.nativeElement;
    if (!shell) {
      return;
    }
    const { top, right, bottom, left } = this.shellPadding;
    const gap = this.shellGap;
    const animation = animate(
      shell,
      entering
        ? {
            paddingTop: [`${top}px`, '0px'],
            paddingRight: [`${right}px`, '0px'],
            paddingBottom: [`${bottom}px`, '0px'],
            paddingLeft: [`${left}px`, '0px'],
            gap: [`${gap}px`, '0px'],
          }
        : {
            paddingTop: ['0px', `${top}px`],
            paddingRight: ['0px', `${right}px`],
            paddingBottom: ['0px', `${bottom}px`],
            paddingLeft: ['0px', `${left}px`],
            gap: ['0px', `${gap}px`],
          },
      { duration: 0.5, easing: this.immersiveEase },
    );
    animation.finished.finally(() => {
      shell.style.paddingTop = '';
      shell.style.paddingRight = '';
      shell.style.paddingBottom = '';
      shell.style.paddingLeft = '';
      shell.style.gap = '';
    });
  }

  private animateCanvas(entering: boolean): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) {
      return;
    }
    const radius = this.canvasRadius;
    const animation = animate(
      canvas,
      entering ? { borderRadius: [`${radius}px`, '0px'] } : { borderRadius: ['0px', `${radius}px`] },
      { duration: 0.5, easing: this.immersiveEase },
    );
    animation.finished.finally(() => {
      canvas.style.borderRadius = '';
    });
  }

  private animateImmersiveHandle(handle: HTMLElement, entering: boolean, variant: 'control' | 'transport'): void {
    this.immersiveHandleAnimations.get(handle)?.cancel();
    const computed = window.getComputedStyle(handle);
    const startOpacity = computed.opacity;
    const restingOpacity = '0.75';
    const transforms = this.getImmersiveHandleTransforms(variant);
    const animation = animate(
      handle,
      entering
        ? { opacity: [startOpacity, '1'], transform: [transforms.base, transforms.hover] }
        : { opacity: [startOpacity, restingOpacity], transform: [transforms.hover, transforms.base] },
      { duration: 0.18, easing: 'ease-out' },
    );
    this.immersiveHandleAnimations.set(handle, animation);
    animation.finished.finally(() => {
      if (this.immersiveHandleAnimations.get(handle) !== animation) {
        return;
      }
      if (entering) {
        handle.style.opacity = '1';
        handle.style.transform = transforms.hover;
      } else {
        handle.style.opacity = '';
        handle.style.transform = '';
      }
      this.immersiveHandleAnimations.delete(handle);
    });
  }

  private animateImmersiveHandleIcon(iconWrapper: HTMLElement, entering: boolean): void {
    this.immersiveHandleIconAnimations.get(iconWrapper)?.cancel();
    const styles = window.getComputedStyle(iconWrapper);
    const startColor = styles.color;
    const mutedColor = styles.getPropertyValue('--handle-icon-muted')?.trim() || startColor;
    const accentColor = styles.getPropertyValue('--handle-icon-active')?.trim() || startColor;
    const animation = animate(
      iconWrapper,
      { color: [startColor, entering ? accentColor : mutedColor] },
      { duration: 0.14, easing: 'ease-out' },
    );
    this.immersiveHandleIconAnimations.set(iconWrapper, animation);
    animation.finished.finally(() => {
      if (this.immersiveHandleIconAnimations.get(iconWrapper) !== animation) {
        return;
      }
      if (entering) {
        iconWrapper.style.color = accentColor;
      } else {
        iconWrapper.style.color = '';
      }
      this.immersiveHandleIconAnimations.delete(iconWrapper);
    });
  }

  private getImmersiveHandleTransforms(
    variant: 'control' | 'transport',
  ): { base: string; hover: string } {
    if (variant === 'control') {
      return {
        base: 'translateY(-50%) scaleX(1)',
        hover: 'translateY(-50%) scaleX(1.2)',
      };
    }
    return {
      base: 'translateX(-50%) scale(1)',
      hover: 'translateX(-50%) scale(1.12)',
    };
  }

  private animateHandleEnter(handle: HTMLElement): void {
    requestAnimationFrame(() => {
      animate(handle, { opacity: [0, 1] }, { duration: 0.18, easing: 'ease-out' }).finished.finally(() => {
        handle.style.opacity = '';
      });
    });
  }

  private animateExitPillEnter(pill: HTMLElement): void {
    animate(
      pill,
      {
        opacity: [0, 1],
        transform: ['translateY(-8px) scale(0.96)', 'translateY(0) scale(1)'],
      },
      { duration: 0.22, easing: 'ease-out' },
    ).finished.finally(() => {
      pill.style.opacity = '';
      pill.style.transform = '';
    });
  }

  private animateExitPillExit(): void {
    if (!this.exitPillVisible) {
      return;
    }
    const pill = this.exitPillEl;
    if (!pill) {
      this.exitPillVisible = false;
      return;
    }
    this.exitPillHoverAnimations.get(pill)?.cancel();
    this.exitPillHoverAnimations.delete(pill);
    animate(
      pill,
      {
        opacity: [1, 0],
        transform: ['translateY(0) scale(1)', 'translateY(-6px) scale(0.96)'],
      },
      { duration: 0.18, easing: 'ease-in' },
    ).finished.finally(() => {
      this.exitPillVisible = false;
      this.exitPillEl = undefined;
    });
  }

  onAutoImmersiveOptIn(accepted: boolean): void {
    this.hideAutoImmersiveOptIn(accepted ? 'enabled' : 'disabled');
  }

  onAutoImmersivePreferenceChange(value: 'enabled' | 'disabled'): void {
    this.hideAutoImmersiveOptIn(value);
  }

  private loadAutoImmersivePreference(): void {
    try {
      const stored = localStorage.getItem(this.autoImmersivePreferenceKey);
      if (stored === 'enabled' || stored === 'disabled') {
        this.autoImmersivePreference = stored;
      }
    } catch {
      this.autoImmersivePreference = 'disabled';
    }
  }

  private saveAutoImmersivePreference(value: 'enabled' | 'disabled'): void {
    try {
      localStorage.setItem(this.autoImmersivePreferenceKey, value);
    } catch {
      // ignore
    }
  }

  private showAutoImmersiveOptInBanner(): void {
    if (this.showAutoImmersiveOptIn) {
      return;
    }
    this.cancelIdleCountdown();
    this.clearIdleDelayTimeout();
    this.clearAutoImmersiveIdleTimer();
    this.showAutoImmersiveOptIn = true;
    this.clearAutoImmersiveOptInDismissTimer();
    this.autoImmersiveOptInDismissTimerId = window.setTimeout(
      () => this.handleAutoImmersiveOptInDismiss(),
      this.autoImmersiveDialogMs,
    );
  }

  private handleAutoImmersiveOptInDismiss(): void {
    this.hideAutoImmersiveOptIn('disabled');
  }

  private hideAutoImmersiveOptIn(value?: 'enabled' | 'disabled'): void {
    if (!this.showAutoImmersiveOptIn) {
      if (value) {
        this.setAutoImmersivePreference(value);
      }
      return;
    }
    this.clearAutoImmersiveOptInDismissTimer();
    const el = this.autoImmersiveBannerEl;
    const finalize = (): void => {
      this.showAutoImmersiveOptIn = false;
      this.autoImmersiveBannerEl = undefined;
      this.clearAutoImmersiveIdleTimer();
      if (value) {
        this.setAutoImmersivePreference(value);
        if (value === 'enabled') {
          this.scheduleAutoImmersive();
        }
      }
    };
    if (!el) {
      finalize();
      return;
    }
    animate(
      el,
      { opacity: [1, 0], transform: ['translate(-50%, 0)', 'translate(-50%, -6px)'] },
      { duration: 0.18, easing: 'ease-in' },
    ).finished.finally(() => finalize());
  }

  private setAutoImmersivePreference(value: 'enabled' | 'disabled'): void {
    this.autoImmersivePreference = value;
    this.saveAutoImmersivePreference(value);
    this.clearAutoImmersiveIdleTimer();
  }

  private clearAutoImmersiveOptInDismissTimer(): void {
    if (this.autoImmersiveOptInDismissTimerId !== undefined) {
      window.clearTimeout(this.autoImmersiveOptInDismissTimerId);
      this.autoImmersiveOptInDismissTimerId = undefined;
    }
  }

  private startAutoImmersiveOptInIdleTimer(): void {
    if (this.autoImmersiveIdleTimerId !== undefined || this.showAutoImmersiveOptIn) {
      return;
    }
    this.autoImmersiveIdleTimerId = window.setTimeout(() => {
      this.autoImmersiveIdleTimerId = undefined;
      if (this.autoImmersivePreference !== 'unknown' || !this.shouldAutoImmersive() || this.showAutoImmersiveOptIn) {
        return;
      }
      this.showAutoImmersiveOptInBanner();
    }, this.autoImmersiveIdleMs);
  }

  private clearAutoImmersiveIdleTimer(): void {
    if (this.autoImmersiveIdleTimerId !== undefined) {
      window.clearTimeout(this.autoImmersiveIdleTimerId);
      this.autoImmersiveIdleTimerId = undefined;
    }
  }

  private animateAutoImmersiveBannerEnter(banner: HTMLElement): void {
    animate(
      banner,
      { opacity: [0, 1], transform: ['translate(-50%, -10px) scale(0.96)', 'translate(-50%, 0) scale(1)'] },
      { duration: 0.22, easing: 'ease-out' },
    ).finished.finally(() => {
      banner.style.opacity = '';
      banner.style.transform = '';
    });
  }

  private requestPanelOpen(animate: boolean): void {
    if (this.panelOpen) {
      if (animate && this.controlPanelEl) {
        this.playPanelEnterAnimation();
      }
      return;
    }
    this.pendingPanelEnterAnimation = animate;
    this.patchUiState({ isControlPanelOpen: true });
  }

  private shouldAutoImmersive(): boolean {
    return !this.isMobileLayout && !this.isImmersive && this.uiState.status === 'running';
  }

  private requestPanelClose(animate: boolean): void {
    if (!this.panelOpen) {
      return;
    }
    if (!animate || !this.controlPanelEl) {
      this.patchUiState({ isControlPanelOpen: false });
      return;
    }
    this.playPanelExitAnimation();
  }

  private playPanelEnterAnimation(): void {
    const panel = this.controlPanelEl;
    if (!panel) {
      return;
    }
    this.panelAnimation?.cancel();
    panel.style.opacity = '0';
    panel.style.transform = 'translateX(20px)';
    requestAnimationFrame(() => {
      const animation = animate(
        panel,
        { opacity: [0, 1], transform: ['translateX(20px)', 'translateX(0)'] },
        { duration: 0.32, easing: 'ease-out' },
      );
      this.panelAnimation = animation;
      animation.finished.finally(() => {
        if (this.panelAnimation === animation) {
          panel.style.opacity = '';
          panel.style.transform = '';
          this.panelAnimation = undefined;
        }
      });
    });
  }

  private playPanelExitAnimation(): void {
    const panel = this.controlPanelEl;
    if (!panel) {
      this.patchUiState({ isControlPanelOpen: false });
      return;
    }
    this.panelAnimation?.cancel();
    const animation = animate(
      panel,
      { opacity: [1, 0], transform: ['translateX(0)', 'translateX(20px)'] },
      { duration: 0.32, easing: 'ease-out' },
    );
    this.panelAnimation = animation;
    animation.finished.finally(() => {
      if (this.panelAnimation !== animation) {
        return;
      }
      this.panelAnimation = undefined;
      this.patchUiState({ isControlPanelOpen: false });
    });
  }

  private setTransportVisibility(
    visible: boolean,
    options?: { animate?: boolean; immediate?: boolean },
  ): void {
    if (this.transportVisible === visible) {
      return;
    }
    this.transportVisible = visible;
    if (options?.animate) {
      this.animateTransportVisibility(visible, options.immediate ?? false);
    } else {
      this.applyTransportVisibility(visible);
    }
  }

  private animateTransportVisibility(visible: boolean, immediate: boolean): void {
    const transport = this.transportBarEl;
    if (!transport) {
      return;
    }
    this.transportAnimation?.cancel();
    if (immediate) {
      this.applyTransportVisibility(visible);
      return;
    }
    if (visible) {
      transport.style.visibility = 'visible';
      transport.style.pointerEvents = '';
    }
    const animation = animate(
      transport,
      visible
        ? {
            opacity: [0, 1],
            transform: ['translateX(-50%) translateY(14px)', 'translateX(-50%) translateY(0)'],
          }
        : {
            opacity: [1, 0],
            transform: ['translateX(-50%) translateY(0)', 'translateX(-50%) translateY(14px)'],
          },
      { duration: 0.32, easing: 'ease-in-out' },
    );
    this.transportAnimation = animation;
    animation.finished
      .then(() => {
        if (this.transportAnimation !== animation) {
          return;
        }
        if (!visible) {
          transport.style.pointerEvents = 'none';
          transport.style.visibility = 'hidden';
          transport.style.transform = 'translateX(-50%) translateY(10px)';
        } else {
          transport.style.visibility = 'visible';
          transport.style.pointerEvents = '';
          transport.style.transform = '';
        }
      })
      .finally(() => {
        if (this.transportAnimation === animation) {
          this.transportAnimation = undefined;
        }
      });
  }

  private applyTransportVisibility(visible: boolean, skipTransformReset = false): void {
    const transport = this.transportBarEl;
    if (!transport) {
      return;
    }
    transport.style.opacity = visible ? '1' : '0';
    transport.style.visibility = visible ? 'visible' : 'hidden';
    transport.style.pointerEvents = visible ? '' : 'none';
    if (!skipTransformReset) {
      transport.style.transform = visible ? '' : 'translateX(-50%) translateY(10px)';
    }
  }
}
