import * as THREE from 'three';
import { Shader } from 'three';

export class ResetAllColorsShader implements Shader {
  fragmentShader = `
        uniform sampler2D u_texture;
        uniform vec2 u_resolution;
        uniform vec4 u_new_color;

        void main() {
            gl_FragColor = u_new_color;
        }
    `;
  vertexShader = '';
  uniforms = {
    u_texture: { value: null },
    u_resolution: { value: new THREE.Vector2() },
    u_new_color: { value: new THREE.Vector4() },
  };
}
