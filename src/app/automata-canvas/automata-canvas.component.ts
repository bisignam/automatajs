import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { animate } from '@motionone/dom';
import { ThreeService } from '../automata-engine/three-service';

@Component({
  selector: 'app-automata-canvas',
  templateUrl: './automata-canvas.component.html',
  styleUrls: ['./automata-canvas.component.scss'],
  standalone: false,
})
export class AutomataCanvasComponent implements AfterViewInit, OnChanges {
  @ViewChild('automataCanvasContainer')
  automataCanvasContainer?: ElementRef<HTMLCanvasElement>;
  @ViewChild('lensCanvas')
  lensCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('enterImmersiveBtn')
  set enterImmersiveBtnRef(value: ElementRef<HTMLButtonElement> | undefined) {
    if (value) {
      queueMicrotask(() => {
        this.playImmersiveHandleIntro(value.nativeElement);
      });
    }
  }
  threeService: ThreeService;
  private screenshotAnimations = new WeakMap<HTMLElement, ReturnType<typeof animate>>();
  private immersiveHandleEntranceAnimations = new WeakMap<
    HTMLElement,
    ReturnType<typeof animate>
  >();
  private immersiveHandleHoverAnimations = new WeakMap<HTMLElement, ReturnType<typeof animate>>();
  isPainting = false;
  isCursorOverCanvas = false;
  @Input() isImmersive = false;
  @Input() isMobileLayout = false;
  @Input() isMobileFullScreen = false;
  @Input() showIdleCountdown = false;
  @Input() ruleName = '';
  @Input() ruleDescription = '';
  @Output() enterImmersiveMode = new EventEmitter<void>();
  @Output() requestMobileFullScreen = new EventEmitter<void>();
  @Output() exitMobileFullScreen = new EventEmitter<void>();
  @Output() requestOpenControls = new EventEmitter<void>();
  lensEnabled = false;
  private readonly lensSize = 180;
  private readonly lensZoomMin = 2;
  private readonly lensZoomMax = 8;
  private readonly lensZoomStep = 0.5;
  private lensZoom = 3;
  private lastLensDomX: number | null = null;
  private lastLensDomY: number | null = null;
  private lensAnimationFrameId: number | null = null;
  ruleOverlayOpen = false;

  constructor(threeService: ThreeService) {
    this.threeService = threeService;
  }

  ngAfterViewInit(): void {
    if (this.automataCanvasContainer) {
      this.threeService.setup(this.automataCanvasContainer);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isImmersive'] && !changes['isImmersive'].currentValue) || (!this.ruleName)) {
      this.ruleOverlayOpen = false;
    }
  }

