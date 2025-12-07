import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DefaultSettings } from '../../automata-engine/defaultSettings';
import { AutomataControlComponent } from '../automata-control/automata-control.component';
import { SimulationConfig, SimulationStatus, UiState } from '../ui-state';

@Component({
  selector: 'app-automata-shell',
  templateUrl: './automata-shell.component.html',
  styleUrls: ['./automata-shell.component.scss'],
  standalone: false,
})
export class AutomataShellComponent implements OnInit, OnDestroy {
  @ViewChild(AutomataControlComponent) private controlComponent?: AutomataControlComponent;

  readonly autoHideDelayMs = 5000;
  private readonly immersiveTransportHideDelayMs = 1800;

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
  isImmersiveTransportVisible = true;

  private immersiveIntervalId?: number;
  private immersiveTransportTimeoutId?: number;

  ngOnInit(): void {
    this.updateResponsiveState(window.innerWidth);
    this.scheduleImmersiveCheck();
  }

  ngOnDestroy(): void {
    if (this.immersiveIntervalId) {
      window.clearInterval(this.immersiveIntervalId);
      this.immersiveIntervalId = undefined;
    }
    this.clearImmersiveTransportHide();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: UIEvent): void {
    const target = event.target as Window;
    this.updateResponsiveState(target.innerWidth);
  }

  @HostListener('mousemove', ['$event'])
  onShellMouseMove(event: MouseEvent): void {
    if (!this.uiState.isImmersive) {
      return;
    }
    if (event.clientY >= window.innerHeight - 120) {
      this.revealImmersiveTransportBar();
    }
  }

  @HostListener('touchstart')
  onShellTouchStart(): void {
    if (!this.uiState.isImmersive) {
      return;
    }
    this.revealImmersiveTransportBar();
  }

  onConfigChange(config: SimulationConfig): void {
    this.simulationConfig = { ...config };
    this.markInteraction(false);
  }

  onStatusChange(status: SimulationStatus): void {
    this.patchUiState({ status });
    if (status !== 'running') {
      this.patchUiState({ isImmersive: false, isControlPanelOpen: true });
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
    this.revealImmersiveTransportBar();
    this.markInteraction(false);
  }

  onPause(): void {
    this.controlComponent?.handlePauseRequest();
    this.patchUiState({ status: 'paused', isImmersive: false });
    this.revealImmersiveTransportBar();
    this.markInteraction(true);
  }

  onStep(): void {
    this.controlComponent?.handleStepRequest();
    this.patchUiState({ status: 'paused', isImmersive: false });
    this.revealImmersiveTransportBar();
    this.markInteraction(true);
  }

  onReset(): void {
    this.controlComponent?.handleResetRequest();
    this.patchUiState({ status: 'idle', isImmersive: false, isControlPanelOpen: true });
    this.revealImmersiveTransportBar();
    this.markInteraction(true);
  }

  onSpeedChange(speed: number): void {
    this.simulationConfig = { ...this.simulationConfig, speed };
    this.revealImmersiveTransportBar();
    this.markInteraction(false);
  }

  openPanel(): void {
    this.patchUiState({ isControlPanelOpen: true, isImmersive: false });
    this.markInteraction(false);
  }

  closePanel(): void {
    this.patchUiState({ isControlPanelOpen: false });
    this.markInteraction(false);
  }

  openAbout(): void {
    this.isAboutOpen = true;
  }

  closeAbout(): void {
    this.isAboutOpen = false;
  }

  onTransportInteraction(): void {
    this.revealImmersiveTransportBar();
  }

  private patchUiState(partial: Partial<UiState>): void {
    const previousState = this.uiState;
    this.uiState = {
      ...this.uiState,
      ...partial,
      lastUserInteractionAt: partial.lastUserInteractionAt ?? this.uiState.lastUserInteractionAt,
    };
    if (!previousState.isImmersive && this.uiState.isImmersive) {
      this.enterImmersiveUi();
    } else if (previousState.isImmersive && !this.uiState.isImmersive) {
      this.exitImmersiveUi();
    }
    if (previousState.status !== this.uiState.status) {
      this.syncImmersiveTransportWithStatus();
    }
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

  private scheduleImmersiveCheck(): void {
    if (this.immersiveIntervalId) {
      window.clearInterval(this.immersiveIntervalId);
    }
    this.immersiveIntervalId = window.setInterval(() => this.applyImmersiveHeuristic(), 1000);
  }

  private applyImmersiveHeuristic(): void {
    if (this.uiState.status !== 'running') {
      return;
    }
    if (this.uiState.isMobile) {
      return;
    }
    const elapsed = Date.now() - this.uiState.lastUserInteractionAt;
    if (elapsed > this.autoHideDelayMs && !this.uiState.isImmersive) {
      this.patchUiState({ isImmersive: true, isControlPanelOpen: false });
    }
  }

  private updateResponsiveState(width: number): void {
    const isMobile = width <= 900;
    this.patchUiState({
      isMobile,
      isControlPanelOpen: !isMobile || this.uiState.isControlPanelOpen,
    });
  }

  private enterImmersiveUi(): void {
    this.isImmersiveTransportVisible = true;
    this.scheduleImmersiveTransportHide();
  }

  private exitImmersiveUi(): void {
    this.isImmersiveTransportVisible = true;
    this.clearImmersiveTransportHide();
  }

  private revealImmersiveTransportBar(): void {
    if (!this.uiState.isImmersive) {
      return;
    }
    this.isImmersiveTransportVisible = true;
    this.scheduleImmersiveTransportHide();
  }

  private scheduleImmersiveTransportHide(): void {
    this.clearImmersiveTransportHide();
    if (!this.uiState.isImmersive) {
      return;
    }
    if (this.uiState.status !== 'running') {
      return;
    }
    this.immersiveTransportTimeoutId = window.setTimeout(() => {
      this.isImmersiveTransportVisible = false;
    }, this.immersiveTransportHideDelayMs);
  }

  private clearImmersiveTransportHide(): void {
    if (this.immersiveTransportTimeoutId) {
      window.clearTimeout(this.immersiveTransportTimeoutId);
      this.immersiveTransportTimeoutId = undefined;
    }
  }

  private syncImmersiveTransportWithStatus(): void {
    if (!this.uiState.isImmersive) {
      this.isImmersiveTransportVisible = true;
      this.clearImmersiveTransportHide();
      return;
    }
    if (this.uiState.status === 'running') {
      this.scheduleImmersiveTransportHide();
      return;
    }
    this.clearImmersiveTransportHide();
    this.isImmersiveTransportVisible = true;
  }
}
