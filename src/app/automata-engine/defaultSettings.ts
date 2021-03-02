import * as THREE from "three";
import { BriansBrain } from "../automata-rules/briansbrain";

export class DefaultSettings {
  static automata = new BriansBrain();
  static backgroundColor = new THREE.Color(0, 0, 0);
  static gridColor = new THREE.Color(255, 255, 255);
  static activationColor = new THREE.Color(255, 0, 0);
  static pixelSize = 10;
}
