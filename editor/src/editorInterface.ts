import Physics, { AnyPhysicsObject, PinPoint } from '../../src/physics';

interface EditorInterface {
  physics: Physics;
  mouseX: number;
  mouseY: number;
  mouseDown: boolean;
  scaling: number;
  lastX: number;
  lastY: number;
  timeMultiplier: number;
  choosed: AnyPhysicsObject | boolean | PinPoint;
  cnv: HTMLCanvasElement;
  drawCollisions: boolean;
  showAxes: boolean;
  showBoundingBoxes: boolean;
}

export default EditorInterface;
