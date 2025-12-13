import * as THREE from 'three';
import { Shader } from 'three';

export class DisplayPassShader implements Shader {
  //language=GLSL
  fragmentShader = `
        uniform sampler2D u_texture;
        uniform vec2 u_resolution;
        void main() {
            vec2 coord = gl_FragCoord.xy/u_resolution; // Normalize (0, 1)
            gl_FragColor = texture2D(u_texture, coord);
        }
    `;
  vertexShader = '';
  uniforms = {
    u_texture: { value: null },
    u_resolution: { value: new THREE.Vector2() },
  };
}
