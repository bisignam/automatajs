import * as THREE from 'three';
import { Shader } from "three";


export interface AdditionalColorType {
  name: string;
  color: THREE.Color;
}

export abstract class CellularAutomaton implements Shader {
  uniforms: { [uniform: string]: THREE.IUniform; };
  vertexShader: string;
  fragmentShader: string;
  protected _additionalColors: Array<AdditionalColorType> = new Array<
    AdditionalColorType
  >();

  protected automataShader: Shader;

  public step(canvas: HTMLCanvasElement, renderer: THREE.WebGLRenderer, 
    source: THREE.WebGLRenderTarget, 
    target: THREE.WebGLRenderTarget, scene: THREE.Scene, 
    camera: THREE.Camera): void {
    this.uniforms.u_resolution.value.set(canvas.clientWidth, canvas.clientHeight);
 //   console.log("(automata.step) Received texture "+source.texture.uuid);
    this.uniforms.u_texture.value = source.texture;
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
  }

}
