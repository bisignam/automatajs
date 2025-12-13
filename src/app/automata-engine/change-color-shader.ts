import * as THREE from 'three';
import { Shader } from 'three';

export class ChangeColorShader implements Shader {
  // language=GLSL
  fragmentShader = `
        uniform sampler2D u_texture;
        uniform vec2 u_resolution;
        uniform vec4 u_old_color;
        uniform vec4 u_new_color;

        bool isOldColor(vec2 coord) {
            vec4 px = texture2D(u_texture, coord );
            return equal(px, u_old_color) == bvec4(true, true, true, true);
        }

        void main() {
            vec2 coord = gl_FragCoord.xy/u_resolution;
            if(isOldColor(coord)){
                gl_FragColor = u_new_color;
            } else {
                gl_FragColor = texture2D(u_texture, coord);
            }
        }
    `;
  vertexShader = '';
  uniforms = {
    u_texture: { value: null },
    u_resolution: { value: new THREE.Vector2() },
    u_old_color: { value: new THREE.Vector4() },
    u_new_color: { value: new THREE.Vector4() },
  };
}
