import * as THREE from 'three';
import { Shader } from 'three';

export interface AdditionalColorType {
  displayName: string;
  uniformName: string;
  color: THREE.Color;
}

export abstract class CellularAutomaton implements Shader {
  uniforms: { [uniform: string]: THREE.IUniform };
  vertexShader: string;
  automataShader: string;
  fragmentShader: string;

  private _additionalColors: Map<String, AdditionalColorType> = new Map<
    String,
    AdditionalColorType
  >();

  constructor(
    automataShader: string,
    additionalColorsList: Array<AdditionalColorType>,
    additionalFunctions?: string
  ) {
    let additionalColorsUniforms = '';
    additionalColorsList.forEach((addC) => {
      this._additionalColors.set(addC.displayName, addC);
      additionalColorsUniforms += 'uniform vec4 ' + addC.uniformName + ';\n';
    });

    //NOTE: basically we are creating a template for all automata shaders
    //like importing some common functions
    this.fragmentShader =
      `
    uniform vec2 u_resolution;
    uniform sampler2D u_texture;
    uniform float u_automata_size;
    uniform float u_grid_weigth;
    uniform vec4 u_grid_color;
    uniform bool u_grid_active;
    uniform vec4 u_alive_color;
    uniform vec4 u_dead_color;
    uniform bool u_copy_step;
    ` +
      additionalColorsUniforms +
      `
    int wasAlive(vec2 coord) {
      vec4 px = texture2D(
          u_texture, mod(coord / u_resolution, 1.)); // mod for toroidal surface
      return equal(px, u_alive_color) == bvec4(true, true, true, true) ? 1 : 0;
    }

    int aliveMooreNeighbors(const in vec2 coord) {
      return wasAlive(coord + vec2(-u_automata_size, -u_automata_size)) +
           wasAlive(coord + vec2(-u_automata_size, 0.)) +
           wasAlive(coord + vec2(-u_automata_size, u_automata_size)) +
           wasAlive(coord + vec2(0., -u_automata_size)) +
           wasAlive(coord + vec2(0., u_automata_size)) +
           wasAlive(coord + vec2(u_automata_size, -u_automata_size)) +
           wasAlive(coord + vec2(u_automata_size, 0.)) +
           wasAlive(coord + vec2(u_automata_size, u_automata_size));
    }
    
    vec2 getBlockCenter(const in vec2 vPos) {
      vec2 pos = floor((vPos - 0.5) / u_automata_size) * u_automata_size;
      pos.x = pos.x + u_automata_size / 2.0;
      pos.y = pos.y + u_automata_size / 2.0;
      return pos;
    }
    
    bool isGridPixel(const in vec2 vPos) {
      bvec2 comparisonResult = lessThanEqual(mod(vPos - 0.5, u_automata_size),
                                            vec2(u_grid_weigth, u_grid_weigth));
      return comparisonResult != bvec2(false, false);
    }
    ` +
      (additionalFunctions ? additionalFunctions : '') +
      `
    void main() {
      if(u_copy_step == true) {
        vec2 coord = gl_FragCoord.xy/u_resolution;
        gl_FragColor = texture2D(u_texture, coord);
      } else {
        if (!isGridPixel(gl_FragCoord.xy) || !u_grid_active) {
          vec2 coord = getBlockCenter(gl_FragCoord.xy);` +
      automataShader +
      `
        } else {
          gl_FragColor = u_grid_color;
        }
      }
    }
  `;
  }

  public step(
    canvas: HTMLCanvasElement,
    renderer: THREE.WebGLRenderer,
    source: THREE.WebGLRenderTarget,
    target: THREE.WebGLRenderTarget,
    scene: THREE.Scene,
    camera: THREE.Camera,
    copyStep?: Boolean
  ): void {
    this.uniforms.u_resolution.value.set(
      canvas.clientWidth,
      canvas.clientHeight
    );
    this.uniforms.u_texture.value = source.texture;
    this.uniforms.u_copy_step.value = copyStep ? true : false;
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
  }

  public getAdditionalColor(displayName: string): AdditionalColorType {
    return this._additionalColors.get(displayName);
  }

  public setadditionalColor(displayName: string, color: THREE.Color): void {
    this._additionalColors.get(displayName).color = color;
  }

  public get additionalColorsArray(): Array<AdditionalColorType> {
    let additionalColorsArray = new Array<AdditionalColorType>();
    this._additionalColors.forEach(
      (value: AdditionalColorType, key: string) => {
        additionalColorsArray.push(value);
      }
    );
    return additionalColorsArray;
  }
}
