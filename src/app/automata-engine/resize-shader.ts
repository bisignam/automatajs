import * as THREE from 'three';
import { Shader } from 'three';

export class ResizeShader implements Shader {
  //language=GLSL
  fragmentShader = `
        uniform sampler2D u_old_texture;
        uniform vec2 u_resolution_old;
        uniform vec2 u_resolution_new;
        uniform vec4 u_background_color;
        
        void main() {
            float widthLimit = 0.0;
            float heightLimit = 0.0;
            
            if (u_resolution_new.x <= u_resolution_old.x) {
                // We shrink the width
                widthLimit = u_resolution_new.x;
            } else {
                // We expand the width
                widthLimit = u_resolution_old.x;
            }
            
            if (u_resolution_new.y <= u_resolution_old.y) {
                // We shrink the height
                heightLimit = u_resolution_new.y;
            } else {
                // We expand the height
                heightLimit = u_resolution_old.y;
            }

            // We need to normalise using the old coordinates
            //  since we are then sampling from the old texture
            vec2 finalCoord = gl_FragCoord.xy/u_resolution_old;
            
            if (gl_FragCoord.x > widthLimit || gl_FragCoord.y > heightLimit) {
               gl_FragColor = u_background_color;
            } else {
               gl_FragColor = texture2D(u_old_texture, finalCoord);
            }
          //  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
    `;
  vertexShader = '';
  uniforms = {
    u_old_texture: { value: null },
    u_resolution_old: { value: new THREE.Vector2() },
    u_resolution_new: { value: new THREE.Vector2() },
    u_background_color: { value: new THREE.Vector4() },
  };
}
