const Vec2 = require('./vec2');

/**
 * A class representing a ball
 * A ball is an object in the physics engine that
 * has a shape of a circle and it is affected by gravity
 */
class Ball {
  /**
   * Crete a ball
   * The mass of the ball is calculated from its radius
   * @param {Vec2} pos The position of the center of the circle
   * @param {Vec2} vel The velocity of the circle
   * @param {number} r The radius of the circe
   * @param {number} k Coefficient of restitution
   * @param {number} ang The angular velocity of the ball (optional)
   * @param {number} fc The friction coefficient (optional, defaults to 0.4)
   */
  constructor(pos, vel, r, k, ang, fc) {
    this.pos = pos.copy;
    this.lastPos = this.pos.copy;
    this.r = r;
    this.fc = 0.4;
    this.amc = 2 / 5;

    this.rotation = 0;

    if (ang) this.ang = ang;
    else this.ang = 0;

    if (fc || fc === 0) this.fc = fc;

    if (k) this.k = k;
    else this.k = 0.8;

    if (vel != undefined) this.vel = vel.copy;
    else this.vel = new Vec2(0, 0);

    this.id =
      '_' +
      Math.random()
        .toString(36)
        .substr(2, 9);
  }

  /**
   * Get the mass of the ball
   * @return {number} The mass
   */
  get m() {
    return this.r * this.r * Math.PI;
  }

  /**
   * Get the moment of inertia of the ball
   * @return {number} The moment of inertia
   */
  get am() {
    return this.amc * this.r * this.r * this.m;
  }

  /**
   * Gives the angular mass of the ball measured in a given point
   * @param {Vec2} point The point to measure the angular mass in
   * @return {number} The adjusted angular mass
   */
  getAmInPoint(point) {
    let ret = this.am;

    ret += Vec2.sub(this.pos, point).sqlength * this.m;

    return ret;
  }

  /**
   * Get a copy of the ball that is not a reference to it
   * @return {Ball} The copy of the ball
   */
  get copy() {
    let ret = new Ball(
      this.pos.copy,
      this.vel.copy,
      this.r,
      this.k,
      this.ang,
      this.fc
    );
    ret.lastPos = this.lastPos.copy;
    ret.rotation = this.rotation;
    return ret;
  }

  /**
   * Moves the ball by the given coordinates
   * @param {number} x x coordinate
   * @param {number} y y coordinate
   */
  move(x, y) {
    this.pos.x += x;
    this.pos.y += y;
  }

  /**
   * Rotates the ball with the given angle anticlockwise
   * @param {number} angle The angle to rotate the ball in radians
   */
  rotate(angle) {
    this.rotation += angle;
  }

  /**
   * Checks if two balls are colliding or not
   * @param {Ball} ball the other ball
   * @return {boolean} True if they colidre
   */
  collided(ball) {
    if (this.pos.dist(ball.pos) < this.r + ball.r) return true;
    else return false;
  }

  /**
   * Static function for collision between two balls
   * @param {Ball} ball1 First ball
   * @param {Ball} ball2 Second ball
   */
  static collide(ball1, ball2) {
    if (!ball1.collided(ball2)) return;

    let pos1 = ball1.pos;
    let pos2 = ball2.pos;
    let r1 = ball1.r;
    let r2 = ball2.r;
    let k = (ball1.k + ball2.k) / 2;
    let m1 = ball1.m;
    let m2 = ball2.m;
    let dist = Vec2.dist(pos1, pos2);
    let fc = (ball1.fc + ball2.fc) / 2;

    // Separate the balls
    let cp1 = pos1.copy;
    let cp2 = pos2.copy;
    let too = r1 + r2 - dist;
    let d = Vec2.sub(pos1, pos2);
    d.setMag(1);
    d.mult((too * m2) / (m1 + m2));
    cp1.add(d);
    d.setMag(1);
    d.mult((-too * m1) / (m1 + m2));
    cp2.add(d);
    ball1.pos = cp1;
    ball2.pos = cp2;

    // Stop if they move in opposite directions
    if (Vec2.dot(d, Vec2.sub(ball1.vel, ball2.vel)) < 0) return;

    d.setMag(1);
    let vel1Parralel = Vec2.cross(d, ball1.vel);
    let vel2Parralel = Vec2.cross(d, ball2.vel);
    let vel1Perpendicular = Vec2.dot(d, ball1.vel);
    let vel2Perpendicular = Vec2.dot(d, ball2.vel);

    let vk1 = r1 * ball1.ang;
    let vk2 = r2 * ball2.ang;

    let vel1InPos = vel1Parralel - vk1;
    let vel2InPos = vel2Parralel + vk2;
    let effectiveMass1 = 1 / ((1 / m1) + (r1 * r1 / ball1.am));
    let effectiveMass2 = 1 / ((1 / m2) + (r2 * r2 / ball2.am));
    let vCommon =
      (vel1InPos * effectiveMass1 + vel2InPos * effectiveMass2) /
      (effectiveMass1 + effectiveMass2);
    let tovCommon1 = vCommon - vel1InPos;
    let tovCommon2 = vCommon - vel2InPos;
    let maxDeltaAng1 = tovCommon1 / r1;
    let maxDeltaAng2 = tovCommon2 / r2;

    // Calculate the new perpendicular velocities
    let u1Perpendicular =
      (1 + k) *
      ((m1 * vel1Perpendicular + m2 * vel2Perpendicular) / (m1 + m2)) -
      k * vel1Perpendicular;
    let u2Perpendicular =
      (1 + k) *
      ((m1 * vel1Perpendicular + m2 * vel2Perpendicular) / (m1 + m2)) -
      k * vel2Perpendicular;

    ball1.vel = Vec2.mult(d, u1Perpendicular);
    ball2.vel = Vec2.mult(d, u2Perpendicular);

    let deltav1Perpendicular = u1Perpendicular - vel1Perpendicular;
    let deltav2Perpendicular = u2Perpendicular - vel2Perpendicular;

    let deltaAng1 =
      (-Math.sign(tovCommon1) * (deltav1Perpendicular * fc)) / (ball1.amc * r1);
    let deltaAng2 =
      (Math.sign(tovCommon2) * (deltav2Perpendicular * fc)) / (ball2.amc * r2);

    if (deltaAng1 / maxDeltaAng1 > 1) deltaAng1 = maxDeltaAng1;
    if (deltaAng2 / maxDeltaAng2 > 1) deltaAng2 = maxDeltaAng2;

    ball1.ang -= deltaAng1;
    ball2.ang += deltaAng2;

    let u1Parralel = vel1Parralel + deltaAng1 * r1;
    let u2Parralel = vel2Parralel + deltaAng2 * r2;

    d.rotate(Math.PI / 2);
    ball1.vel.add(Vec2.mult(d, u1Parralel));
    ball2.vel.add(Vec2.mult(d, u2Parralel));
  }

