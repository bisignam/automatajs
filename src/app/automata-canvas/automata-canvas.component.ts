import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { animate } from '@motionone/dom';
import { ThreeService } from '../automata-engine/three-service';

@Component({
  selector: 'app-automata-canvas',
  templateUrl: './automata-canvas.component.html',
  styleUrls: ['./automata-canvas.component.scss'],
  standalone: false,
})
export class AutomataCanvasComponent implements AfterViewInit {
  @ViewChild('automataCanvasContainer')
  automataCanvasContainer?: ElementRef<HTMLCanvasElement>;
  threeService: ThreeService;
  private screenshotAnimations = new WeakMap<HTMLElement, ReturnType<typeof animate>>();
  isPainting = false;
  isCursorOverCanvas = false;

  constructor(threeService: ThreeService) {
    this.threeService = threeService;
  }

  ngAfterViewInit(): void {
    if (this.automataCanvasContainer) {
      this.threeService.setup(this.automataCanvasContainer);
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

  onCanvasMouseDown(_event: MouseEvent): void {
    this.isPainting = true;
  }

  onCanvasMouseUp(_event: MouseEvent): void {
    this.isPainting = false;
  }

  onCanvasMouseEnter(): void {
    this.isCursorOverCanvas = true;
  }

  onCanvasMouseMove(): void {
    if (!this.isCursorOverCanvas) {
      this.isCursorOverCanvas = true;
    }
  }

  onCanvasMouseLeave(_event: MouseEvent): void {
    this.isPainting = false;
    this.isCursorOverCanvas = false;
  }
}
