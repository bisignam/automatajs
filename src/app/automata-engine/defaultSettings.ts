import * as THREE from 'three';
import { BriansBrain } from '../automata-rules/briansbrain';

export class DefaultSettings {
  static automata = new BriansBrain();
  static backgroundColor = new THREE.Color('#121230');
  static gridColor = new THREE.Color(255, 255, 255);
  static activationColor = new THREE.Color('#a8c9ea');
  static pixelSize = 10;
}
