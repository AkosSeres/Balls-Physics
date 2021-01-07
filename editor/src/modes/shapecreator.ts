/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Mode from '../modeInterface';
import * as Creator from '../elementCreator';
import Vec2 from '../../../src/math/vec2';
import Body from '../../../src/entity/body';

let size = 35;
let k = 0.5;
let fc = 0.5;
let roundness = 4;
let res = 24;
const element = document.createElement('div');

/**
 * Returns an array of points resulting in a squircle with the given resolution.
 *
 * @param {number} resolution The wanted resolution
 * @param {number} p The p-norm parameter
 * @returns {Vec2[]} The points of the squircle
 */
function generateUnitSquircle(resolution = 24, p = 4) {
  return [
    ...new Array(resolution).keys(),
  ].map((i) => Vec2.fromAnglePNorm((Math.PI * 2 * i) / resolution, p));
}

const ShapeCreatorMode: Mode = {
  name: 'Squircle creator',
  description: '',
  element,
  drawFunc(editorApp, dt) {
    const ctx = editorApp.cnv.getContext('2d') as CanvasRenderingContext2D;
    ctx.strokeStyle = 'black';
    const shape = generateUnitSquircle(res, roundness);
    shape.forEach((p) => p.mult(size));

    ctx.beginPath();
    ctx.moveTo(editorApp.mouseX + shape[0].x, editorApp.mouseY + shape[0].y);
    for (let i = 1; i < shape.length; i += 1) {
      ctx.lineTo(editorApp.mouseX + shape[i].x, editorApp.mouseY + shape[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    if (editorApp.mouseDown) {
      ctx.beginPath();
      ctx.moveTo(editorApp.mouseX, editorApp.mouseY);
      ctx.lineTo(editorApp.lastX, editorApp.lastY);
      ctx.stroke();
    }
  },
  startInteractionFunc(editorApp) { },
  endInteractionFunc(editorApp) {
    const shape = generateUnitSquircle(res, roundness);
    const mouseVec = new Vec2(editorApp.lastX, editorApp.lastY);
    shape.forEach((p) => { p.mult(size); p.add(mouseVec); });

    if (editorApp.lastX !== 0 && editorApp.lastY !== 0) {
      const newBody = new Body(shape, new Vec2(editorApp.lastX - editorApp.mouseX,
        editorApp.lastY - editorApp.mouseY), k, 0, fc);
      editorApp.physics.addBody(newBody);
    }
  },
};

[
  Creator.createSlider('Size', 5, 120, size, (newSize) => {
    size = newSize;
  }),
  Creator.createSlider('Roundness', 2, 7, 9 - roundness, (newRoundnessFacto) => {
    roundness = 9 - newRoundnessFacto;
  }, 1),
  Creator.createSlider('Resolution', 12, 36, res, (newRes) => {
    res = newRes;
  }, 1),
  Creator.createSlider('Bounciness', 0.0, 0.9, k, (newK) => {
    k = newK;
  }, 0.02),
  Creator.createSlider('Coefficient of friction', 0, 2, fc, (newFc) => {
    fc = newFc;
  }, 0.1),
].forEach(element.appendChild.bind(element));

export default ShapeCreatorMode;