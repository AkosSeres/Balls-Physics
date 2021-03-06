import Physics, {
  Vec2, Spring, Stick, Shape, AnyPhysicsObject, PinPoint, CollisionData, Body,
} from '../../src/physics';
import EditorInterface from './interfaces/editorInterface';
import './serialise/persistence';

import startPauseControlsFunction from './addons/startPauseControls';
import Modes from './modes/index';

// Import css
import '../css/style.css';
// Import color palette
import palette from '../../src/util/colorpalette';
import { Vec2AsObject } from '../../src/math/vec2';
import Renderer from './renderer';

const modes = Modes;
const modeNames = modes.map((mode) => mode.name);

/**
 * The main Object handling the whole app
 */
class Editor implements EditorInterface {
  physics: Physics;

  mouseX: number;

  mouseY: number;

  mouseDown: boolean;

  defaultSize: number;

  k: number;

  fc: number;

  springConstant: number;

  scaling: number;

  viewOffsetX: number;

  viewOffsetY: number;

  mode: number;

  lastX: number;

  lastY: number;

  timeMultiplier: number;

  lastFrameTime: number;

  choosed: (AnyPhysicsObject | boolean | PinPoint);

  cnv: HTMLCanvasElement;

  canvasHolder: HTMLElement;

  sidebar: HTMLElement;

  modeTitleHolder: HTMLElement;

  pauseBtn: HTMLElement;

  drawCollisions: boolean;

  showAxes: boolean;

  touchIDs: number[];

  touchCoords: {x: number, y: number}[];

  rightButtonDown: Vec2 | false;

  worldSize: {width: number, height: number};

  collisionData: CollisionData[];

  showBoundingBoxes: boolean;

  showVelocities: boolean;

  oldMouseX: number;

  oldMouseY: number;

  renderer: Renderer;

  left: boolean;

  right: boolean;

  constructor() {
    this.physics = new Physics();
    this.mouseX = 0;
    this.mouseY = 0;
    this.oldMouseX = 0;
    this.oldMouseY = 0;
    this.mouseDown = false;
    this.defaultSize = 30;
    this.k = 0.5;
    this.fc = 2;
    this.springConstant = 2000;
    this.scaling = 1;
    this.viewOffsetX = 0;
    this.viewOffsetY = 0;
    this.mode = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.touchIDs = [];
    this.touchCoords = [];
    this.rightButtonDown = false;
    this.timeMultiplier = 1;
    this.lastFrameTime = performance.now();
    this.choosed = false;
    this.drawCollisions = false;
    this.showAxes = false;
    this.worldSize = { width: 0, height: 0 };
    this.collisionData = [];
    this.showBoundingBoxes = false;
    this.showVelocities = false;
    this.renderer = new Renderer();

    this.left = false;
    this.right = false;

    // A fully loaded window is provided
    this.cnv = <HTMLCanvasElement>document.getElementById('defaulCanvas0');
    this.canvasHolder = <HTMLElement>document.getElementById('canvas-holder');
    this.sidebar = <HTMLElement>document.getElementById('sidebar');
    this.modeTitleHolder = <HTMLElement>document.getElementById('mode-title-text');
    this.pauseBtn = <HTMLElement>document.getElementById('pause');

    this.setWorldSize({ width: 2000, height: 1000 });
    this.physics.setGravity(new Vec2(0, 1000));
    this.physics.setAirFriction(0.9);

    // Make canvas focusable
    this.cnv.setAttribute('tabindex', '1');

    this.cnv.addEventListener('touchstart', this.startTouch, false);
    this.cnv.addEventListener('touchend', this.endTouch, false);
    this.cnv.addEventListener('touchmove', this.moveTouch, false);
    this.cnv.addEventListener('mousedown', this.startMouse, false);
    this.cnv.addEventListener('mouseup', this.endMouse, false);
    this.cnv.addEventListener('mousemove', this.handleMouseMovement, false);
    this.cnv.addEventListener('wheel', this.handleMouseWheel);
    // Disable context menu on the canvas
    this.cnv.addEventListener('contextmenu', (event) => event.preventDefault());
    this.cnv.addEventListener('keydown', this.keyGotDown, false);
    this.cnv.addEventListener('keyup', this.keyGotUp, false);
    window.addEventListener('resize', this.resizeCanvas, false);

    this.resizeCanvas();

    // Set up modes and link them to the buttons
    this.setupModes();

    startPauseControlsFunction(this);

    requestAnimationFrame(this.drawFunction);
  }

