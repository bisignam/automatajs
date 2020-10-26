import { BriansBrain } from "../automata-rules/briansbrain";
import { Color } from "./color";

export class DefaultSettings {
  static automata = new BriansBrain();
  static backgroundColor = new Color(0, 0, 0);
  static gridColor = new Color(255, 255, 255);
  static activationColor = new Color(255, 0, 0);
  static pixelSize = 10;
}
