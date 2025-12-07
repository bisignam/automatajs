import { ElementRef, Injectable } from '@angular/core';
import { CellularAutomaton } from './cellularautomaton';
import { BehaviorSubject, Observable } from 'rxjs';
import { DefaultSettings } from './defaultSettings';
import { OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { DisplayPassShader } from './display-pass-shader';
import { Shader, Texture } from 'three';
import { GameOfLife } from '../automata-rules/gameoflife';
import { ChangeColorShader } from './change-color-shader';
import { ResetAllColorsShader } from './reset-all-colors-shader';

@Injectable({
  providedIn: 'root', //means singleton service
})
export class ThreeService implements OnDestroy {
  private currentStep = 1;
  private maxStep = 1;
  private canvas: HTMLCanvasElement;
  private _cellularAutomaton: CellularAutomaton = new GameOfLife(); //TODO allow to initialize externally
  private automatonMaterial: THREE.ShaderMaterial;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.OrthographicCamera;
  private stepperScene: THREE.Scene;
  private displayScene: THREE.Scene;
  private changeColorScene: THREE.Scene;
  private resetAllColorsScene: THREE.Scene;
  private frameId: number = null;
  private squares: Array<THREE.Mesh>;
  private buffers: Array<THREE.WebGLRenderTarget>;
  private drawWithMouse = true; //NOTE: not exposed externally, just for debugging
  private isDrawing = false;
  private mouse: THREE.Vector2; //The mouse position
  private raycaster: THREE.Raycaster; //For managing mouse interesection with objects
  private _automataSize = new BehaviorSubject<number>(
    DefaultSettings.pixelSize
  );
  private simulationWidth = 0;
  private simulationHeight = 0;
  private initialized = false;
  private nextStateIndex = 0;
  private displayPassShader = new DisplayPassShader();
  private changeColorShader = new ChangeColorShader();
  private resetAllColorsShader = new ResetAllColorsShader();
  private _activeColor = DefaultSettings.activationColor;
  private _deadColor = DefaultSettings.backgroundColor;
  private play = false;
  private automatonMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private automatonPlane: THREE.PlaneGeometry;
  private textureLoader = new THREE.TextureLoader();
  private _fpsCap: number = DefaultSettings.fpsCap;

  /**
   * Cancel the current animation frame
   */
  public ngOnDestroy(): void {
    /*  */
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  /**
   * Setup the threejs component
   */
  public setup(canvas: ElementRef<HTMLCanvasElement>): void {
    if (this.initialized) {
      return;
    }
    this.canvas = canvas.nativeElement;
    var glContextAttributes = { preserveDrawingBuffer: true };
    var gl = this.canvas.getContext('experimental-webgl', glContextAttributes);
    this.raycaster = new THREE.Raycaster();

    this.squares = new Array<THREE.Mesh>();
    const width = Math.max(1, Math.floor(this.canvas.clientWidth));
    const height = Math.max(1, Math.floor(this.canvas.clientHeight));
    this.simulationWidth = width;
    this.simulationHeight = height;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });

    this.resizeRendererToDisplaySize(this.canvas);
    this.renderer.autoClearColor = false;

    const step1 = new THREE.WebGLRenderTarget(this.simulationWidth, this.simulationHeight);
    const step2 = new THREE.WebGLRenderTarget(this.simulationWidth, this.simulationHeight);

    this.buffers = [step1, step2];

    //We make the camera take the whole screen with his frustum
    this.camera = new THREE.OrthographicCamera(
      -(this.simulationWidth / 2), // left
      this.simulationWidth / 2, // right
      this.simulationHeight / 2, // top
      -(this.simulationHeight / 2), // bottom
      -1, // near,
      1 // far
    );

    //NOTE: this must be called before configuring the mesh
    // because the vector uniforms must be initialized
    this.setupAutomataParameters(this._cellularAutomaton);

    this.stepperScene = new THREE.Scene();
    //NOTE: cellular automaton IS A SHADER
    this.automatonPlane = new THREE.PlaneGeometry(
      this.simulationWidth,
      this.simulationHeight
    );
    this.automatonMaterial = this.createShaderMaterial(this.cellularAutomaton);
    this.automatonMesh = new THREE.Mesh(
      this.automatonPlane,
      this.automatonMaterial
    );
    this.stepperScene.add(this.automatonMesh);
    this.displayScene = new THREE.Scene();
    const plane2 = new THREE.PlaneGeometry(
      this.simulationWidth,
      this.simulationHeight
    );
    this.displayScene.add(
      new THREE.Mesh(plane2, this.createShaderMaterial(this.displayPassShader))
    );

    this.changeColorScene = new THREE.Scene();
    const plane3 = new THREE.PlaneGeometry(
      this.simulationWidth,
      this.simulationHeight
    );
    this.changeColorScene.add(
      new THREE.Mesh(plane3, this.createShaderMaterial(this.changeColorShader))
    );
    this.resetAllColorsScene = new THREE.Scene();
    const plane4 = new THREE.PlaneGeometry(
      this.simulationWidth,
      this.simulationHeight
    );
    this.resetAllColorsScene.add(
      new THREE.Mesh(
        plane4,
        this.createShaderMaterial(this.resetAllColorsShader)
      )
    );

    this.configureMouseDrawingEvents(this.canvas);
    this.animate = this.animate.bind(this);
    this.initialized = true;
    // this.play = true; //enable playing animation
    requestAnimationFrame(this.animate);
  }

  private changeAutomaton(
    previousStateIndex: number,
    automaton: CellularAutomaton,
    preserveState: boolean
  ): Promise<void> {
    if (preserveState) {
      return new Promise((resolve) => {
        this.textureLoader.load(this.canvas.toDataURL(), (texture) => {
          this.rebuildAutomaton(previousStateIndex, automaton, texture);
          resolve();
        });
      });
    }
    this.rebuildAutomaton(previousStateIndex, automaton);
    return Promise.resolve();
  }

  private rebuildAutomaton(
    previousStateIndex: number,
    automaton: CellularAutomaton,
    preservedTexture?: THREE.Texture
  ): void {
    this.renderer.dispose();
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.resizeRendererToDisplaySize(this.canvas);
    this.renderer.autoClearColor = false;
    this.buffers[previousStateIndex].dispose();
    this.buffers[previousStateIndex] = new THREE.WebGLRenderTarget(
      this.simulationWidth,
      this.simulationHeight
    );
    this.buffers[this.nextStateIndex].dispose();
    this.buffers[this.nextStateIndex] = new THREE.WebGLRenderTarget(
      this.simulationWidth,
      this.simulationHeight
    );
    if (preservedTexture) {
      preservedTexture.minFilter = THREE.LinearFilter;
      this.buffers[previousStateIndex].texture = preservedTexture;
      this.buffers[previousStateIndex].texture.needsUpdate = true;
    }
    this.automatonPlane.dispose();
    this.automatonPlane = new THREE.PlaneGeometry(
      this.simulationWidth,
      this.simulationHeight
    );
    this._cellularAutomaton = automaton;
    this.automatonMaterial.dispose();
    this.automatonMaterial = this.createShaderMaterial(this._cellularAutomaton);
    this.automatonMesh.clear();
    this.automatonMesh = new THREE.Mesh(
      this.automatonPlane,
      this.automatonMaterial
    );
    this.setupAutomataParameters(automaton);
    this.stepperScene.clear();
    this.stepperScene = new THREE.Scene();
    this.stepperScene.add(this.automatonMesh);
  }

  private copyStep(previousStateIndex: number) {
    this.stepForward(previousStateIndex, true);
    this.display(
      this.buffers[this.nextStateIndex],
      this.buffers[previousStateIndex]
    );
    this.nextStateIndex = previousStateIndex;
  }

  public async reset(
    automaton?: CellularAutomaton,
    options?: { preserveState?: boolean }
  ): Promise<void> {
    const preserveState = options?.preserveState !== false;
    let previousStateIndex = this.computePreviouStateIndex();
    //If we pass the automaton it means we want to reset the scene with the new one
    if (automaton) {
      await this.changeAutomaton(previousStateIndex, automaton, preserveState);
      this.copyStep(previousStateIndex);
    } else {
      this.copyStep(previousStateIndex);
    }
  }

  private createShaderMaterial(shader: Shader): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: shader.uniforms,
      fragmentShader: shader.fragmentShader,
    });
  }

  private resizeRendererToDisplaySize(canvas: HTMLCanvasElement): boolean {
    if (!canvas) {
      return false;
    }
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));

    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      this.renderer.setSize(width, height, false);
    }
    return needResize;
  }

  private configureMouseDrawingEvents(canvas: HTMLCanvasElement) {
    this.mouse = new THREE.Vector2();
    if (!this.drawWithMouse) {
      return;
    }
    const handlePointerMove = (clientX: number, clientY: number) => {
      this.updatePointerPosition(canvas, clientX, clientY);
      if (this.isDrawing) {
        this.drawSquareIfNecessary();
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      this.isDrawing = true;
      handlePointerMove(event.clientX, event.clientY);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!this.isDrawing) {
        return;
      }
      event.preventDefault();
      handlePointerMove(event.clientX, event.clientY);
    };

    const handleMouseUpOrLeave = () => {
      this.isDrawing = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUpOrLeave);
    canvas.addEventListener('mouseleave', handleMouseUpOrLeave);

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 0) {
        return;
      }
      this.isDrawing = true;
      event.preventDefault();
      const touch = event.touches[0];
      handlePointerMove(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!this.isDrawing || event.touches.length === 0) {
        return;
      }
      event.preventDefault();
      const touch = event.touches[0];
      handlePointerMove(touch.clientX, touch.clientY);
    };

    const handleTouchEndOrCancel = () => {
      this.isDrawing = false;
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEndOrCancel);
    canvas.addEventListener('touchcancel', handleTouchEndOrCancel);
    canvas.style.touchAction = 'none';
  }

  private updatePointerPosition(
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number
  ): void {
    if (!canvas) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const domWidth = Math.max(rect.width, 1);
    const domHeight = Math.max(rect.height, 1);
    const normalizedX = (clientX - rect.left) / domWidth;
    const normalizedY = (clientY - rect.top) / domHeight;

    const left = this.camera.left;
    const right = this.camera.right;
    const bottom = this.camera.bottom;
    const top = this.camera.top;

    const worldX = left + normalizedX * (right - left);
    const worldY = bottom + (1 - normalizedY) * (top - bottom);
    const cellSize = this._automataSize.value;

    const spanX = right - left;
    const spanY = top - bottom;
    const totalCols = Math.max(Math.floor(spanX / cellSize), 1);
    const totalRows = Math.max(Math.floor(spanY / cellSize), 1);
    const col = Math.floor((worldX - left) / cellSize);
    const row = Math.floor((worldY - bottom) / cellSize);
    const clampedCol = Math.min(Math.max(col, 0), totalCols - 1);
    const clampedRow = Math.min(Math.max(row, 0), totalRows - 1);

    this.mouse.x = left + clampedCol * cellSize + cellSize / 2;
    this.mouse.y = bottom + clampedRow * cellSize + cellSize / 2;
  }

  private setupChangeColorShader(
    oldColor: THREE.Color,
    newColor: THREE.Color
  ): void {
    this.changeColorShader.uniforms.u_texture = {
      value: this.buffers[this.computePreviouStateIndex()].texture,
    };
    this.changeColorShader.uniforms.u_resolution = {
      value: new THREE.Vector2(this.simulationWidth, this.simulationHeight),
    };
    this.changeColorShader.uniforms.u_old_color = {
      value: new THREE.Vector4(oldColor.r, oldColor.g, oldColor.b, 1),
    };
    this.changeColorShader.uniforms.u_new_color = {
      value: new THREE.Vector4(newColor.r, newColor.g, newColor.b, 1),
    };
  }

  private setupResetAllColorsShader(newColor: THREE.Color): void {
    this.resetAllColorsShader.uniforms.u_texture = {
      value: this.buffers[this.computePreviouStateIndex()].texture,
    };
    this.resetAllColorsShader.uniforms.u_resolution = {
      value: new THREE.Vector2(this.simulationWidth, this.simulationHeight),
    };
    this.resetAllColorsShader.uniforms.u_new_color = {
      value: new THREE.Vector4(newColor.r, newColor.g, newColor.b, 1),
    };
  }

  private setupAutomataParameters(automaton: CellularAutomaton): void {
    if (!automaton.uniforms.u_texture) {
      automaton.uniforms.u_texture = {
        value: null,
      };
    }
    automaton.uniforms.u_resolution = {
      value: new THREE.Vector2(this.simulationWidth, this.simulationHeight),
    };
    (automaton.uniforms.u_automata_size = {
      value: this._automataSize.value,
    }),
      (automaton.uniforms.u_grid_weigth = {
        value: 1,
      });
    automaton.uniforms.u_grid_color = {
      value: new THREE.Vector4(0, 0, 0, 1),
    };
    (automaton.uniforms.u_grid_active = {
      value: false,
    }),
      (automaton.uniforms.u_alive_color = {
        value: new THREE.Vector4(
          this._activeColor.r,
          this._activeColor.g,
          this._activeColor.b,
          1
        ),
      }),
      (automaton.uniforms.u_dead_color = {
        value: new THREE.Vector4(
          this._deadColor.r,
          this._deadColor.g,
          this._deadColor.b,
          1
        ),
      });
    automaton.uniforms.u_copy_step = { value: false };
    //Here we set the additional colors which can exist or not depending on the specific shader we are using
    this.setupAdditionalAutomataParameters(automaton);
  }

  private setupAdditionalAutomataParameters(automaton: CellularAutomaton) {
    this._cellularAutomaton.additionalColorsArray.forEach((addC) => {
      automaton.uniforms[addC.uniformName] = {
        value: new THREE.Vector4(addC.color.r, addC.color.g, addC.color.b, 1),
      };
    });
  }

  private drawSquare(x: number, y: number, scene: THREE.Scene) {
    //we need a square, basically a plane with z set to zero
    const automata = new THREE.PlaneGeometry(
      this._automataSize.value,
      this._automataSize.value
    );
    const automataMaterial = new THREE.MeshBasicMaterial({
      color: this._activeColor,
    });
    const automataMesh = new THREE.Mesh(automata, automataMaterial);
    scene.add(automataMesh);
    automataMesh.position.set(x, y, 0);
    this.squares.push(automataMesh);
  }

  private clearSquares() {
    for (const square of this.squares) {
      this.stepperScene.remove(square);
    }
  }

  private drawSquareIfNecessary() {
    if (this.isDrawing) {
      const intersects = this.raycaster.intersectObjects(
        this.stepperScene.children
      );
      if (intersects.length > 0) {
        this.drawSquare(this.mouse.x, this.mouse.y, this.stepperScene);
      }
    }
  }

  public animate(): void {
    setTimeout(
      () =>
        requestAnimationFrame(() => {
          this.animate();
        }),
      1000 / this._fpsCap
    );
    this.resizeRendererToDisplaySize(this.canvas);
    if (this.isDrawing) {
      if (this.drawWithMouse) {
        this.drawSquareIfNecessary();
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.stepperScene, this.camera);
        return;
      }
    } else if (this.play || this.currentStep === 1) {
      this.forwardAndDisplay();
    }
  }

  public forwardAndDisplay() {
    const previousStateIndex = this.computePreviouStateIndex();
    this.stepForward(previousStateIndex);
    this.displayStep();
    this.clearSquares();
    this.nextStateIndex = previousStateIndex;
    this.currentStep++;
  }

  computePreviouStateIndex(): number {
    return 1 - this.nextStateIndex;
  }

  private stepForward(previousStateIndex: number, copyStep?: Boolean): void {
    this._cellularAutomaton.step(
      this.canvas,
      this.renderer,
      this.buffers[previousStateIndex],
      this.buffers[this.nextStateIndex],
      this.stepperScene,
      this.camera,
      copyStep
    ); // Apply the automata
  }

  private display(
    source: THREE.WebGLRenderTarget,
    target?: THREE.WebGLRenderTarget
  ) {
    if (target) {
      // Internal blits honor the destination render target dimensions
      this.displayPassShader.uniforms.u_resolution.value.set(
        target.width,
        target.height
      );
    } else {
      const size = this.renderer.getSize(new THREE.Vector2());
      this.displayPassShader.uniforms.u_resolution.value.set(size.x, size.y);
    }
    this.displayPassShader.uniforms.u_texture.value = source.texture;
    this.renderer.setRenderTarget(!target ? null : target);
    this.renderer.render(this.displayScene, this.camera);
  }

  private displayStep(): void {
    //NOTE:here we simpy take the result of stepper and we paint it to screen
    this.display(this.buffers[this.nextStateIndex]);
  }

  /**
   * Starts a new automata animation
   */
  public startAutomata(maxStep: number): void {
    if (!this._cellularAutomaton) {
      //TODO add logging
      return;
    }
    this.play = true;
  }

  /**
   * Stops the automata animation
   */
  public stopAutomata(): void {
    // console.log('stopAutomata');
    this.play = false;
  }

  public async setAutomataAndStopCurrent(
    automaton: CellularAutomaton,
    options?: { preserveState?: boolean }
  ): Promise<void> {
    let wasPlaying = false;
    if (this.play) {
      wasPlaying = true;
      this.play = false;
    }
    await this.reset(automaton, { preserveState: options?.preserveState });
    if (options?.preserveState === false) {
      this.clear();
    }
    if (wasPlaying) {
      this.play = true;
    }
  }

  get cellularAutomaton(): CellularAutomaton {
    return this._cellularAutomaton;
  }

  public get activeColor(): THREE.Color {
    return this._activeColor;
  }

  public set activeColor(activeColor: THREE.Color) {
    this.changeColor('activeColor', activeColor);
  }

  public get deadColor() {
    return this._deadColor;
  }

  public set deadColor(deadColor: THREE.Color) {
    this.changeColor('deadColor', deadColor);
  }

  public changeColor(name: string, color: THREE.Color) {
    if (!color) {
      throw new Error('Invalid ' + name + ' color.');
    }
    const wasPlaying = this.play;
    if (wasPlaying) {
      this.play = false;
    }
    if (this.initialized) {
      //NOTE: If it was not playing we need to maintain th drawn squares
      //The ones which are not already painted on the offscreen renderer target
      if (!wasPlaying) {
        //NOTE: by passing true to copyStep we tell to the automata shader
        // to act as a copy shader but always on the stepper scene
        // this way we can manage a copy of the previous state without
        // creating a new scene
        this.stepForward(this.computePreviouStateIndex(), true);
        this.display(
          this.buffers[this.nextStateIndex],
          this.buffers[this.computePreviouStateIndex()]
        );
      }
      if (name === 'activeColor') {
        this.setupChangeColorShader(this._activeColor.clone(), color);
        this._activeColor = color;
        this.cellularAutomaton.uniforms.u_alive_color = {
          value: new THREE.Vector4(
            this._activeColor.r,
            this._activeColor.g,
            this._activeColor.b,
            1
          ),
        };
      } else if (name === 'deadColor') {
        this.setupChangeColorShader(this._deadColor.clone(), color);
        this._deadColor = color;
        this.cellularAutomaton.uniforms.u_dead_color = {
          value: new THREE.Vector4(
            this._deadColor.r,
            this._deadColor.g,
            this._deadColor.b,
            1
          ),
        };
      } else {
        //We are dealing with an additional color
        let additionalColor = this._cellularAutomaton.getAdditionalColor(name);
        this.setupChangeColorShader(additionalColor.color.clone(), color);
        additionalColor.color = color;
        this.cellularAutomaton.uniforms[additionalColor.uniformName] = {
          value: new THREE.Vector4(
            additionalColor.color.r,
            additionalColor.color.g,
            additionalColor.color.b,
            1
          ),
        };
      }
      //NOTE: maintain the previous state of the scene
      this.renderer.setRenderTarget(this.buffers[this.nextStateIndex]);
      this.renderer.render(this.changeColorScene, this.camera);
      this.displayStep();
      this.clearSquares();
      this.nextStateIndex = this.computePreviouStateIndex();
    }
    if (wasPlaying) {
      this.play = true;
    }
  }

  public clear() {
    if (this.initialized) {
      this.setupResetAllColorsShader(this.deadColor);
      this.renderer.setRenderTarget(this.buffers[this.nextStateIndex]);
      this.renderer.render(this.resetAllColorsScene, this.camera);
      this.displayStep();
      this.clearSquares();
      this.nextStateIndex = this.computePreviouStateIndex();
    }
  }

  async resizeAutomata(automataSize: number) {
    let wasPlaying = false;
    if (this.play) {
      wasPlaying = true;
      this.play = false;
    }
    this.play = false;
    this.automataSize = automataSize;
    if (this.initialized) {
      this.cellularAutomaton.uniforms.u_automata_size = {
        value: automataSize,
      };
      await this.reset();
    }
    if (wasPlaying) {
      this.play = true;
    }
  }

  getAutomataSizeObservable(): Observable<number> {
    return this._automataSize.asObservable();
  }

  private set automataSize(pixelSize: number) {
    this._automataSize.next(pixelSize);
  }

  private get automataSize(): number {
    return this._automataSize.value;
  }

  public get fpsCap(): number {
    return this._fpsCap;
  }

  public set fpsCap(value: number) {
    let wasPlaying = false;
    if (this.play) {
      wasPlaying = true;
      this.play = false;
    }
    this._fpsCap = value;
    if (wasPlaying) {
      this.play = true;
    }
  }
}
