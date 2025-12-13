import * as THREE from "three";
import { Shader } from 'three';

/**
 * FullscreenShaderPass
 *
 * A tiny helper that runs a fragment shader "over the whole texture" by drawing
 * a single fullscreen quad into a render target (or into the canvas).
 *
 * Why this exists:
 * - Three.js makes "run a fragment shader into a texture" surprisingly verbose:
 *   you need a Scene, a Camera, a Mesh, a Geometry, a Material, and a render call.
 * - In AutomataJS, we do this pattern repeatedly (step passes, resize passes, blits, etc).
 * - We want code that reads like: "run resize pass from old texture to new target",
 *   not hundreds of lines of boilerplate.
 *
 * Important mental model (matches your project context):
 * - The simulation state lives in WebGLRenderTarget textures (ping-pong buffers).
 * - Shaders don't hold state; they just transform source textures into destination textures.
 * - So this helper is a "GPU pass runner", nothing more. :contentReference[oaicite:2]{index=2}
 */
export class FullscreenShaderPass {
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.OrthographicCamera;
  private readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

  /**
   * This is a throwaway, owned-by-this-class material.
   *
   * We keep it so the pass is always in a valid, renderable state.
   * (A Mesh must always have a material, and a ShaderMaterial must have shaders.)
   *
   * Also: the bright pink output is a deliberate "something is wrong" signal.
   */
  private readonly fallbackMaterial: THREE.ShaderMaterial;

  /**
   * Scratch objects to avoid per-frame allocations.
   */
  private readonly prevViewport = new THREE.Vector4();

  constructor() {
    this.scene = new THREE.Scene();

    // This camera + a PlaneGeometry(2,2) forms a clip-space fullscreen quad.
    // We are not using world units; we are just ensuring the fragment shader runs
    // once for every pixel in the active render target.
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.PlaneGeometry(2, 2);

    // Minimal passthrough vertex shader: position is already in clip-space.
    const fullscreenVertex = `
      void main() {
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `;

    // Debug fallback: paints magenta.
    const fallbackFragment = `
      void main() {
        gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
      }
    `;

    this.fallbackMaterial = new THREE.ShaderMaterial({
      vertexShader: fullscreenVertex,
      fragmentShader: fallbackFragment,
      uniforms: {},
      // These are almost always what you want for deterministic GPU passes.
      depthTest: false,
      depthWrite: false,
      // transparent doesn't matter for render targets; safe either way.
      transparent: false,
    });

    this.mesh = new THREE.Mesh(geometry, this.fallbackMaterial);
    this.scene.add(this.mesh);
  }

  /**
   * Convenience to create a pass material.
   *
   * You usually create one material per "type of pass" (resize, display/blit, step, etc),
   * then update uniforms and reuse it many times.
   */
  createMaterial(shader: Shader): THREE.ShaderMaterial {
    const fullscreenVertex = `
        void main() {
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `;

    return new THREE.ShaderMaterial({
      vertexShader: fullscreenVertex,
      fragmentShader: shader.fragmentShader,
      uniforms: shader.uniforms ?? {},
      depthTest: false,
      depthWrite: false,
      transparent: false,
    });
  }

  /**
   * Render one pass.
   *
   * target:
   * - WebGLRenderTarget: write into that texture
   * - null: write into the canvas (renderer backbuffer)
   *
   * material:
   * - the shader program to run (with its current uniform values)
   *
   * beforeRender:
   * - optional hook for "just-in-time uniform updates" right before the draw
   *
   * Notes that matter in AutomataJS:
   * - If your fragment shader uses gl_FragCoord (common for CA stepping),
   *   the viewport MUST match the target resolution, or coordinates go wrong.
   * - This helper sets the viewport for the duration of the pass and restores it.
   */
  render(
    renderer: THREE.WebGLRenderer,
    target: THREE.WebGLRenderTarget | null,
    material: THREE.ShaderMaterial,
    beforeRender?: () => void,
  ): void {
    // Swap in the requested material for this draw.
    // This does NOT clone or allocate anything. It just changes the pointer.
    this.mesh.material = material;

    if (beforeRender) beforeRender();

    // Save state we are about to override.
    const prevTarget = renderer.getRenderTarget();
    renderer.getViewport(this.prevViewport);

    // Bind destination.
    renderer.setRenderTarget(target);

    // Make viewport match the destination resolution.
    // This keeps gl_FragCoord.xy aligned to pixel coordinates in that destination.
    if (target) {
      renderer.setViewport(0, 0, target.width, target.height);
    } else {
      // When rendering to canvas, match the renderer's drawing buffer size.
      // (In your engine you already resize the renderer to DPR-scaled canvas size.) :contentReference[oaicite:5]{index=5}
      const size = renderer.getSize(new THREE.Vector2());
      renderer.setViewport(0, 0, size.x, size.y);
    }

    // Run the shader by drawing the fullscreen quad.
    renderer.render(this.scene, this.camera);

    // Restore prior renderer state so callers don't get surprised.
    renderer.setRenderTarget(prevTarget);
    renderer.setViewport(
      this.prevViewport.x,
      this.prevViewport.y,
      this.prevViewport.z,
      this.prevViewport.w,
    );
  }

  /**
   * Dispose the resources owned by this helper.
   *
   * Very important: we do NOT dispose whatever material was last used for rendering,
   * because that material is typically owned by the caller (resizeMaterial, stepMaterial, etc).
   *
   * So we only dispose:
   * - the quad geometry
   * - the fallback debug material that this helper created and owns
   */
  dispose(): void {
    this.mesh.geometry.dispose();
    this.fallbackMaterial.dispose();
  }
}
