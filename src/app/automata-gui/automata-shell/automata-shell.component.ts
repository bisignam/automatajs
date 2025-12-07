import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DefaultSettings } from '../../automata-engine/defaultSettings';
import { AutomataControlComponent } from '../automata-control/automata-control.component';
import { SimulationConfig, SimulationStatus, UiState } from '../ui-state';
import { animate } from '@motionone/dom';
import type { Easing } from '@motionone/types';

@Component({
  selector: 'app-automata-shell',
  templateUrl: './automata-shell.component.html',
  styleUrls: ['./automata-shell.component.scss'],
  standalone: false,
})
export class AutomataShellComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(AutomataControlComponent) private controlComponent?: AutomataControlComponent;

  private readonly escapeKey = 'Escape';
  private readonly idleCountdownSeconds = 3;
  private readonly idleCountdownDelayMs = 2000;
  private readonly immersiveTransportAutoHideMs = 4000;
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
  };

  isAboutOpen = false;
  transportVisible = true;
  idleCountdownVisible = false;
  idleCountdownRemaining = 0;

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

  private controlPanelEl?: HTMLElement;
  private transportBarEl?: HTMLElement;
  private pendingPanelEnterAnimation = false;
  private panelAnimation?: ReturnType<typeof animate>;
  private transportAnimation?: ReturnType<typeof animate>;
  private revealRailAnimations = new WeakMap<HTMLElement, ReturnType<typeof animate>>();
  private revealRailLedAnimations = new WeakMap<HTMLElement, ReturnType<typeof animate>>();
  private idleCountdownIntervalId?: number;
  private idleDelayTimeoutId?: number;
  private transportAutoHideTimeoutId?: number;
  private headerExpandedHeight = 48;
  private readonly headerPaddingTop = 8;
  private readonly shellPadding = { top: 12, right: 20, bottom: 20, left: 20 };
  private readonly shellGap = 16;
  private readonly canvasRadius = 18;

  ngOnInit(): void {
    this.updateResponsiveState(window.innerWidth);
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
  }

  get isImmersive(): boolean {
    return this.uiState.isImmersive;
  }

  get panelOpen(): boolean {
    return this.uiState.isControlPanelOpen;
  }

  toggleControls(): void {
    if (this.isImmersive) {
      this.exitImmersive();
      return;
    }
    this.patchUiState({ isControlPanelOpen: !this.panelOpen, lastUserInteractionAt: Date.now() });
  }

  onRevealRailHover(event: MouseEvent | FocusEvent): void {
    this.animateRevealRail(event.currentTarget, true);
  }

  onRevealRailLeave(event: MouseEvent | FocusEvent): void {
    this.animateRevealRail(event.currentTarget, false);
  }

  enterImmersive(): void {
    if (this.isImmersive) {
      return;
    }
    this.clearIdleDelayTimeout();
    this.cancelIdleCountdown();
    this.clearTransportAutoHide();
    this.setTransportVisibility(false, { animate: true });
    this.patchUiState({
      isImmersive: true,
      isControlPanelOpen: false,
      lastUserInteractionAt: Date.now(),
    });
    this.playImmersiveSceneTransition(true);
  }

  exitImmersive(): void {
    if (!this.isImmersive) {
      return;
    }
    this.setTransportVisibility(true, { animate: true });
    this.clearTransportAutoHide();
    this.pendingPanelEnterAnimation = true;
    this.patchUiState({
      isImmersive: false,
      isControlPanelOpen: true,
      lastUserInteractionAt: Date.now(),
    });
    this.playImmersiveSceneTransition(false);
    this.scheduleAutoImmersive();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: UIEvent): void {
    const target = event.target as Window;
    this.updateResponsiveState(target.innerWidth);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.isImmersive && event.key === this.escapeKey) {
      this.exitImmersive();
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
  }

  onStatusChange(status: SimulationStatus): void {
    this.patchUiState({ status });
    this.updateAutoImmersiveState();
    if (status !== 'running') {
      this.exitImmersive();
    }
    this.markInteraction(false);
  }

  onUiStateChange(patch: Partial<UiState>): void {
    this.patchUiState(patch);
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
    this.exitImmersive();
    this.markInteraction(true);
  }

  onStep(): void {
    this.controlComponent?.handleStepRequest();
    this.patchUiState({ status: 'paused' });
    this.updateAutoImmersiveState();
    this.exitImmersive();
    this.markInteraction(true);
  }

  onReset(): void {
    this.controlComponent?.handleResetRequest();
    this.patchUiState({ status: 'idle' });
    this.updateAutoImmersiveState();
    this.exitImmersive();
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

  showTransport(): void {
    this.setTransportVisibility(true, { animate: true });
    this.resetTransportAutoHideTimer();
  }

  onImmersiveTransportInteraction(): void {
    if (!this.isImmersive || !this.transportVisible) {
      return;
    }
    this.resetTransportAutoHideTimer();
  }

  private updateAutoImmersiveState(): void {
    if (this.shouldAutoImmersive()) {
      this.scheduleAutoImmersive();
      return;
    }
    this.cancelIdleCountdown();
    this.clearIdleDelayTimeout();
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

  private handleIdleActivity(): void {
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
      return;
    }
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
    if (!this.isImmersive) {
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

  private animateRevealRail(target: EventTarget | null, entering: boolean): void {
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const rail = target;
    this.revealRailAnimations.get(rail)?.cancel();
    const computed = window.getComputedStyle(rail);
    const startWidth = computed.width;
    const startOpacity = computed.opacity;
    const targetWidth = entering ? '14px' : '6px';
    const targetOpacity = entering ? '0.95' : '0.35';
    const animation = animate(
      rail,
      {
        width: [startWidth, targetWidth],
        opacity: [startOpacity, targetOpacity],
      },
      { duration: entering ? 0.28 : 0.22, easing: 'ease-out' },
    );
    this.revealRailAnimations.set(rail, animation);
    animation.finished.finally(() => {
      if (this.revealRailAnimations.get(rail) !== animation) {
        return;
      }
      if (entering) {
        rail.style.width = targetWidth;
        rail.style.opacity = targetOpacity;
      } else {
        rail.style.width = '';
        rail.style.opacity = '';
      }
      this.revealRailAnimations.delete(rail);
    });
    const led = rail.querySelector<HTMLElement>('.reveal-rail__led');
    if (led) {
      this.animateRevealRailLed(led, entering);
    }
  }

  private animateRevealRailLed(led: HTMLElement, entering: boolean): void {
    this.revealRailLedAnimations.get(led)?.cancel();
    const startOpacity = window.getComputedStyle(led).opacity;
    const targetOpacity = entering ? '0.8' : '0.25';
    const animation = animate(
      led,
      entering
        ? { opacity: [startOpacity, '1', targetOpacity], transform: ['scale(0.9)', 'scale(1.15)', 'scale(1)'] }
        : { opacity: [startOpacity, targetOpacity], transform: ['scale(1)', 'scale(0.92)', 'scale(1)'] },
      { duration: entering ? 0.3 : 0.22, easing: 'ease-out' },
    );
    this.revealRailLedAnimations.set(led, animation);
    animation.finished.finally(() => {
      if (this.revealRailLedAnimations.get(led) !== animation) {
        return;
      }
      if (entering) {
        led.style.opacity = targetOpacity;
      } else {
        led.style.opacity = '';
      }
      led.style.transform = '';
      this.revealRailLedAnimations.delete(led);
    });
  }

  private animateHandleEnter(handle: HTMLElement): void {
    requestAnimationFrame(() => {
      animate(handle, { opacity: [0, 1] }, { duration: 0.18, easing: 'ease-out' }).finished.finally(() => {
        handle.style.opacity = '';
      });
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
    return !this.isImmersive && this.uiState.status === 'running';
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