  /**
   * Function that is called when the window gest resized
   */
  resizeCanvas = (): void => {
    // Fit canvas inside the holder
    const canvasRect = this.canvasHolder.getBoundingClientRect();
    this.cnv.width = canvasRect.width;
    this.cnv.height = window.innerHeight - canvasRect.top;

    // Code for making the image sharp on high DPI displays
    // Scale according to the pixel ratio of the display
    const dpr = window.devicePixelRatio || 1;
    const rect = canvasRect;
    this.cnv.width = rect.width * dpr;
    this.cnv.height = rect.height * dpr;
    this.cnv.style.width = `${rect.width}px`;
    this.cnv.style.height = `${rect.height}px`;
    this.scaling = this.cnv.height / this.worldSize.height;
    this.scaling /= dpr;
    this.scaling *= 0.9;
    this.viewOffsetX = 0.01 * (this.cnv.width);
    this.viewOffsetY = 0.03 * this.cnv.height;
    const ctx = this.cnv.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineWidth = dpr;
    }

    // Set the size of the balls
    this.defaultSize = (this.cnv.width + this.cnv.height) / 80;
  };

  /**
   * My draw function
   */
  drawFunction = (): void => {
    if (!Number.isFinite(this.lastFrameTime)) this.lastFrameTime = performance.now();
    let elapsedTime = performance.now() - this.lastFrameTime;
    if (!Number.isFinite(elapsedTime)) {
      elapsedTime = 0;
    }
    elapsedTime /= 1000;
    // Max it out at 24 fps equivalent
    elapsedTime = Math.min(elapsedTime, 0.04166666666);

    const ctx = <CanvasRenderingContext2D> this.cnv.getContext('2d');

    // paint the background
    ctx.fillStyle = palette.Beige;
    ctx.fillRect(0, 0, this.cnv.width, this.cnv.height);

    ctx.save();
    ctx.translate(this.viewOffsetX, this.viewOffsetY);
    ctx.scale(this.scaling, this.scaling);

    this.physicsDraw();
    modes[this.mode].drawFunc?.(this, elapsedTime * this.timeMultiplier);

    ctx.restore();

    // Reset collision data
    this.collisionData = [];

    elapsedTime *= this.timeMultiplier;

    // Rotate first body if pressed down
    const firstBody = this.physics.bodies.find((b) => b.m !== 0);
    if (firstBody) {
      if (this.right) firstBody.ang = Math.min(firstBody.ang + 300 * elapsedTime, 15);
      if (this.left) firstBody.ang = Math.max(firstBody.ang - 300 * elapsedTime, -15);
    }

    this.collisionData.push(...this.physics.update(elapsedTime / 4));
    this.collisionData.push(...this.physics.update(elapsedTime / 4));
    this.collisionData.push(...this.physics.update(elapsedTime / 4));
    this.collisionData.push(...this.physics.update(elapsedTime / 4));

    this.lastFrameTime = performance.now();
    requestAnimationFrame(this.drawFunction);

    this.oldMouseX = this.mouseX;
    this.oldMouseY = this.mouseY;
  };

  /**
   * Gets called on the start of an interaction with the canvas
   *
   * @param {number} x The x position of the mouse or the finger on the canvas
   * @param {number} y The y position of the mouse or the finger on the canvas
   */
  startInteraction = (x: number, y: number): void => {
    this.mouseX = x / this.scaling - this.viewOffsetX / this.scaling;
    this.mouseY = y / this.scaling - this.viewOffsetY / this.scaling;
    this.oldMouseX = this.mouseX;
    this.oldMouseY = this.mouseY;
    this.choosed = this.physics.getObjectAtCoordinates(this.mouseX, this.mouseY, 4);
    if (!this.choosed && typeof this.choosed === 'boolean') {
      this.choosed = {
        x: this.mouseX,
        y: this.mouseY,
        pinPoint: true,
      };
    }
    this.lastX = this.mouseX;
    this.lastY = this.mouseY;
    this.mouseDown = true;

    modes[this.mode].startInteractionFunc?.(this);
  };

  /**
   * Gets called on the end of an interaction with the canvas
   *
   * @param {number} x The x position of the mouse of the finger on the canvas
   * @param {number} y The y position of the mouse of the finger on the canvas
   */
  endInteraction = (x: number, y: number): void => {
    this.mouseX = x / this.scaling - this.viewOffsetX / this.scaling;
    this.mouseY = y / this.scaling - this.viewOffsetY / this.scaling;

    modes[this.mode].endInteractionFunc?.(this);

    this.lastX = 0;
    this.lastY = 0;
    this.mouseDown = false;
    this.choosed = false;
  };

  /**
   * Discards an ongoing touch/move interaction by not calling the mode's function.
   */
  discardInteraction = () => {
    this.lastX = 0;
    this.lastY = 0;
    this.mouseDown = false;
    this.choosed = false;
  };

  /**
   * My keyboard event function for pressing down a key
   *
   * @param {KeyboardEvent} event The event containing data
   */
  keyGotDown = (event: KeyboardEvent): void => {
    const keyCode = event.key;
    if (keyCode === 's') {
      this.spawnNewtonsCradle(this.cnv.width / 2, this.cnv.height / 2, 0.5, this.physics);
    }
    if (keyCode === 'a') {
      this.scaling += 0.01;
    }
    if (keyCode === 'd') {
      this.scaling -= 0.01;
    }
    if (keyCode === 'j') {
      this.viewOffsetX -= 10;
    }
    if (keyCode === 'l') {
      this.viewOffsetX += 10;
    }
    if (keyCode === 'k') {
      this.viewOffsetY -= 10;
    }
    if (keyCode === 'i') {
      this.viewOffsetY += 10;
    }
    if (keyCode === 'ArrowRight') this.right = true;
    if (keyCode === 'ArrowLeft') this.left = true;
  };

  /**
   * My keyboard event function for releasing a key
   *
   * @param {KeyboardEvent} _event The event containing data
   */
  keyGotUp = (_event: KeyboardEvent): void => {
    const keyCode = _event.key;
    if (keyCode === 'ArrowRight') this.right = false;
    if (keyCode === 'ArrowLeft') this.left = false;
  };

  /**
   * My touch event function
   *
   * @param {TouchEvent} event The event containing data
   * @returns {boolean} Returns false for preventing default browser behavior
   */
  startTouch = (event: TouchEvent): boolean => {
    event.preventDefault();
    const cnvBounds = this.canvasHolder.getBoundingClientRect();
    if (event.touches.length > 1) {
      this.discardInteraction();
      if (event.touches.length === 2) {
        // Save touches
        this.touchIDs.push(event.touches[0].identifier);
        this.touchIDs.push(event.touches[1].identifier);
        this.touchCoords.push(
          new Vec2(event.touches[0].clientX - cnvBounds.left,
            event.touches[0].clientY - cnvBounds.top),
        );
        this.touchCoords.push(
          new Vec2(event.touches[1].clientX - cnvBounds.left,
            event.touches[1].clientY - cnvBounds.top),
        );
      }
      if (event.touches.length > 2) {
        this.touchIDs = [];
        this.touchCoords = [];
      }
      return false;
    }
    this.startInteraction(
      event.changedTouches[0].clientX - cnvBounds.left,
      event.changedTouches[0].clientY - cnvBounds.top,
    );
    return false;
  };

  /**
   * My touch event function
   *
   * @param {TouchEvent} event The event containing data
   * @returns {boolean} Returns false for preventing default browser behavior
   */
  endTouch = (event: TouchEvent): boolean => {
    event.preventDefault();
    const cnvBounds = this.canvasHolder.getBoundingClientRect();
    if (event.touches.length <= 1) {
      this.touchIDs = [];
      this.touchCoords = [];
    }
    this.endInteraction(
      event.changedTouches[0].clientX - cnvBounds.left,
      event.changedTouches[0].clientY - cnvBounds.top,
    );
    return false;
  };

  /**
   * My touch event function
   *
   * @param {TouchEvent} event The event containing data
   * @returns {boolean} Returns false for preventing default browser behavior
   */
  moveTouch = (event: TouchEvent): boolean => {
    event.preventDefault();
    const cnvBounds = this.canvasHolder.getBoundingClientRect();
    if (event.touches.length === 2) {
      let touches = [];
      if ((<Touch>event.touches.item(0)).identifier === this.touchIDs[0]) {
        touches.push(<Touch>event.touches.item(0));
        touches.push(<Touch>event.touches.item(1));
      } else {
        touches.push(<Touch>event.touches.item(1));
        touches.push(<Touch>event.touches.item(0));
      }
      touches = touches.map((t) => new Vec2(t.clientX - cnvBounds.left, t.clientY - cnvBounds.top));
      this.processMultiTouchGesture(this.touchCoords, touches);
      this.touchCoords = touches;
      return false;
    }
    if (event.touches.length > 2) return false;
    this.mouseX = event.changedTouches[0].clientX - cnvBounds.left;
    this.mouseY = event.changedTouches[0].clientY - cnvBounds.top;
    this.mouseX = this.mouseX / this.scaling - this.viewOffsetX / this.scaling;
    this.mouseY = this.mouseY / this.scaling - this.viewOffsetY / this.scaling;
    return false;
  };

  /**
   * This function processes touch movement when two fingers are used on the canvas.
   *
   * @param {Vec2AsObject[]} oldCoords The coordinates of the last touch
   * @param {Vec2AsObject[]} newCoords The coordinates of the new positions of the touches
   */
  processMultiTouchGesture = (oldCoords: Vec2AsObject[], newCoords: Vec2AsObject[]) => {
    const oldCenter = Vec2.add(oldCoords[1], oldCoords[0]);
    oldCenter.mult(0.5);
    const newCenter = Vec2.add(newCoords[1], newCoords[0]);
    newCenter.mult(0.5);
    const oldLen = Vec2.dist(oldCoords[1], oldCoords[0]);
    const newLen = Vec2.dist(newCoords[1], newCoords[0]);
    const scalingFactor = Math.sqrt(newLen / oldLen);
    const middleCenter = Vec2.add(oldCenter, newCenter);
    middleCenter.mult(0.5);
    const toMove = Vec2.sub(newCenter, oldCenter);
    toMove.mult(scalingFactor);
    this.scaleAround(middleCenter, scalingFactor);
    this.viewOffsetX += toMove.x;
    this.viewOffsetY += toMove.y;
  };

  /**
   * Scales the view around a given point.
   *
   * @param {Vec2} center The center of the scaling. This point stays in the same place.
   * @param {number} scalingFactor The scaling factor.
   * This is the amount the screen is getting scaled.
   */
  scaleAround = (center: Vec2, scalingFactor: number) => {
    this.viewOffsetX = center.x - ((center.x - this.viewOffsetX)
      * scalingFactor);
    this.viewOffsetY = center.y - ((center.y - this.viewOffsetY)
      * scalingFactor);
    this.scaling *= scalingFactor;
  };

  /**
   * My mouse event function that handles pressing down a mouse key
   *
   * @param {TouchEvent} event The event containing data
   * @returns {boolean} Returns false for preventing default browser behavior
   */
  startMouse = (event: MouseEvent): boolean => {
    if (event.button === 0) this.startInteraction(event.offsetX, event.offsetY);
    if (event.button === 2) {
      this.rightButtonDown = new Vec2(event.offsetX, event.offsetY);
      this.cnv.style.cursor = 'all-scroll';
    }
    return false;
  };

  /**
   * My mouse event function that handles releasing a mouse key
   *
   * @param {TouchEvent} event The event containing data
   * @returns {boolean} Returns false for preventing default browser behavior
   */
  endMouse = (event: MouseEvent): boolean => {
    if (event.button === 0) this.endInteraction(event.offsetX, event.offsetY);
    if (event.button === 2) {
      this.rightButtonDown = false;
      this.cnv.style.cursor = 'default';
    }
    return false;
  };

  /**
   * My mouse event function that handles mouse movement
   *
   * @param {TouchEvent} event The event containing data
   */
  handleMouseMovement = (event: MouseEvent): void => {
    this.mouseX = event.offsetX;
    this.mouseY = event.offsetY;
    this.mouseX = this.mouseX / this.scaling - this.viewOffsetX / this.scaling;
    this.mouseY = this.mouseY / this.scaling - this.viewOffsetY / this.scaling;
    if (this.rightButtonDown) {
      const newPos = new Vec2(event.offsetX, event.offsetY);
      const toMove = Vec2.sub(newPos, this.rightButtonDown);
      this.viewOffsetX += toMove.x;
      this.viewOffsetY += toMove.y;
      this.rightButtonDown = newPos;
    }
  };

  handleMouseWheel = (event: WheelEvent) => {
    event.preventDefault();
    const center = new Vec2(event.offsetX, event.offsetY);
    let multiplier = 0.0005;
    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) multiplier /= 16;
    const scalingFactor = 1 - event.deltaY * multiplier;
    this.scaleAround(center, scalingFactor);
  };

  /**
   * Transforms a point on the canvas to the space in the physiscs world.
   *
   * @param {{x:number, y:number}} p The point on the canvas
   * @param {number} p.x The x coordinate
   * @param {number} p.y The y coordinate
   * @returns {Vec2} The point in the physics world
   */
  convertToPhysicsSpace = (p: {x: number, y: number}): Vec2 => new Vec2(
    p.x / this.scaling - this.viewOffsetX / this.scaling,
    p.y / this.scaling - this.viewOffsetY / this.scaling,
  );

  /**
   * Transforms a point in the physics world to canvas coordinates.
   *
   * @param {{x:number, y:number}} p The point in the physics world
   * @param {number} p.x The x coordinate
   * @param {number} p.y The y coordinate
   * @returns {Vec2} The point on the canvas
   */
  convertToCanvasSpace = (p: {x: number, y: number}): Vec2 => new Vec2(
    p.x * this.scaling + this.viewOffsetX,
    p.y * this.scaling + this.viewOffsetY,
  );

  physicsDraw = (): void => {
    const ctx = this.cnv.getContext('2d');

    if (ctx) {
      // Draw world background
      ctx.fillStyle = palette.Independence;
      ctx.fillRect(0, 0, this.worldSize.width, this.worldSize.height);

      const bodyDrawCallback = (element: Body) => {
        if (element.m === 0) {
          ctx.strokeStyle = '#00000000';
        }
        if (element.shape.r !== 0) {
          // Draw circle
          const ball = element;
          ctx.beginPath();
          ctx.arc(
            ball.pos.x,
            ball.pos.y,
            ball.shape.r,
            0,
            2 * Math.PI,
          );
          ctx.stroke();
          ctx.fill();

          if (element.m !== 0) {
            ctx.beginPath();
            ctx.moveTo(ball.pos.x, ball.pos.y);
            ctx.lineTo(ball.pos.x + ball.shape.r * Math.cos(ball.rotation),
              ball.pos.y + ball.shape.r * Math.sin(ball.rotation));
            ctx.stroke();
          }
        } else {
          // Draw polygon
          ctx.beginPath();
          ctx.moveTo(
            element.shape.points[element.shape.points.length - 1].x,
            element.shape.points[element.shape.points.length - 1].y,
          );
          element.shape.points.forEach((p) => {
            ctx.lineTo(p.x, p.y);
          });
          ctx.stroke();
          ctx.fill();

          if (element.m !== 0) {
            ctx.beginPath();
            ctx.arc(element.pos.x, element.pos.y, 1.5, 0, Math.PI * 2);
            ctx.stroke();
          }

          if (this.showAxes) {
            ctx.strokeStyle = 'black';
            element.axes.forEach((axe: Vec2) => {
              ctx.beginPath();
              ctx.moveTo(element.pos.x, element.pos.y);
              ctx.lineTo(element.pos.x + axe.x * 30, element.pos.y + axe.y * 30);
              ctx.stroke();
            });
          }
        }
      };

      // Draw them with colors
      this.physics.bodies.forEach((b) => {
        ctx.fillStyle = b.style;
        ctx.strokeStyle = 'black';
        bodyDrawCallback(b);
      });
      // Draw with textures
      this.physics.bodies.forEach((b) => {
        if (b.texture === 'none') return;
        const trData = b.textureTransform;
        const offset = trData.offset.copy;
        offset.rotate(b.rotation);
        offset.add(b.pos);
        const matrix = new DOMMatrix([
          trData.scale,
          0,
          0,
          trData.scale,
          offset.x,
          offset.y,
        ]);
        matrix.rotateSelf(0, 0, ((trData.rotation + b.rotation) * 180) / Math.PI);
        const texturedPattern = ctx.createPattern(b.texture, b.textureRepeat) as CanvasPattern;
        texturedPattern.setTransform(matrix);
        ctx.fillStyle = texturedPattern;
        ctx.strokeStyle = '#00000000';
        bodyDrawCallback(b);
      });

      ctx.save();
      ctx.lineWidth = 2;
      this.physics.springs.forEach((element) => {
        if (element instanceof Spring && !(element instanceof Stick)) {
          ctx.strokeStyle = palette.blue;
          ctx.fillStyle = palette.blue;
          this.renderer.renderSpring(element, ctx);
        } else {
          ctx.strokeStyle = palette.blue;
          ctx.fillStyle = palette.blue;
          this.renderer.renderStick(element, ctx);
        }
      });
      ctx.restore();

      // Draw bounding boxes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      if (this.showBoundingBoxes) {
        this.physics.bodies.forEach((b) => {
          ctx.strokeRect(b.boundingBox.x.min, b.boundingBox.y.min,
            b.boundingBox.x.max - b.boundingBox.x.min,
            b.boundingBox.y.max - b.boundingBox.y.min);
        });
      }

      // Draw velocity arrows
      if (this.showVelocities) {
        const oldW = ctx.lineWidth;
        ctx.strokeStyle = palette.pink;
        ctx.fillStyle = palette.pink;
        ctx.lineWidth = 3.5;
        const velScaling = 0.05;
        this.physics.bodies.forEach((b) => {
          const pos = b.pos.copy;
          const end = Vec2.add(pos, Vec2.mult(b.vel, velScaling));
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
          const arrowSize = Math.min(b.vel.length / 5, 15);
          const normVel = b.vel.copy;
          normVel.normalize();
          normVel.setMag(arrowSize);
          const arrowEnd = Vec2.add(end, normVel);
          normVel.rotate90();
          normVel.div(3);
          ctx.beginPath();
          ctx.moveTo(arrowEnd.x, arrowEnd.y);
          ctx.lineTo(end.x + normVel.x, end.y + normVel.y);
          ctx.lineTo(end.x - normVel.x, end.y - normVel.y);
          ctx.closePath();
          ctx.fill();
        });
        ctx.lineWidth = oldW;
      }

      // Draw collision data
      ctx.fillStyle = palette['Maximum Yellow Red'];
      ctx.strokeStyle = palette['Maximum Yellow Red'];
      const old = ctx.lineWidth;
      ctx.lineWidth = 4;
      if (this.drawCollisions) {
        this.collisionData.forEach((cd) => {
          ctx.beginPath();
          ctx.moveTo(cd.cp.x, cd.cp.y);
          ctx.lineTo(cd.cp.x + cd.n.x * 30, cd.cp.y + cd.n.y * 30);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cd.cp.x, cd.cp.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.lineWidth = old;
    }
  };

  /**
   * Sets the size of the world.
   *
   * @param {{width: number, height: number}} sizes The size of the world.
   * @param {number} sizes.width The width of the world.
   * @param {number} sizes.height The height of the world.
   */
  setWorldSize(sizes: {width: number, height: number}) {
    this.physics.setBounds(0, 0, sizes.width, sizes.height);
    this.worldSize = sizes;
  }

  /**
   * Spawns a Newton cradle inside the given world at given size and
   * coordinates
   *
   * @param {number} x The x coordinate of it
   * @param {number} y The y coordinate of it
   * @param {number} scale The size of it
   * @param {Physics} phy The world to put it in
   */
  spawnNewtonsCradle = (x: number, y: number, scale: number, phy: Physics): void => {
    /** @type {Body[]} */
    const balls = [];
    const defaultR = 25;
    const defaultStick = 250;
    const ballNumber = 8;
    balls.push(
      new Body(Shape.Circle(scale * defaultR, new Vec2(x, y)), 1, 1, 0),
    );
    let count = 1;
    for (let i = 0; i < ballNumber - 1; i += 1) {
      balls.push(
        new Body(
          Shape.Circle(
            scale * defaultR, new Vec2(x + count * scale * defaultR * 1.01 * 2, y),
          ), 1, 1, 0,
        ),
      );
      count *= -1;
      if (count > 0) count += 1;
      if (i === ballNumber - 2) {
        balls[balls.length - 1].vel.x = -Math.sign(count) * scale * defaultR * 8;
      }
    }
    balls.forEach((ball) => {
      phy.addBody(ball);
      const stick = new Stick(defaultStick);
      stick.attachObject(ball);
      stick.pinHere(ball.pos.x, ball.pos.y - defaultStick);
      phy.addSpring(stick);
      stick.lockRotation();
    });
  };

  /**
   * Gets called when one of the mode buttons get clicked
   * Swithces to the mode corresponding to the button
   *
   * @param {MouseEvent} e The click event
   */
  modeButtonClicked = (e: MouseEvent): void => {
    const modeName = (<HTMLElement>e.target).id.replace('-btn', '');
    const modeNum = modeNames.indexOf(modeName);
    this.switchToMode(modeNum);
  };

  /**
   * Switches the editor to the given mode
   * It also puts the corresponding HTML elements on the sidebar
   *
   * @param {number} modeNum The mode number to switch to
   */
  switchToMode = (modeNum: number): void => {
    const prevoiusBtn = document.getElementById(`${modeNames[this.mode]}-btn`);
    if (prevoiusBtn) prevoiusBtn.classList.remove('bg-pink-darker');
    this.sidebar.innerHTML = '';

    // Run activation and deactivation functions
    modes[this.mode].deactivated?.(this);
    modes[modeNum].activated?.(this);

    const newBtn = document.getElementById(`${modeNames[modeNum]}-btn`);
    if (newBtn) newBtn.classList.add('bg-pink-darker');
    // And set new title
    this.modeTitleHolder.innerText = modes[modeNum].name;
    this.mode = modeNum;
    this.sidebar.appendChild(modes[this.mode].element);
  };

  /**
   * It initially creates the buttons for each mode and switches to the first one
   */
  setupModes = (): void => {
    const buttonHolder = document.getElementById('button-holder');

    modeNames.forEach((modeName, i) => {
      const button = document.createElement('div');
      button.classList.add('big-button');
      button.id = `${modeName}-btn`;
      button.textContent = modes[i].name;
      modes[i].init?.(this);
      button.onclick = this.modeButtonClicked;
      if (buttonHolder) buttonHolder.appendChild(button);
    });

    this.switchToMode(this.mode);
  };

  /**
   * Setter for the variable timeMultipler for passing it to other scopes
   *
   * @param {number} x The new value of timeMultiplier
   */
  setTimeMultiplier = (x: number): void => {
    if (Number.isFinite(x) && x >= 0) {
      this.timeMultiplier = x;
      if (x === 0) this.pauseBtn.classList.add('bg-pink-darker');
      else this.pauseBtn.classList.remove('bg-pink-darker');
    }
  };

  /**
   * Getter for the variable timeMultiplier for passing it to other scopes
   *
   * @returns {number} The value of timeMultiplier
   */
  getTimeMultiplier = (): number => this.timeMultiplier;

  /**
   * Setter for the object physics for passing it to other scopes
   *
   * @param {Physics} phy The new physics object
   */
  setPhysics = (phy: Physics): void => {
    if (phy instanceof Physics) this.physics = phy;
  };

  /**
   * Getter for the physics object for passing it to other scopes
   *
   * @returns {Physics} The physics object
   */
  getPhysics = (): Physics => this.physics;
}

export default Editor;