  /**
   *Returns true if the point is inside the ball
   * @param {Vec2} p The point
   * @return {boolean} The boolean value
   */
  containsPoint(p) {
    return Vec2.dist(this.pos, p) <= this.r;
  }

  /**
   * Calculates the effective velocity of the ball in a
   * given point from it's velocity and angular velocity
   * @param {Vec2} point The point to be taken a look at
   * @return {Vec2} The velocity of the Ball in the given point
   */
  velInPlace(point) {
    let vp = Vec2.sub(point, this.pos);
    vp.rotate(Math.PI / 2);
    vp.mult(this.ang);
    vp.add(this.vel);
    return vp;
  }

  /**
   * Calculates the effective mass of the ball in
   * a given point when pulled/pushed in a given direction
   * by a hypothetical force
   * @param {Vec2} point The given point
   * @param {Vec2} direction The direction of the force
   * @return {Number}
   */
  effectiveMass(point, direction) {
    let r = Vec2.sub(point, this.pos);// Vector to the collision point
    if (r.length === 0) return this.m;
    let angle = Vec2.angle(direction, r);
    let rotationalMass = (Math.sin(angle) ** 2) * (r.length ** 2) / this.am;
    if (isNaN(angle))console.log(direction, r, angle);
    return 1 / (rotationalMass + (1 / this.m));
  }

  /**
   * Realistically applies a change of velocity (momentum)
   * on the ball
   * @param {Vec2} dvel The change in velocity
   * @param {Vec2} point The point of pushing
   */
  applyDeltaVelInPoint(dvel, point) {
    let r = Vec2.sub(point, this.pos);
    if (r.length === 0) {
      this.vel.add(dvel);
      return;
    }
    let angle = Vec2.angle(r, dvel);
    // Change vel in line with the center of mass
    let deltaVlined = Vec2.mult(r, Vec2.dot(dvel, r) / (r.length ** 2));
    this.vel.add(deltaVlined);

    // Change it perpendicular to the line
    let d = r.copy;
    d.rotate(Math.PI / 2);
    d.setMag(1);
    let rotateDirection = Math.sign(Vec2.dot(dvel, d));
    let dvelAng = dvel.length * Math.cos(angle);
    let mEff = 1 / ((1 / this.m) + ((r.length ** 2) / this.am));
    let dvm = dvelAng * mEff / this.m;
    this.vel.add(Vec2.mult(d, dvm * rotateDirection));

    let dAng = rotateDirection * dvelAng * mEff * r.length / this.am;
    this.ang -= dAng;
  }

  /**
   * @return {Object} The ball represented in a JS object
   * Ready to be converted into JSON
   */
  toJSObject() {
    let ret = {};

    ret.pos = this.pos.toJSObject();
    ret.lastPos = this.lastPos.toJSObject();
    ret.r = this.r;
    ret.fc = this.fc;
    ret.amc = this.amc;
    ret.rotation = this.rotation;
    ret.ang = this.ang;
    ret.fc = this.fc;
    ret.k = this.k;
    ret.vel = this.vel.toJSObject();
    ret.id = this.id;
    if (this.layer != undefined) {
      ret.layer = this.layer;
    }

    return ret;
  }

  /**
   * Creates a Ball class from the given object
   * @param {Object} obj The object to create the class from
   * @return {Ball} The Ball object
   */
  static fromObject(obj) {
    let ret = new Ball(
      Vec2.fromObject(obj.pos),
      Vec2.fromObject(obj.vel),
      obj.r,
      obj.k,
      obj.ang,
      obj.fc
    );

    ret.lastPos = Vec2.fromObject(obj.lastPos);
    ret.amc = obj.amc;
    ret.rotation = obj.rotation;
    ret.vel = Vec2.fromObject(obj.vel);
    ret.id = obj.id;
    if (obj.layer != undefined) {
      ret.layer = obj.layer;
    }

    return ret;
  }
}

module.exports = Ball;
