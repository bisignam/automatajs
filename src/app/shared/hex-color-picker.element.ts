/**
 * Lightweight hex color picker inspired by vanilla-colorful's <hex-color-picker>.
 * Provides a gradient canvas for saturation/value and a hue slider, and dispatches
 * "color-changed" events whenever the selection updates.
 */
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: 100%;
    }

    .picker {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .sv {
      position: relative;
      width: 100%;
      height: 180px;
      border-radius: 16px;
      background-color: hsl(0, 100%, 50%);
      background-image:
        linear-gradient(0deg, #000, rgba(0, 0, 0, 0)),
        linear-gradient(90deg, #fff, rgba(255, 255, 255, 0));
      cursor: crosshair;
      touch-action: none;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.3);
    }

    .sv-handle {
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 2px 6px rgba(2, 6, 23, 0.5);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }

    .hue {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 12px;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      background: linear-gradient(
        to right,
        #ff0000,
        #ffff00,
        #00ff00,
        #00ffff,
        #0000ff,
        #ff00ff,
        #ff0000
      );
      box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.3);
    }

    .hue::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #fff;
      border: 2px solid rgba(15, 23, 42, 0.35);
      box-shadow: 0 2px 6px rgba(2, 6, 23, 0.4);
    }

    .hue::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #fff;
      border: 2px solid rgba(15, 23, 42, 0.35);
      box-shadow: 0 2px 6px rgba(2, 6, 23, 0.4);
    }
  </style>
  <div class="picker">
    <div class="sv">
      <div class="sv-handle"></div>
    </div>
    <input type="range" class="hue" min="0" max="360" step="1" />
  </div>
`;

type HSV = { h: number; s: number; v: number };

class HexColorPickerElement extends HTMLElement {
  private svElement!: HTMLElement;
  private handleElement!: HTMLElement;
  private hueInput!: HTMLInputElement;
  private hue = 0;
  private saturation = 1;
  private value = 1;
  private pointerId: number | null = null;
  private suppressAttributeSync = false;

  static get observedAttributes(): string[] {
    return ['color'];
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
    this.svElement = shadow.querySelector('.sv') as HTMLElement;
    this.handleElement = shadow.querySelector('.sv-handle') as HTMLElement;
    this.hueInput = shadow.querySelector('.hue') as HTMLInputElement;
  }

  connectedCallback(): void {
    this.attachListeners();
    this.applyColor(this.getAttribute('color') || '#ff0000', false);
  }

  disconnectedCallback(): void {
    this.detachListeners();
  }

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
    if (name !== 'color' || this.suppressAttributeSync || newValue == null) {
      return;
    }
    this.applyColor(newValue, false);
  }

  private attachListeners(): void {
    this.svElement.addEventListener('pointerdown', this.onSvPointerDown);
    this.hueInput.addEventListener('input', this.onHueInput);
  }

  private detachListeners(): void {
    this.svElement.removeEventListener('pointerdown', this.onSvPointerDown);
    this.hueInput.removeEventListener('input', this.onHueInput);
    this.releasePointer();
  }

  private onSvPointerDown = (event: PointerEvent): void => {
    event.preventDefault();
    this.pointerId = event.pointerId;
    this.svElement.setPointerCapture(this.pointerId);
    this.svElement.addEventListener('pointermove', this.onSvPointerMove);
    this.svElement.addEventListener('pointerup', this.onSvPointerUp);
    this.svElement.addEventListener('pointercancel', this.onSvPointerUp);
    this.updateSaturationValue(event);
  };

  private onSvPointerMove = (event: PointerEvent): void => {
    event.preventDefault();
    this.updateSaturationValue(event);
  };

  private onSvPointerUp = (event: PointerEvent): void => {
    event.preventDefault();
    this.releasePointer();
  };

  private releasePointer(): void {
    if (this.pointerId != null) {
      try {
        this.svElement.releasePointerCapture(this.pointerId);
      } catch {
        // ignore
      }
    }
    this.pointerId = null;
    this.svElement.removeEventListener('pointermove', this.onSvPointerMove);
    this.svElement.removeEventListener('pointerup', this.onSvPointerUp);
    this.svElement.removeEventListener('pointercancel', this.onSvPointerUp);
  }

  private onHueInput = (): void => {
    this.hue = Number(this.hueInput.value);
    this.updateSvBackground();
    this.emitColorChanged(true);
  };

  private updateSaturationValue(event: PointerEvent): void {
    const rect = this.svElement.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);
    this.saturation = x / rect.width;
    this.value = 1 - y / rect.height;
    this.updateHandlePosition();
    this.emitColorChanged(true);
  }

  private applyColor(hex: string, emit: boolean): void {
    const normalized = this.normalizeHex(hex);
    const hsv = hexToHsv(normalized);
    this.hue = hsv.h;
    this.saturation = hsv.s;
    this.value = hsv.v;
    this.hueInput.value = String(Math.round(this.hue));
    this.updateSvBackground();
    this.updateHandlePosition();
    if (emit) {
      this.emitColorChanged(false);
    }
  }

  private emitColorChanged(dispatch: boolean): void {
    const hex = hsvToHex(this.hue, this.saturation, this.value);
    this.suppressAttributeSync = true;
    this.setAttribute('color', hex);
    this.suppressAttributeSync = false;
    if (dispatch) {
      this.dispatchEvent(
        new CustomEvent('color-changed', {
          detail: { value: hex },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private updateSvBackground(): void {
    this.svElement.style.backgroundColor = `hsl(${this.hue}, 100%, 50%)`;
  }

  private updateHandlePosition(): void {
    this.handleElement.style.left = `${this.saturation * 100}%`;
    this.handleElement.style.top = `${(1 - this.value) * 100}%`;
  }

  private normalizeHex(value: string): string {
    const val = value?.trim() || '#ff0000';
    return val.startsWith('#') ? val : `#${val}`;
  }
}

function hsvToHex(h: number, s: number, v: number): string {
  const { r, g, b } = hsvToRgb(h, s, v);
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function componentToHex(value: number): string {
  const hex = value.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

function hexToHsv(hex: string): HSV {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = 60 * (((gNorm - bNorm) / delta) % 6);
    } else if (max === gNorm) {
      h = 60 * ((bNorm - rNorm) / delta + 2);
    } else {
      h = 60 * ((rNorm - gNorm) / delta + 4);
    }
  }
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : delta / max;
  const v = max;
  return { h, s, v };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

if (!customElements.get('hex-color-picker')) {
  customElements.define('hex-color-picker', HexColorPickerElement);
}
