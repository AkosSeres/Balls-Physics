import BallPhysics from '../../src/physics';
const Physics = BallPhysics;
const Ball = BallPhysics.Ball;
const Vec2 = BallPhysics.Vec2;
const Spring = BallPhysics.Spring;
const Stick = BallPhysics.Stick;

import startPauseControlsFunction from './startPauseControls';
import * as Modes from './modes';

// Import css
import '../css/style.css';


const modeNames = [
  'BallCreatorMode',
  'RectangleMode',
  'WallDrawerMode',
  'StickCreatorMode',
  'SpringCreatorMode',
  'MoveMode',
  'ElasticBallCreatorMode',
  'SoftSquareCreatorMode',
  'DeleteMode',
  'RectangleBodyMode',
];
const modes = modeNames.map((name) => Modes[name]);

const palette = {
  'white': '#faf3dd',
  'green': '#02c39a',
  'pink': '#e58c8a',
  'blue': '#77b6ea',
  'black': '#363732',
};

/**
 * The main Object handling the whole app
 */
function Editor() {
  this.physics = new Physics();
  this.mouseX = 0;
  this.mouseY = 0;
  this.mouseDown = 0;
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
  this.timeMultiplier = 1;
  this.lastFrameTime = performance.now();
  this.choosed = false;
  this.mx = 0;
  this.my = 0;

  this.left = false;
  this.right = false;

  /**
   * Called when the page loaded
   */
  window.onload = () => {
    this.cnv = document.getElementById('defaulCanvas0');
    this.canvasHolder = document.getElementById('canvas-holder');
    this.sidebar = document.getElementById('sidebar');

    this.physics.setBounds(0, 0, this.cnv.width, this.cnv.height);
    this.physics.setGravity(new Vec2(0, 1000));
    this.physics.setAirFriction(0.9);

    this.cnv.addEventListener('touchstart', startTouch, false);
    this.cnv.addEventListener('touchend', endTouch, false);
    this.cnv.addEventListener('touchmove', moveTouch, false);
    this.cnv.addEventListener('mousedown', startMouse, false);
    this.cnv.addEventListener('mouseup', endMouse, false);
    this.cnv.addEventListener('mousemove', handleMouseMovement, false);
    document.addEventListener('keydown', keyGotDown, false);
    document.addEventListener('keyup', keyGotUp, false);
    window.addEventListener('resize', resizeCanvas, false);
    this.cnv.addEventListener(
      'mousedown',
      () => {
        this.mouseDown = 1;
      },
      false
    );
    this.cnv.addEventListener(
      'mouseup',
      () => {
        this.mouseDown = 0;
      },
      false
    );

    resizeCanvas();

    // Set up modes and link them to the buttons
    setupModes();

    startPauseControlsFunction(new Translator());

    requestAnimationFrame(this.drawFunction);
  };

  /**
   * Function that is called when the window gest resized
   */
  const resizeCanvas = () => {
    // Fit canvas inside the holder
    let canvasRect = this.canvasHolder.getBoundingClientRect();
    this.cnv.width = canvasRect.width;
    this.cnv.height = window.innerHeight - canvasRect.top;

    // Code for making the image sharp on high DPI displays
    // Scale according to the pixel ratio of the display
    let dpr = window.devicePixelRatio || 1;
    let rect = canvasRect;
    this.cnv.width = rect.width * dpr;
    this.cnv.height = rect.height * dpr;
    this.cnv.style.width = rect.width + 'px';
    this.cnv.style.height = rect.height + 'px';
    this.scaling = 1 / dpr;
    this.physics.setBounds(0, 0, this.cnv.width, this.cnv.height);
    let ctx = this.cnv.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineWidth = dpr;

    // Set the size of the balls
    this.defaultSize = (this.cnv.width + this.cnv.height) / 80;
  };

  /**
   * My draw function
   */
  this.drawFunction = () => {
    if (!isFinite(this.lastFrameTime)) this.lastFrameTime = performance.now();
    let elapsedTime = performance.now() - this.lastFrameTime;
    if (!isFinite(elapsedTime)) {
      elapsedTime = 0;
    }
    elapsedTime /= 1000;

    this.mouseX = isFinite(this.mouseX) ? this.mouseX : this.mx;
    this.mouseY = isFinite(this.mouseY) ? this.mouseY : this.my;
    if (this.mouseX && isFinite(this.mouseX)) this.mx = this.mouseX;
    if (this.mouseY && isFinite(this.mouseY)) this.my = this.mouseY;

    const ctx = this.cnv.getContext('2d');

    // paint the background
    ctx.fillStyle = palette.black;
    ctx.fillRect(0, 0, this.cnv.width, this.cnv.height);

    ctx.save();
    ctx.translate(this.viewOffsetX, this.viewOffsetY);
    ctx.scale(this.scaling, this.scaling);

    modes[this.mode].drawFunc(this, elapsedTime * this.timeMultiplier);
    physicsDraw(this.cnv);

    ctx.restore();

    if (this.physics.balls[0]) {
      if (this.right) this.physics.balls[0].ang -= Math.PI * 100 * elapsedTime;
      if (this.left) this.physics.balls[0].ang += Math.PI * 100 * elapsedTime;
    }

    elapsedTime *= this.timeMultiplier;
    this.physics.update(elapsedTime / 5, false);
    this.physics.update(elapsedTime / 5, false);
    this.physics.update(elapsedTime / 5, false);
    this.physics.update(elapsedTime / 5, false);
    this.physics.update(elapsedTime / 5, false);

    this.lastFrameTime = performance.now();
    requestAnimationFrame(this.drawFunction);
  };

  /**
   * Gets called on the start of an interaction with the canvas
   * @param {number} x The x position of the mouse of the finger on the canvas
   * @param {number} y The y position of the mouse of the finger on the canvas
   */
  const startInteraction = (x, y) => {
    this.mouseX = x / this.scaling - this.viewOffsetX / this.scaling;
    this.mouseY = y / this.scaling - this.viewOffsetY / this.scaling;
    this.choosed = this.physics.getObjectAtCoordinates(this.mouseX, this.mouseY);
    if (!this.choosed) {
      this.choosed = {
        x: this.mouseX,
        y: this.mouseY,
        pinPoint: true,
      };
    }
    this.lastX = this.mouseX;
    this.lastY = this.mouseY;

    modes[this.mode].startInteractionFunc(this);
  };

  /**
   * Gets called on the end of an interaction with the canvas
   * @param {number} x The x position of the mouse of the finger on the canvas
   * @param {number} y The y position of the mouse of the finger on the canvas
   */
  const endInteraction = (x, y) => {
    this.mouseX = x / this.scaling - this.viewOffsetX / this.scaling;
    this.mouseY = y / this.scaling - this.viewOffsetY / this.scaling;

    modes[this.mode].endInteractionFunc(this);

    if (this.lastX === 0 && this.lastY === 0) return;

    this.lastX = 0;
    this.lastY = 0;
    this.choosed = false;
  };

  /**
   * My keyboard event function for pressing down a key
   * @param {KeyboardEvent} event The event containing data
   */
  const keyGotDown = (event) => {
    let keyCode = event.key;
    if (keyCode === 's') {
      spawnNewtonsCradle(this.cnv.width / 2, this.cnv.height / 2, 0.5, this.physics);
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
    if (keyCode === 'ArrowRight') {
      this.right = true;
    }
    if (keyCode === 'ArrowLeft') {
      this.left = true;
    }
  };

  /**
   * My keyboard event function for releasing a key
   * @param {KeyboardEvent} event The event containing data
   */
  const keyGotUp = (event) => {
    let keyCode = event.key;
    // Right arrow
    if (keyCode === 'ArrowRight') {
      this.right = false;
    }
    // Left arrow
    if (keyCode === 'ArrowLeft') {
      this.left = false;
    }
  };

  /**
   * My touch event function
   * @param {TouchEvent} event The event containing data
   * @return {boolean} Returns false for preventing default browser behavior
   */
  const startTouch = (event) => {
    event.preventDefault();
    let cnvBounds = this.canvasHolder.getBoundingClientRect();
    startInteraction(
      event.changedTouches[0].clientX - cnvBounds.left,
      event.changedTouches[0].clientY - cnvBounds.top
    );
    return false;
  };

  /**
   * My touch event function
   * @param {TouchEvent} event The event containing data
   * @return {boolean} Returns false for preventing default browser behavior
   */
  const endTouch = (event) => {
    event.preventDefault();
    let cnvBounds = this.canvasHolder.getBoundingClientRect();
    endInteraction(
      event.changedTouches[0].clientX - cnvBounds.left,
      event.changedTouches[0].clientY - cnvBounds.top
    );
    return false;
  };

  /**
   * My touch event function
   * @param {TouchEvent} event The event containing data
   * @return {boolean} Returns false for preventing default browser behavior
   */
  const moveTouch = (event) => {
    event.preventDefault();
    let cnvBounds = this.canvasHolder.getBoundingClientRect();
    this.mouseX = event.changedTouches[0].clientX - cnvBounds.left;
    this.mouseY = event.changedTouches[0].clientY - cnvBounds.top;
    this.mouseX = this.mouseX / this.scaling - this.viewOffsetX / this.scaling;
    this.mouseY = this.mouseY / this.scaling - this.viewOffsetY / this.scaling;
    return false;
  };

  /**
   * My mouse event function that handles pressing down a mouse key
   * @param {TouchEvent} event The event containing data
   * @return {boolean} Returns false for preventing default browser behavior
   */
  const startMouse = (event) => {
    startInteraction(event.layerX, event.layerY);
    return false;
  };

  /**
   * My mouse event function that handles releasing a mouse key
   * @param {TouchEvent} event The event containing data
   * @return {boolean} Returns false for preventing default browser behavior
   */
  const endMouse = (event) => {
    endInteraction(event.layerX, event.layerY);
    return false;
  };

  /**
   * My mouse event function that handles mouse movement
   * @param {TouchEvent} event The event containing data
   */
  const handleMouseMovement = (event) => {
    this.mouseX = event.layerX;
    this.mouseY = event.layerY;
    this.mouseX = this.mouseX / this.scaling - this.viewOffsetX / this.scaling;
    this.mouseY = this.mouseY / this.scaling - this.viewOffsetY / this.scaling;
  };

  const physicsDraw = (cnv) => {
    const ctx = this.cnv.getContext('2d');

    ctx.fillStyle = palette.green;
    ctx.strokeStyle = 'black';
    for (let i = 0; i < this.physics.balls.length; i++) {
      let ball = this.physics.balls[i];
      ctx.beginPath();
      ctx.arc(
        ball.pos.x,
        ball.pos.y,
        ball.r,
        0,
        2 * Math.PI
      );
      ctx.stroke();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(ball.pos.x, ball.pos.y);
      ctx.lineTo(ball.pos.x + ball.r * Math.cos(ball.rotation),
        ball.pos.y + ball.r * Math.sin(ball.rotation));
      ctx.stroke();
    }

    this.physics.bodies.forEach((element) => {
      ctx.beginPath();
      ctx.moveTo(
        element.points[element.points.length - 1].x,
        element.points[element.points.length - 1].y
      );
      element.points.forEach((p) => {
        ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.fill();

      ctx.beginPath();
      ctx.arc(element.pos.x, element.pos.y, 1.5, 0, Math.PI * 2);
      ctx.stroke();
    });

    const drawWall = (element) => {
      ctx.beginPath();
      ctx.moveTo(
        element.points[element.points.length - 1].x,
        element.points[element.points.length - 1].y
      );
      element.points.forEach((p) => {
        ctx.lineTo(p.x, p.y);
      });
      ctx.fill();
    };
    ctx.fillStyle = 'white';
    this.physics.walls.forEach(drawWall);
    this.physics.bounds.forEach(drawWall);

    this.physics.fixedBalls.forEach((b) => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.save();
    ctx.lineWidth = 2;
    this.physics.springs.forEach((element) => {
      if (element instanceof Spring && !(element instanceof Stick)) {
        let x1;
        let y1;
        let x2;
        let y2;
        if (element.pinned) {
          x1 = element.pinned.x;
          y1 = element.pinned.y;
          x2 = element.objects[0].pos.x;
          y2 = element.objects[0].pos.y;
        } else {
          x1 = element.objects[0].pos.x;
          y1 = element.objects[0].pos.y;
          x2 = element.objects[1].pos.x;
          y2 = element.objects[1].pos.y;
        }
        let v = new Vec2(x2 - x1, y2 - y1);
        const c = v.copy;
        v.rotate(Math.PI / 2);
        v.setMag(5);
        let last = new Vec2(x1, y1);
        const num = Math.floor(element.length / 10);
        for (let i = 1; i <= num; i++) {
          ctx.strokeStyle = palette.blue;
          ctx.fillStyle = palette.blue;
          if (i === num) v = new Vec2(0, 0);
          ctx.beginPath();
          ctx.moveTo(last.x, last.y);
          ctx.lineTo(x1 + (i / num) * c.x + v.x, y1 + (i / num) * c.y + v.y);
          ctx.stroke();
          last = new Vec2(x1 + (i / num) * c.x + v.x, y1 + (i / num) * c.y + v.y);
          v.mult(-1);
        }
      } else {
        ctx.strokeStyle = palette.blue;
        ctx.fillStyle = palette.blue;
        ctx.beginPath();
        ctx.moveTo(element.objects[0].pos.x, element.objects[0].pos.y);
        ctx.lineTo(
          element.pinned ? element.pinned.x : element.objects[1].pos.x,
          element.pinned ? element.pinned.y : element.objects[1].pos.y
        );
        ctx.stroke();
      }
      element.objects.forEach((o) => {
        ctx.strokeStyle = 'black';
        ctx.fillStyle = palette.blue;
        ctx.beginPath();
        ctx.arc(o.pos.x, o.pos.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      if (element.pinned) {
        ctx.strokeStyle = 'black';
        ctx.fillStyle = palette.blue;
        ctx.beginPath();
        ctx.arc(element.pinned.x, element.pinned.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    });
    ctx.restore();

    // Visualizing debug data
    for (let segment of this.physics.debugData) {
      ctx.strokeStyle = 'red';
      ctx.beginPath();
      ctx.moveTo(segment.a.x, segment.a.y);
      ctx.lineTo(segment.b.x, segment.b.y);
      ctx.stroke();
    }
  };

  /**
   * Spawns a Newton cradle inside the given world at given size and
   * coordinates
   * @param {number} x The x coordinate of it
   * @param {number} y The y coordinate of it
   * @param {number} scale The size of it
   * @param {Physics} phy The world to put it in
   */
  const spawnNewtonsCradle = (x, y, scale, phy) => {
    const balls = [];
    const defaultR = 25;
    const defaultStick = 250;
    const ballNumber = 8;
    balls.push(
      new Ball(new Vec2(x, y), new Vec2(0, 0), scale * defaultR, 1, 0, 0)
    );
    let count = 1;
    for (let i = 0; i < ballNumber - 1; i++) {
      balls.push(
        new Ball(
          new Vec2(x + count * scale * defaultR * 1.01 * 2, y),
          new Vec2(0, 0),
          scale * 25,
          1,
          0,
          0
        )
      );
      count *= -1;
      if (count > 0) count += 1;
      if (i === ballNumber - 2) {
        balls[balls.length - 1].vel.x = -Math.sign(count) * scale * defaultR * 8;
      }
    }
    balls.forEach((ball) => {
      phy.addBall(ball);
      const stick = new Stick(defaultStick);
      stick.attachObject(ball);
      stick.pinHere(ball.pos.x, ball.pos.y - defaultStick);
      phy.addSpring(stick);
      stick.lockRotation();
    });
  };

  const modeButtonClicked = (e) => {
    let modeName = e.target.id.replace('-btn', '');
    let modeNum = modeNames.indexOf(modeName);
    let prevoiusBtn = document.getElementById(modeNames[this.mode] + '-btn');
    prevoiusBtn.classList.remove('bg-pink-darker');

    e.target.classList.add('bg-pink-darker');
    this.mode = modeNum;
  };

  const setupModes = () => {
    let buttonHolder = document.getElementById('button-holder');

    modeNames.forEach(function (modeName, i) {
      let button = document.createElement('div');
      button.classList.add('big-button');
      button.classList.add('fix-width');
      button.id = modeName + '-btn';
      button.textContent = modes[i].name;
      button.onclick = modeButtonClicked;
      buttonHolder.appendChild(button);
    });

    let btn = document.getElementById(modeNames[this.mode] + '-btn');
    btn.classList.add('bg-pink-darker');
  };

  /**
   * Setter for the variable timeMultipler for passing it to other scopes
   * @param {number} x The new value of timeMultiplier
   */
  const setTimeMultiplier = (x) => {
    if (isFinite(x)) this.timeMultiplier = x;
  };

  /**
   * Getter for the variable timeMultiplier for passing it to other scopes
   * @return {number} The value of timeMultiplier
   */
  const getTimeMultiplier = () => {
    return this.timeMultiplier;
  };

  /**
   * Setter for the object physics for passing it to other scopes
   * @param {number} phy The new objejet physics
   */
  const setPhysics = (phy) => {
    if (phy instanceof Physics) this.physics = phy;
  };

  /**
   * Getter for the physics object for passing it to other scopes
   * @return {number} The object physics
   */
  const getPhysics = () => {
    return this.physics;
  };

  /**
   * The translator for passing to other scopes
   */
  const Translator = function () {
    this.setTimeMultiplier = setTimeMultiplier;
    this.getTimeMultiplier = getTimeMultiplier;
    this.getPhysics = getPhysics;
    this.setPhysics = setPhysics;
  };
};

export default Editor;