  onExportImage(): void {
    const canvas = this.automataCanvasContainer?.nativeElement;
    if (!canvas) {
      return;
    }

    const baseWidth = canvas.width || canvas.clientWidth;
    const baseHeight = canvas.height || canvas.clientHeight;
    if (!baseWidth || !baseHeight) {
      return;
    }

    const scale = 2;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = baseWidth * scale;
    exportCanvas.height = baseHeight * scale;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
    exportCanvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `automatajs-${timestamp}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  onScreenshotHover(entering: boolean, element?: HTMLElement): void {
    if (!element) {
      return;
    }
    this.screenshotAnimations.get(element)?.cancel();
    const animation = animate(
      element,
      { scale: entering ? 1.06 : 1 },
      { duration: 0.16, easing: 'ease-out' },
    );
    this.screenshotAnimations.set(element, animation);
    animation.finished.finally(() => {
      if (this.screenshotAnimations.get(element) === animation && !entering) {
        element.style.transform = '';
        this.screenshotAnimations.delete(element);
      }
    });
  }

  onCanvasPointerDown(event: PointerEvent): void {
    if (event.pointerType === 'touch') {
      event.preventDefault();
    }
    this.onCanvasMouseDown(event);
  }

  onCanvasPointerUp(event: PointerEvent): void {
    if (event.pointerType === 'touch') {
      event.preventDefault();
    }
    this.onCanvasMouseUp(event);
  }

  onCanvasPointerEnter(_event: PointerEvent): void {
    this.onCanvasMouseEnter();
  }

  onCanvasPointerMove(event: PointerEvent): void {
    if (event.pointerType === 'touch') {
      event.preventDefault();
    }
    this.onCanvasMouseMove(event);
  }

  onCanvasPointerLeave(event: PointerEvent): void {
    if (event.pointerType === 'touch') {
      event.preventDefault();
    }
    this.onCanvasMouseLeave(event);
  }

  onCanvasMouseDown(_event: MouseEvent | PointerEvent): void {
    this.isPainting = true;
  }

  onCanvasMouseUp(_event: MouseEvent | PointerEvent): void {
    this.isPainting = false;
  }

  onCanvasMouseEnter(): void {
    this.isCursorOverCanvas = true;
  }

  onCanvasMouseMove(event: MouseEvent | PointerEvent): void {
    if (!this.isCursorOverCanvas) {
      this.isCursorOverCanvas = true;
    }
    if (this.lensEnabled) {
      this.updateLens(event);
    }
  }

  onCanvasMouseLeave(_event: MouseEvent | PointerEvent): void {
    this.isPainting = false;
    this.isCursorOverCanvas = false;
    this.lastLensDomX = null;
    this.lastLensDomY = null;
    if (this.lensEnabled && this.lensCanvas?.nativeElement) {
      const c = this.lensCanvas.nativeElement;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, c.width, c.height);
      }
    }
  }

  onCanvasWheel(event: WheelEvent): void {
    if (!this.lensEnabled || !event.altKey) {
      return;
    }
    event.preventDefault();
    const direction = event.deltaY > 0 ? 1 : -1;
    const nextZoom = this.lensZoom + direction * this.lensZoomStep;
    this.lensZoom = Math.min(this.lensZoomMax, Math.max(this.lensZoomMin, nextZoom));
  }

  onEnterImmersiveClick(): void {
    this.enterImmersiveMode.emit();
  }

  enterMobileFullScreen(): void {
    if (!this.isMobileLayout || this.isMobileFullScreen) {
      return;
    }
    this.requestMobileFullScreen.emit();
  }

  exitMobileFullScreenClick(): void {
    if (!this.isMobileLayout) {
      return;
    }
    this.exitMobileFullScreen.emit();
  }

  openControlsClick(): void {
    if (!this.isMobileLayout) {
      return;
    }
    this.requestOpenControls.emit();
  }

  onEnterImmersiveHover(entering: boolean, element?: HTMLElement): void {
    if (!element) {
      return;
    }
    this.immersiveHandleHoverAnimations.get(element)?.cancel();
    const animation = animate(
      element,
      {
        transform: entering ? ['scale(1)', 'scale(1.04)'] : ['scale(1.04)', 'scale(1)'],
      },
      { duration: 0.18, easing: 'ease-out' },
    );
    this.immersiveHandleHoverAnimations.set(element, animation);
    animation.finished.finally(() => {
      if (this.immersiveHandleHoverAnimations.get(element) === animation && !entering) {
        element.style.transform = '';
        this.immersiveHandleHoverAnimations.delete(element);
      }
    });
  }

  toggleLens(): void {
    this.lensEnabled = !this.lensEnabled;
    if (this.lensEnabled) {
      this.startLensLoop();
    } else {
      this.stopLensLoop();
      if (this.lensCanvas?.nativeElement) {
        const c = this.lensCanvas.nativeElement;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, c.width, c.height);
        }
      }
    }
  }

  openRuleOverlay(): void {
    if (!this.ruleName) {
      return;
    }
    this.ruleOverlayOpen = true;
  }

  closeRuleOverlay(): void {
    this.ruleOverlayOpen = false;
  }

  private startLensLoop(): void {
    if (this.lensAnimationFrameId !== null) {
      cancelAnimationFrame(this.lensAnimationFrameId);
      this.lensAnimationFrameId = null;
    }
    const loop = () => {
      if (!this.lensEnabled) {
        this.lensAnimationFrameId = null;
        return;
      }
      if (this.lastLensDomX !== null && this.lastLensDomY !== null) {
        this.renderLensAtDomPosition(this.lastLensDomX, this.lastLensDomY);
      }
      this.lensAnimationFrameId = requestAnimationFrame(loop);
    };
    this.lensAnimationFrameId = requestAnimationFrame(loop);
  }

  private stopLensLoop(): void {
    if (this.lensAnimationFrameId !== null) {
      cancelAnimationFrame(this.lensAnimationFrameId);
      this.lensAnimationFrameId = null;
    }
  }

  private updateLens(event: MouseEvent | PointerEvent): void {
    const main = this.automataCanvasContainer?.nativeElement;
    if (!main) {
      return;
    }
    const rect = main.getBoundingClientRect();
    const domX = event.clientX - rect.left;
    const domY = event.clientY - rect.top;
    this.lastLensDomX = domX;
    this.lastLensDomY = domY;
  }

  private renderLensAtDomPosition(domX: number, domY: number): void {
    const main = this.automataCanvasContainer?.nativeElement;
    const lens = this.lensCanvas?.nativeElement;
    if (!main || !lens) {
      return;
    }
    const rect = main.getBoundingClientRect();
    const srcW = main.width || rect.width || 1;
    const srcH = main.height || rect.height || 1;
    const scaleX = rect.width ? srcW / rect.width : 1;
    const scaleY = rect.height ? srcH / rect.height : 1;
    const cx = domX * scaleX;
    const cy = domY * scaleY;
    const lensSize = this.lensSize;
    const zoom = this.lensZoom;
    const sw = (lensSize * scaleX) / zoom;
    const sh = (lensSize * scaleY) / zoom;
    let sx = cx - sw / 2;
    let sy = cy - sh / 2;
    sx = Math.max(0, Math.min(sx, srcW - sw));
    sy = Math.max(0, Math.min(sy, srcH - sh));
    lens.width = lensSize;
    lens.height = lensSize;
    const ctx = lens.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, lensSize, lensSize);
    ctx.drawImage(main, sx, sy, sw, sh, 0, 0, lensSize, lensSize);
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    const label = `x${this.lensZoom.toFixed(1).replace(/\.0$/, '')}`;
    ctx.fillText(label, lensSize - 6, lensSize - 4);
  }

  private playImmersiveHandleIntro(element: HTMLElement): void {
    element.style.opacity = '0';
    element.style.transform = 'translateY(-8px)';
    this.immersiveHandleEntranceAnimations.get(element)?.cancel();
    const animation = animate(
      element,
      { opacity: [0, 1], transform: ['translateY(-8px)', 'translateY(0)'] },
      { duration: 0.4, easing: 'ease-out' },
    );
    this.immersiveHandleEntranceAnimations.set(element, animation);
    animation.finished.finally(() => {
      if (this.immersiveHandleEntranceAnimations.get(element) === animation) {
        element.style.opacity = '';
        element.style.transform = '';
        this.immersiveHandleEntranceAnimations.delete(element);
      }
    });
  }
}
