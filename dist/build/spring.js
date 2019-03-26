"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vec2_1 = require("./vec2");
/**
 * Class representing a string
 * They act like springs in real life
 * You can attach other objects to the ends of them
 * They do not collide with other object neither with each other
 */
class Spring {
    /**
     * Creates a spring
     * @param {number} length The unstreched length of the spring
     * @param {number} springConstant Spring constant
     */
    constructor(length, springConstant) {
        this.length = length;
        this.springConstant = springConstant;
        this.pinned = false;
        this.objects = [];
        this.rotationLocked = false;
    }
    /**
     * Pins one side of the the spring to a given coordinate in space
     * @param {number} x x coordinate
     * @param {number} y y coordinate
     */
    pinHere(x, y) {
        this.pinned = {
            x: x,
            y: y,
        };
    }
    /**
     * Removes the pinned tag from the spring
     * You can now attach it to another object
     */
    unpin() {
        this.pinned = false;
    }
    /**
     * Attaches one end of the spring to an object (eg. Ball)
     * @param {any} object The object that the spring is getting attached to
     */
    attachObject(object) {
        let ob = this.objects;
        ob.push(object);
        if (ob.length === 2) {
            this.pinned = false;
        }
        if (ob.length >= 3) {
            ob = [ob[ob.length - 2], ob[ob.length - 1]];
        }
    }
    /**
     * Locks the objects attached to the ends of the spring
     * to not rotate around the attach point
     */
    lockRotation() {
        this.rotationLocked = true;
    }
    /**
     * Releases the objects attached to the ends of the spring
     * to rotate around the attach point
     */
    unlockRotation() {
        this.rotationLocked = false;
    }
    /**
     * Updates the spring bay the elapsed time
     * @param {number} t Elapsed time
     */
    update(t) {
        let p1;
        let p2;
        if (this.pinned && this.objects[0]) {
            p2 = this.pinned;
            p1 = this.objects[0];
            let dist = new vec2_1.default(p2.x - p1.pos.x, p2.y - p1.pos.y);
            let dl = dist.length - this.length;
            dist.setMag(1);
            dist.mult(dl * this.springConstant * t / (p1.m));
            p1.vel.x += dist.x;
            p1.vel.y += dist.y;
            let v = p1.vel;
            v.rotate(-dist.heading);
            if (this.rotationLocked) {
                let s = new vec2_1.default(p2.x, p2.y);
                let r2 = vec2_1.default.sub(p1.pos, s);
                let am = r2.length * r2.length * p1.m + p1.am;
                let ang = (p1.am * p1.ang - r2.length * p1.m * (v.y)) / (am);
                v.y = -ang * r2.length;
                p1.ang = ang;
            }
            v.rotate(dist.heading);
        }
        else if (this.objects[0] && this.objects[1]) {
            p1 = this.objects[0];
            p2 = this.objects[1];
            let dist = vec2_1.default.sub(p1.pos, p2.pos);
            let dl = dist.length - this.length;
            dist.setMag(1);
            dist.mult(dl * this.springConstant * t);
            p2.vel.add(vec2_1.default.div(dist, p2.m));
            p1.vel.add(vec2_1.default.div(dist, -p1.m));
            dist = vec2_1.default.sub(p1.pos, p2.pos);
            let v1 = p1.vel;
            let v2 = p2.vel;
            v1.rotate(-dist.heading);
            v2.rotate(-dist.heading);
            if (this.rotationLocked) {
                let s = new vec2_1.default(p1.pos.x * p1.m + p2.pos.x * p2.m, p1.pos.y * p1.m + p2.pos.y * p2.m);
                s.div(p1.m + p2.m);
                let r1 = vec2_1.default.sub(p1.pos, s);
                let r2 = vec2_1.default.sub(p2.pos, s);
                let am = r1.length * r1.length * p1.m + p1.am +
                    r2.length * r2.length * p2.m + p2.am;
                let sv = (v1.y - v2.y) * r2.length /
                    (r1.length + r2.length) + v2.y;
                let ang = (p1.am * p1.ang + p2.am * p2.ang -
                    r1.length * p1.m * (v1.y - sv) +
                    r2.length * p2.m * (v2.y - sv)) / (am);
                v1.y = -ang * r1.length + sv;
                v2.y = +ang * r2.length + sv;
                p1.ang = ang;
                p2.ang = ang;
            }
            v1.rotate(dist.heading);
            v2.rotate(dist.heading);
        }
    }
}
exports.default = Spring;