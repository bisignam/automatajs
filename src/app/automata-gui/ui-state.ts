export type SimulationStatus = 'idle' | 'running' | 'paused';

export interface SimulationConfig {
  speed: number;
  cellSize: number;
}

export type UiTab = 'presets' | 'rule' | 'visual' | 'grid';

export interface UiState {
  status: SimulationStatus;
  isControlPanelOpen: boolean;
  isImmersive: boolean;
  isMobile: boolean;
  activeTab: UiTab;
  lastUserInteractionAt: number;
  ruleName?: string;
  ruleDescription?: string;
}
