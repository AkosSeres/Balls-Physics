"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (f) {
    if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined") {
        module.exports = f();
    } else if (typeof define === "function" && define.amd) {
        define([], f);
    } else {
        var g;if (typeof window !== "undefined") {
            g = window;
        } else if (typeof global !== "undefined") {
            g = global;
        } else if (typeof self !== "undefined") {
            g = self;
        } else {
            g = this;
        }g.Physics = f();
    }
})(function () {
    var define, module, exports;return function () {
        function r(e, n, t) {
            function o(i, f) {
                if (!n[i]) {
                    if (!e[i]) {
                        var c = "function" == typeof require && require;if (!f && c) return c(i, !0);if (u) return u(i, !0);var a = new Error("Cannot find module '" + i + "'");throw a.code = "MODULE_NOT_FOUND", a;
                    }var p = n[i] = { exports: {} };e[i][0].call(p.exports, function (r) {
                        var n = e[i][1][r];return o(n || r);
                    }, p, p.exports, r, e, n, t);
                }return n[i].exports;
            }for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) {
                o(t[i]);
            }return o;
        }return r;
    }()({ 1: [function (require, module, exports) {
            var Vec2 = require('./vec2');

            var Ball = function () {
                function Ball(pos, vel, r, k, ang, fc) {
                    _classCallCheck(this, Ball);

                    this.pos = pos.copy;
                    this.lastPos = this.pos.copy;
                    this.r = r;
                    this.fc = 0.4; //coefficient of friction
                    this.amc = 2 / 5; //angular mass coefficient

                    this.rotation = 0;

                    if (ang) this.ang = ang;else this.ang = 0;

                    if (fc || fc === 0) this.fc = fc;

                    if (k) this.k = k;else this.k = 0.8;

                    if (vel != undefined) this.vel = vel.copy;else this.vel = new Vec2(0, 0);
                }

                _createClass(Ball, [{
                    key: "move",
                    value: function move(x, y) {
                        this.pos.x += x;
                        this.pos.y += y;
                    }
                }, {
                    key: "collided",
                    value: function collided(ball) {
                        if (this.pos.dist(ball.pos) < this.r + ball.r) return true;else return false;
                    }
                }, {
                    key: "m",
                    get: function get() {
                        return this.r * this.r * Math.PI;
                    }
                }, {
                    key: "am",
                    get: function get() {
                        return this.amc * this.m * this.r * this.r;
                    }
                }, {
                    key: "copy",
                    get: function get() {
                        var ret = new Ball(this.pos.copy, this.vel.copy, this.r, this.k, this.ang, this.fc);
                        ret.lastPos = this.lastPos.copy;
                        ret.rotation = this.rotation;
                        return ret;
                    }
                }], [{
                    key: "collide",
                    value: function collide(ball1, ball2) {
                        if (ball1.collided(ball2)) {
                            var pos1 = ball1.pos;
                            var pos2 = ball2.pos;
                            var lPos1 = ball1.lastPos;
                            var lPos2 = ball2.lastPos;
                            var r1 = ball1.r;
                            var r2 = ball2.r;
                            var rSum = r1 + r2;
                            var kk = (ball1.k + ball2.k) / 2;
                            var m1 = r1 * r1;
                            var m2 = r2 * r2;
                            var v1 = ball1.vel;
                            var v2 = ball2.vel;
                            var s1 = Vec2.sub(pos1, lPos1);
                            var s2 = Vec2.sub(pos2, lPos2);
                            var dist = Vec2.dist(pos1, pos2);
                            var lastDist = Vec2.dist(lPos1, lPos2);
                            var fc = (ball1.fc + ball2.fc) / 2;

                            var cp1 = pos1.copy;
                            var cp2 = pos2.copy;
                            var too = r1 + r2 - dist;
                            var d = Vec2.sub(pos1, pos2);
                            d.setMag(1);
                            d.mult(too * m2 / (m1 + m2));
                            cp1.add(d);
                            d.setMag(1);
                            d.mult(-too * m1 / (m1 + m2));
                            cp2.add(d);

                            while (lastDist < rSum && false) {
                                var d1 = Vec2.sub(pos1, pos2);
                                var randVec = new Vec2(0, 1);
                                randVec.rotate(Math.random() * Math.PI * 2);
                                if (dist === 0) {
                                    ball1.pos.add(Vec2.mult(randVec, rSum / 2));
                                    ball2.pos.add(Vec2.mult(randVec, -rSum / 2));
                                }
                                d1.mult(rSum / dist);
                                d1.mult(kk);
                                d1.mult(m2 / (m1 + m2));
                                ball1.vel.add(d1);

                                var d2 = Vec2.sub(pos2, pos1);
                                if (dist === 0) {
                                    d2 = Vec2.mult(d1, -1);
                                }
                                d2.mult(rSum / dist);
                                d2.mult(kk);
                                d2.mult(m1 / (m2 + m1));
                                ball2.vel.add(d2);

                                d1.setMag(1);
                                d1.mult(rSum / dist);
                                d1.mult(m2 / (m1 + m2));
                                ball1.pos.add(d1);

                                d2.setMag(1);
                                d2.mult(rSum / dist);
                                d2.mult(m1 / (m2 + m1));
                                ball2.pos.add(d2);

                                return;
                            }

                            ball1.pos = cp1;
                            ball2.pos = cp2;
                            var np1 = cp1.copy;
                            var np2 = cp2.copy;

                            var v1n = v1.copy;
                            var angle = Vec2.angleACW(new Vec2(v1.x, v1.y), new Vec2(np2.x - np1.x, np2.y - np1.y));
                            v1n.rotate(angle);
                            v1n.mult(Math.cos(angle));
                            var v2n = v2.copy;
                            angle = Vec2.angleACW(new Vec2(v2.x, v2.y), new Vec2(np1.x - np2.x, np1.y - np2.y));
                            v2n.rotate(angle);
                            v2n.mult(Math.cos(angle));

                            var v1p = v1.copy;
                            angle = Vec2.angleACW(new Vec2(v1.x, v1.y), new Vec2(np2.x - np1.x, np2.y - np1.y));
                            v1p.rotate(-HALF_PI + angle);
                            v1p.mult(Math.sin(angle));
                            var v2p = v2.copy;
                            angle = Vec2.angleACW(new Vec2(v2.x, v2.y), new Vec2(np1.x - np2.x, np1.y - np2.y));
                            v2p.rotate(-HALF_PI + angle);
                            v2p.mult(Math.sin(angle));

                            var u1n = Vec2.mult(v1n, m1);
                            u1n.add(Vec2.mult(v2n, m2));
                            u1n.mult(1 + kk);
                            u1n.div(m1 + m2);
                            u1n.sub(Vec2.mult(v1n, kk));

                            var u2n = Vec2.mult(v1n, m1);
                            u2n.add(Vec2.mult(v2n, m2));
                            u2n.mult(1 + kk);
                            u2n.div(m1 + m2);
                            u2n.sub(Vec2.mult(v2n, kk));

                            var dv1n = Vec2.dist(u1n, v1n);
                            var dv2n = Vec2.dist(u2n, v2n);

                            var p1 = new Vec2(v1.x, v1.y);
                            var p2 = new Vec2(v2.x, v2.y);
                            var rot = new Vec2(np1.x - np2.x, np1.y - np2.y).heading;

                            p1.rotate(-rot + Math.PI / 2);
                            p2.rotate(-rot + Math.PI / 2);
                            var vk = (m1 * (p1.x + ball1.ang * r1) + m2 * (p2.x - ball2.ang * r2)) / (m1 + m2);

                            var dv1p = -dv1n * fc * Math.sign(p1.x - ball1.ang * r1 - vk);
                            if (Math.abs(dv1p) > Math.abs(p1.x - ball1.ang * r1 - vk)) {
                                dv1p = -p1.x + ball1.ang * r1 + vk;
                            }
                            var dv2p = -dv2n * fc * Math.sign(p2.x + ball2.ang * r2 - vk);
                            if (Math.abs(dv2p) > Math.abs(p2.x + ball2.ang * r2 - vk)) {
                                dv2p = -p2.x - ball2.ang * r2 + vk;
                            }
                            var dv1 = new Vec2(dv1p + ball1.r * ball1.r * ball1.m * dv1p / (ball1.am + ball1.r * ball1.r * ball1.m), 0);
                            var dv2 = new Vec2(dv2p - ball2.r * ball2.r * ball2.m * dv2p / (ball2.am + ball2.r * ball2.r * ball2.m), 0);
                            dv1.rotate(rot - Math.PI / 2);
                            dv2.rotate(rot - Math.PI / 2);

                            v1n = u1n;
                            v2n = u2n;

                            ball1.vel = Vec2.add(v1n, v1p);
                            ball2.vel = Vec2.add(v2n, v2p);

                            ball1.ang -= ball1.r * ball1.r * ball1.m * dv1p / ((ball1.am + ball1.r * ball1.r * ball1.m) * r1);
                            ball2.ang += ball1.r * ball1.r * ball1.m * dv2p / ((ball2.am + ball2.r * ball2.r * ball2.m) * r2);
                            ball1.vel.x += dv1.x;
                            ball1.vel.y += dv1.y;
                            ball2.vel.x += dv2.x;
                            ball2.vel.y += dv2.y;

                            ball1.lastPos = cp1;
                            ball2.lastPos = cp2;
                        }
                    }
                }]);

                return Ball;
            }();

            module.exports = Ball;
        }, { "./vec2": 7 }], 2: [function (require, module, exports) {
            var Vec2 = require('./vec2');
            var LineSegment = require('./linesegment');

            var Body = function () {
                function Body(points, vel, k, ang, fc) {
                    _classCallCheck(this, Body);

                    this.points = points;

                    var pol = this.points;
                    var sum1 = 0;
                    var sum2 = 0;
                    var angle = Vec2.angleACW(Vec2.sub(pol[1], pol[0]), Vec2.sub(pol[pol.length - 1], pol[0]));
                    sum1 += angle;
                    sum2 += Math.PI * 2 - angle;
                    for (var i = 1; i < pol.length - 1; i++) {
                        angle = Vec2.angleACW(Vec2.sub(pol[(i + 1) % pol.length], pol[i]), Vec2.sub(pol[i - 1], pol[i]));
                        sum1 += angle;
                        sum2 += Math.PI * 2 - angle;
                    }
                    angle = Vec2.angleACW(Vec2.sub(pol[0], pol[pol.length - 1]), Vec2.sub(pol[pol.length - 2], pol[pol.length - 1]));
                    sum1 += angle;
                    sum2 += Math.PI * 2 - angle;
                    if (sum2 < sum1) {
                        var temp = [];
                        for (var _i = pol.length - 1; _i >= 0; _i--) {
                            temp.push(pol[_i]);
                        }this.points = temp;
                    }

                    this.calculatePosAndMass();
                    this.lastPos = this.pos.copy;
                    this.fc = 0.4; //coefficient of friction

                    this.rotation = 0;

                    if (ang) this.ang = ang;else this.ang = 0;

                    if (fc || fc === 0) this.fc = fc;

                    if (k) this.k = k;else this.k = 0.8;

                    if (vel != undefined) this.vel = vel.copy;else this.vel = new Vec2(0, 0);

                    console.log(this);
                }

                _createClass(Body, [{
                    key: "move",
                    value: function move(x, y) {
                        this.pos.x += x;
                        this.pos.y += y;
                        this.points.forEach(function (p) {
                            p.x += x;
                            p.y += y;
                        });
                    }
                }, {
                    key: "collideWithBall",
                    value: function collideWithBall(ball) {
                        var _this = this;

                        var heading = null;
                        var rel = null;
                        var cp = void 0;

                        this.points.forEach(function (point, idx) {
                            var p = new Vec2(point.x, point.y);
                            p.x -= ball.pos.x;
                            p.y -= ball.pos.y;
                            if (p.length <= ball.r) {
                                heading = p.heading + Math.PI;
                                rel = p.length;

                                var move = Vec2.fromAngle(heading);
                                move.mult(ball.r - rel);
                                _this.move(move.x * -1 * ball.m / (_this.m + ball.m), move.y * -1 * ball.m / (_this.m + ball.m));
                                ball.move(move.x * 1 * _this.m / (_this.m + ball.m), move.y * 1 * _this.m / (_this.m + ball.m));

                                cp = new Vec2(point.x, point.y);

                                var a = Vec2.fromAngle(heading);
                                a.mult(-30);
                                stroke("red");
                                line(cp.x, cp.y, cp.x + a.x, cp.y + a.y);
                            }
                            p = new Vec2(point.x, point.y);
                            var np = new Vec2(_this.points[(idx + 1) % _this.points.length].x, _this.points[(idx + 1) % _this.points.length].y);
                            var bp = new Vec2(ball.pos.x, ball.pos.y);
                            var side = new Vec2(np.x - p.x, np.y - p.y);
                            var h = side.heading;
                            p.rotate(-h + Math.PI);
                            np.rotate(-h + Math.PI);
                            bp.rotate(-h + Math.PI);
                            var d = bp.y - (p.y + np.y) / 2;
                            if (d >= -ball.r && d <= ball.r && bp.x >= np.x && bp.x <= p.x) {
                                heading = h - Math.PI / 2;
                                rel = d;

                                var _move = Vec2.fromAngle(heading);
                                _move.mult(ball.r - rel);
                                _this.move(_move.x * -1 * ball.m / (_this.m + ball.m), _move.y * -1 * ball.m / (_this.m + ball.m));
                                ball.move(_move.x * 1 * _this.m / (_this.m + ball.m), _move.y * 1 * _this.m / (_this.m + ball.m));

                                cp = ball.pos.copy;
                                cp.add(Vec2.mult(Vec2.fromAngle(heading + Math.PI), d));

                                var _a = Vec2.fromAngle(heading);
                                _a.mult(-30);
                                stroke("red");
                                line(cp.x, cp.y, cp.x + _a.x, cp.y + _a.y);
                            }
                        });

                        if (heading === 0 || heading) {
                            var v1 = this.vel.copy;
                            var v2 = ball.vel.copy;
                            var ang1 = this.ang;
                            var ang2 = ball.ang;
                            var r1 = Vec2.sub(cp, this.pos);
                            var r2 = Vec2.sub(cp, ball.pos);
                            var am1 = this.am;
                            var am2 = ball.am;
                            var m1 = this.m;
                            var m2 = ball.m;
                            var k = (this.k + ball.k) / 2;
                            var fc = (this.fc + ball.fc) / 2;

                            var v1v = r1.copy;
                            var v2v = r2.copy;
                            v1v.rotate(Math.PI / 2);
                            v2v.rotate(-Math.PI / 2);
                            v1v.mult(ang1);
                            v2v.mult(ang2);
                            v1v.add(v1);
                            v2v.add(v2);

                            v1v.rotate(-heading);
                            v2v.rotate(-heading);

                            var dv1vx = (1 + k) * (m1 * v1v.x + m2 * v2v.x) / (m1 + m2) - (k + 1) * v1v.x;
                            var dv2vx = (1 + k) * (m1 * v1v.x + m2 * v2v.x) / (m1 + m2) - (k + 1) * v2v.x;

                            var vk = (v1v.y * m1 + v2v.y * m2) / (m1 + m2);

                            var dv1vy = -Math.sign(v1v.y) * fc * dv1vx;
                            var dv2vy = -Math.sign(v2v.y) * fc * dv2vx;
                            if (Math.abs(vk - v1v.y) > Math.abs(dv1vy)) dv1vy = vk - v1v.y;
                            if (Math.abs(vk - v2v.y) > Math.abs(dv2vy)) dv2vy = vk - v2v.y;

                            var dv1v = new Vec2(dv1vx, dv1vy);
                            var dv2v = new Vec2(dv2vx, dv2vy);
                            dv1v.rotate(heading);
                            dv2v.rotate(heading);

                            v1.add(dv1v);
                            v2.add(dv2v);

                            dv1v.rotate(-r1.heading);
                            dv2v.rotate(-r2.heading);

                            var dang1 = dv1v.y * m1 * r1.length / (am1 + r1.length * r1.length * m1);
                            var dang2 = -(dv2v.y * m2 * r2.length) / (am2 + r2.length * r2.length * m2);

                            ang1 += dang1;
                            ang2 += dang2;

                            var vp1 = Vec2.fromAngle(r1.heading - Math.PI / 2);
                            vp1.mult(r1.length * dang1);
                            var vp2 = Vec2.fromAngle(r2.heading - Math.PI / 2);
                            vp2.mult(r2.length * dang2);
                            v2.sub(vp2);
                            v1.add(vp1);

                            this.vel = v1;
                            ball.vel = v2;

                            this.ang = ang1;
                            ball.ang = ang2;
                        }
                    }
                }, {
                    key: "calculatePosAndMass",
                    value: function calculatePosAndMass() {
                        var poligons = [];
                        poligons.push([]);
                        this.points.forEach(function (p) {
                            poligons[0].push({
                                x: p.x,
                                y: p.y
                            });
                        });

                        if (this.isConcave) {
                            var includes = function includes(arr, item) {
                                for (var i = 0; i < arr.length; i++) {
                                    if (arr[i] === item) return true;
                                }
                                return false;
                            };
                            var intersectWithPoligon = function intersectWithPoligon(segment, pol, exceptions) {
                                for (var i = 0; i < pol.length; i++) {
                                    if (!includes(exceptions, i)) {
                                        var side = new LineSegment(new Vec2(pol[i].x, pol[i].y), new Vec2(pol[(i + 1) % pol.length].x, pol[(i + 1) % pol.length].y));
                                        if (LineSegment.intersect(segment, side)) return true;
                                    }
                                }
                                return false;
                            };
                            var found = true;

                            checkAllPoligons: while (found) {
                                found = false;
                                for (var i = 0; i < poligons.length; i++) {
                                    var _pol = poligons[i];
                                    var a = Vec2.sub(_pol[1], _pol[0]);
                                    var b = Vec2.sub(_pol[_pol.length - 1], _pol[0]);
                                    var _angle = Vec2.angleACW(a, b);
                                    if (_angle > Math.PI) {
                                        found = true;
                                        var j = 0;
                                        var k = j + 2;
                                        var newSide = new LineSegment(new Vec2(_pol[j].x, _pol[j].y), new Vec2(_pol[k % _pol.length].x, _pol[k % _pol.length].y));
                                        var newSideHeading = new Vec2(newSide.b.x - newSide.a.x, newSide.b.y - newSide.a.y).heading;
                                        while (!(a.heading > b.heading ? newSideHeading > a.heading && newSideHeading < 2 * Math.PI || newSideHeading > 0 && newSideHeading < b.heading : newSideHeading > a.heading && newSideHeading < b.heading) || intersectWithPoligon(new LineSegment(new Vec2(_pol[j % _pol.length].x, _pol[j % _pol.length].y), new Vec2(_pol[k % _pol.length].x, _pol[k % _pol.length].y)), _pol, [(_pol.length - 1) % _pol.length, j % _pol.length, (k - 1) % _pol.length, k % _pol.length])) {
                                            k++;
                                            newSide = new LineSegment(new Vec2(_pol[j].x, _pol[j].y), new Vec2(_pol[k % _pol.length].x, _pol[k % _pol.length].y));
                                            newSideHeading = new Vec2(newSide.b.x - newSide.a.x, newSide.b.y - newSide.a.y).heading;
                                        }
                                        var pol1 = [];
                                        var pol2 = [];
                                        for (var l = j; l <= k; l++) {
                                            pol1.push(_pol[l % _pol.length]);
                                        }
                                        for (var _l = k; _l <= j + _pol.length; _l++) {
                                            pol2.push(_pol[_l % _pol.length]);
                                        }
                                        poligons[i] = pol1;
                                        poligons.push(pol2);
                                        continue checkAllPoligons;
                                    }
                                    for (var _j = 1; _j < _pol.length; _j++) {
                                        var _a2 = Vec2.sub(_pol[(_j + 1) % _pol.length], _pol[_j]);
                                        var _b = Vec2.sub(_pol[_j - 1], _pol[_j]);
                                        var _angle2 = Vec2.angleACW(_a2, _b);
                                        if (_angle2 > Math.PI) {
                                            found = true;
                                            var _k = _j + 2;
                                            var _newSide = new LineSegment(new Vec2(_pol[_j].x, _pol[_j].y), new Vec2(_pol[_k % _pol.length].x, _pol[_k % _pol.length].y));
                                            var _newSideHeading = new Vec2(_newSide.b.x - _newSide.a.x, _newSide.b.y - _newSide.a.y).heading;
                                            while (!(_a2.heading > _b.heading ? _newSideHeading > _a2.heading && _newSideHeading < 2 * Math.PI || _newSideHeading > 0 && _newSideHeading < _b.heading : _newSideHeading > _a2.heading && _newSideHeading < _b.heading) || intersectWithPoligon(_newSide, _pol, [(_j - 1) % _pol.length, _j % _pol.length, (_k - 1) % _pol.length, _k % _pol.length])) {
                                                _k++;
                                                _newSide = new LineSegment(new Vec2(_pol[_j].x, _pol[_j].y), new Vec2(_pol[_k % _pol.length].x, _pol[_k % _pol.length].y));
                                                _newSideHeading = new Vec2(_newSide.b.x - _newSide.a.x, _newSide.b.y - _newSide.a.y).heading;
                                            }
                                            var _pol2 = [];
                                            var _pol3 = [];
                                            for (var _l2 = _j; _l2 <= _k; _l2++) {
                                                _pol2.push(_pol[_l2 % _pol.length]);
                                            }
                                            for (var _l3 = _k; _l3 <= _j + _pol.length; _l3++) {
                                                _pol3.push(_pol[_l3 % _pol.length]);
                                            }
                                            poligons[i] = _pol2;
                                            poligons.push(_pol3);
                                            continue checkAllPoligons;
                                        }
                                    }
                                }
                            }
                        }

                        for (var _i2 = poligons.length - 1; _i2 >= 0; _i2--) {
                            var _pol4 = poligons[_i2];
                            console.log(_pol4);
                            while (_pol4.length > 3) {
                                poligons.push([_pol4[0], _pol4[1], _pol4[2]]);
                                _pol4.splice(1, 1);
                            }
                        }

                        var mSum = 0;
                        var amSum = 0;
                        var pSum = new Vec2(0, 0);
                        poligons.forEach(function (pol) {
                            var a = Math.sqrt(Math.pow(pol[0].x - pol[1].x, 2) + Math.pow(pol[0].y - pol[1].y, 2));
                            var b = Math.sqrt(Math.pow(pol[1].x - pol[2].x, 2) + Math.pow(pol[1].y - pol[2].y, 2));
                            var c = Math.sqrt(Math.pow(pol[2].x - pol[0].x, 2) + Math.pow(pol[2].y - pol[0].y, 2));
                            var s = (a + b + c) / 2;
                            var m = Math.sqrt(s * (s - a) * (s - b) * (s - c));
                            mSum += m;
                            pSum.x += m * (pol[0].x + pol[1].x + pol[2].x) / 3;
                            pSum.y += m * (pol[0].y + pol[1].y + pol[2].y) / 3;
                        });
                        pSum.div(mSum);
                        this.pos = pSum;
                        this.m = mSum;

                        // calculating the moment of inertia finally
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = poligons[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var _pol5 = _step.value;

                                var _a3 = Math.sqrt(Math.pow(_pol5[0].x - _pol5[1].x, 2) + Math.pow(_pol5[0].y - _pol5[1].y, 2));
                                var _b2 = Math.sqrt(Math.pow(_pol5[1].x - _pol5[2].x, 2) + Math.pow(_pol5[1].y - _pol5[2].y, 2));
                                var c = Math.sqrt(Math.pow(_pol5[2].x - _pol5[0].x, 2) + Math.pow(_pol5[2].y - _pol5[0].y, 2));
                                var w = Math.max(_a3, _b2, c);
                                var s = (_a3 + _b2 + c) / 2;
                                var m = Math.sqrt(s * (s - _a3) * (s - _b2) * (s - c));
                                var h = 2 * m / w;
                                var wpartial = Math.sqrt(Math.pow(Math.min(_a3, c, _b2), 2) - h * h);
                                var am = h * w * (h * h + w * w) / 24;
                                var d = Math.sqrt(h * h / 36 + Math.pow(Math.abs(wpartial - w / 2) / 3, 2));
                                am -= d * d * m;
                                am += Math.pow(new Vec2((_pol5[0].x + _pol5[1].x + _pol5[2].x) / 3, (_pol5[0].y + _pol5[1].y + _pol5[2].y) / 3).dist(this.pos), 2) * m;
                                amSum += am;
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }

                        this.am = amSum;
                    }
                }, {
                    key: "rotate",
                    value: function rotate(angle) {
                        var _this2 = this;

                        this.points.forEach(function (p) {
                            var point = new Vec2(p.x, p.y);
                            point.sub(_this2.pos);
                            point.rotate(angle);
                            point.add(_this2.pos);
                            p.x = point.x;
                            p.y = point.y;
                        });
                        this.rotation += angle;
                    }
                }, {
                    key: "isConcave",
                    get: function get() {
                        var pol = this.points;
                        var angle = Vec2.angleACW(Vec2.sub(pol[1], pol[0]), Vec2.sub(pol[pol.length - 1], pol[0]));
                        if (angle > Math.PI) return true;
                        for (var i = 1; i < pol.length - 1; i++) {
                            angle = Vec2.angleACW(Vec2.sub(pol[(i + 1) % pol.length], pol[i]), Vec2.sub(pol[i - 1], pol[i]));
                            if (angle > Math.PI) return true;
                        }
                        angle = Vec2.angleACW(Vec2.sub(pol[0], pol[pol.length - 1]), Vec2.sub(pol[pol.length - 2], pol[pol.length - 1]));
                        if (angle > Math.PI) return true;
                        return false;
                    }
                }], [{
                    key: "collide",
                    value: function collide(b1, b2) {
                        var matches = 0;
                        var heading = 0;
                        var cp = new Vec2(0, 0);
                        var cps = [];
                        var intersect = false;
                        b1.points.forEach(function (p, idx) {
                            var side1 = new LineSegment(new Vec2(p.x, p.y), new Vec2(b1.points[(idx + 1) % b1.points.length].x, b1.points[(idx + 1) % b1.points.length].y));
                            b2.points.forEach(function (pp, idxx) {
                                var side2 = new LineSegment(new Vec2(pp.x, pp.y), new Vec2(b2.points[(idxx + 1) % b2.points.length].x, b2.points[(idxx + 1) % b2.points.length].y));
                                var sect = LineSegment.intersect(side1, side2);
                                if (sect) {
                                    matches++;
                                    cp.add(sect);
                                    cps.push(sect);
                                    intersect = true;

                                    var _v = Vec2.sub(side1.b, side1.a);
                                    var _v2 = Vec2.sub(side2.b, side2.a);
                                }
                            });
                        });

                        if (!intersect) return;
                        cp.div(matches);

                        for (var i = 0; i < Math.floor(matches / 2); i++) {
                            heading += Vec2.sub(cps[2 * i + 1], cps[2 * i]).heading;
                        }
                        heading /= matches / 2;
                        heading += Math.PI / 2;

                        var a = Vec2.fromAngle(heading);
                        a.mult(-30);
                        stroke("red");
                        line(cp.x, cp.y, cp.x + a.x, cp.y + a.y);

                        var rotatedBy90 = Vec2.fromAngle(heading - Math.PI / 2);
                        a.div(-30);

                        var move1Min = 0;
                        var move1Max = 0;
                        var move2Min = 0;
                        var move2Max = 0;
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = b1.points[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                point = _step2.value;

                                move1Min = Math.min(Vec2.dot(a, Vec2.sub(new Vec2(point.x, point.y), cp)), move1Min);
                                move1Max = Math.max(Vec2.dot(a, Vec2.sub(new Vec2(point.x, point.y), cp)), move1Max);
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }

                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = b2.points[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                point = _step3.value;

                                move2Min = Math.min(Vec2.dot(a, Vec2.sub(new Vec2(point.x, point.y), cp)), move2Min);
                                move2Max = Math.max(Vec2.dot(a, Vec2.sub(new Vec2(point.x, point.y), cp)), move2Max);
                            }
                        } catch (err) {
                            _didIteratorError3 = true;
                            _iteratorError3 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }
                            } finally {
                                if (_didIteratorError3) {
                                    throw _iteratorError3;
                                }
                            }
                        }

                        if (Math.abs(move1Min - move2Max) < Math.abs(move2Min - move1Max)) {
                            b1.move(-a.x * move1Min, -a.y * move1Min);
                            b2.move(-a.x * move2Max, -a.y * move2Max);
                        } else {
                            b1.move(-a.x * move1Max, -a.y * move1Max);
                            b2.move(-a.x * move2Min, -a.y * move2Min);
                        }

                        var v1 = b1.vel.copy;
                        var v2 = b2.vel.copy;
                        var ang1 = b1.ang;
                        var ang2 = b2.ang;
                        var r1 = Vec2.sub(cp, b1.pos);
                        var r2 = Vec2.sub(cp, b2.pos);
                        var am1 = b1.am;
                        var am2 = b2.am;
                        var m1 = b1.m;
                        var m2 = b2.m;
                        var k = (b1.k + b2.k) / 2;
                        var fc = (b1.fc + b2.fc) / 2;

                        var v1v = r1.copy;
                        var v2v = r2.copy;
                        v1v.rotate(Math.PI / 2);
                        v2v.rotate(Math.PI / 2);
                        v1v.mult(ang1);
                        v2v.mult(ang2);
                        var vk1 = v1v.copy;
                        var vk2 = v2v.copy;
                        v1v.add(v1);
                        v2v.add(v2);

                        v1v.rotate(-heading);
                        v2v.rotate(-heading);
                        v1.rotate(-heading);
                        v2.rotate(-heading);
                        vk1.rotate(-heading);
                        vk2.rotate(-heading);

                        var pk1 = am1 / r1.length / r1.length;
                        var pk2 = am2 / r2.length / r2.length;

                        var dvk1vx = (1 + k) * (pk1 * vk1.x + pk2 * vk2.x) / (pk1 + pk2) - (k + 1) * vk1.x;
                        var dvk2vx = (1 + k) * (pk1 * vk1.x + pk2 * vk2.x) / (pk1 + pk2) - (k + 1) * vk2.x;

                        var vkk = (am1 * vk1.y / r1.length + am2 * vk2.y / r2.length) / (am1 / r1.length + am2 / r2.length);
                        var vk = (v1.y * m1 + v2.y * m2) / (m1 + m2);
                        vkk += vk;
                        vk = vkk;

                        var dvk1vy = -Math.sign(vk1.y) * fc * dvk1vx;
                        var dvk2vy = -Math.sign(vk2.y) * fc * dvk2vx;
                        if (Math.abs(vkk - vk1.y) > Math.abs(dvk1vy)) dvk1vy = vkk - vk1.y;
                        if (Math.abs(vkk - vk2.y) > Math.abs(dvk2vy)) dvk2vy = vkk - vk2.y;

                        var dv1vx = (1 + k) * (m1 * v1.x + m2 * v2.x) / (m1 + m2) - (k + 1) * v1.x;
                        var dv2vx = (1 + k) * (m1 * v1.x + m2 * v2.x) / (m1 + m2) - (k + 1) * v2.x;

                        var dv1vy = -Math.sign(v1.y) * fc * dv1vx;
                        var dv2vy = -Math.sign(v2.y) * fc * dv2vx;
                        if (Math.abs(vk - v1.y) > Math.abs(dv1vy)) dv1vy = vk - v1.y;
                        if (Math.abs(vk - v2.y) > Math.abs(dv2vy)) dv2vy = vk - v2.y;

                        var dv1v = new Vec2(dv1vx + dvk1vx, dv1vy + dvk1vy);
                        var dv2v = new Vec2(dv2vx + dvk2vx, dv2vy + dvk2vy);
                        dv1v.rotate(heading);
                        dv2v.rotate(heading);

                        v1.rotate(heading);
                        v2.rotate(heading);

                        v1.add(dv1v);
                        v2.add(dv2v);

                        dv1v.rotate(-r1.heading);
                        dv2v.rotate(-r2.heading);

                        var dang1 = dv1v.y * m1 * r1.length / (am1 + r1.length * r1.length * m1);
                        var dang2 = dv2v.y * m2 * r2.length / (am2 + r2.length * r2.length * m2);

                        ang1 += dang1;
                        ang2 += dang2;

                        var vp1 = Vec2.fromAngle(r1.heading - Math.PI / 2);
                        vp1.mult(r1.length * dang1);
                        var vp2 = Vec2.fromAngle(r2.heading - Math.PI / 2);
                        vp2.mult(r2.length * dang2);
                        v2.sub(vp2);
                        v1.add(vp1);

                        b1.vel = v1;
                        b2.vel = v2;

                        b1.ang = ang1;
                        b2.ang = ang2;
                    }
                }]);

                return Body;
            }();

            module.exports = Body;
        }, { "./linesegment": 3, "./vec2": 7 }], 3: [function (require, module, exports) {
            var Vec2 = require('./vec2');

            /** Class representing a segment of a line */

            var LineSegment = function () {
                /**
                 * Create a segment.
                 * @param {Vec2} a - Starting point.
                 * @param {Vec2} b - Ending point.
                 */
                function LineSegment(a, b) {
                    _classCallCheck(this, LineSegment);

                    this.a = a;
                    this.b = b;
                }

                /**
                 * Get the length of the segment.
                 * @return {number} The length.
                 */


                _createClass(LineSegment, [{
                    key: "distFromPoint",


                    /**
                     * Get the distance between a point and the line segment.
                     * @param {Vec2} p - The point as a vector.
                     * @return {number} The distance.
                     */
                    value: function distFromPoint(p) {
                        var e = Vec2.sub(this.a, this.b);
                        var A = Vec2.sub(p, this.b);
                        var B = Vec2.sub(p, this.a);
                        var a = A.length;
                        var b = B.length;
                        var c = e.length;
                        if (c === 0) return a;
                        var gamma = Vec2.angle(A, B);
                        var betha = Vec2.angle(A, e);
                        var alpha = Math.PI - gamma - betha;
                        var area = Math.sin(alpha) * b * c / 2;
                        var m = 2 * area / c;
                        if (alpha > Math.PI / 2) return b;
                        if (betha > Math.PI / 2) return a;
                        return m;
                    }

                    /**
                     * Get if they intersect or not.
                     * If they intersect it returns true.
                     * If they not it returns false.
                     * @param {LineSegment} segment1 - A segment.
                     * @param {LineSegment} segment2 - Other segment.
                     * @return {Boolean} If they intersect or not.
                     */

                }, {
                    key: "length",
                    get: function get() {
                        return Vec2.dist(this.a, this.b);
                    }
                }], [{
                    key: "intersect",
                    value: function intersect(segment1, segment2) {
                        var v1 = Vec2.sub(segment1.b, segment1.a);
                        var a1 = v1.y / v1.x;
                        var c1 = segment1.b.y - segment1.b.x * a1;

                        var v2 = Vec2.sub(segment2.b, segment2.a);
                        var a2 = v2.y / v2.x;
                        var c2 = segment2.b.y - segment2.b.x * a2;

                        if (v1.x === 0 && v2.x !== 0) {
                            if (segment1.a.x >= segment2.a.x && segment1.a.x <= segment2.b.x || segment1.a.x <= segment2.a.x && segment1.a.x >= segment2.b.x) {
                                var h = a2 * segment1.a.x + c2;
                                if (h > segment1.a.y && h < segment1.b.y || h < segment1.a.y && h > segment1.b.y) return new Vec2(segment1.a.x, h);
                            }
                            return false;
                        }
                        if (v2.x === 0 && v1.x !== 0) {
                            if (segment2.a.x >= segment1.a.x && segment2.a.x <= segment1.b.x || segment2.a.x <= segment1.a.x && segment2.a.x >= segment1.b.x) {
                                var _h = a1 * segment2.a.x + c1;
                                if (_h > segment2.a.y && _h < segment2.b.y || _h < segment2.a.y && _h > segment2.b.y) return new Vec2(segment2.a.x, _h);
                            }
                            return false;
                        }
                        if (v1.x === 0 && v2.x === 0) {
                            if (segment1.a.x === segment2.a.x) {
                                var _interval = segment1.a.y < segment1.b.y ? [segment1.a.y, segment1.b.y] : [segment1.b.y, segment1.a.y];
                                var _interval2 = segment2.a.y < segment2.b.y ? [segment2.a.y, segment2.b.y] : [segment2.b.y, segment2.a.y];
                                var _interval3 = [_interval[0] > _interval2[0] ? _interval[0] : _interval2[0], _interval[1] < _interval2[1] ? _interval[1] : _interval2[1]];
                                if (_interval3[0] <= _interval3[1]) return new Vec2(segment1.a.x, (_interval3[0] + _interval3[1]) / 2);
                            }
                            return false;
                        }

                        var interval1 = segment1.a.x < segment1.b.x ? [segment1.a.x, segment1.b.x] : [segment1.b.x, segment1.a.x];
                        var interval2 = segment2.a.x < segment2.b.x ? [segment2.a.x, segment2.b.x] : [segment2.b.x, segment2.a.x];
                        var interval = [interval1[0] > interval2[0] ? interval1[0] : interval2[0], interval1[1] < interval2[1] ? interval1[1] : interval2[1]];
                        // If they are parralel the only time they intersect is when c1 == c2.
                        if (a1 === a2 && c1 === c2 && interval[0] <= interval[1]) return new Vec2((interval[0] + interval[1]) / 2, (interval[0] + interval[1]) / 2 * a1 + c1);
                        var x = (c2 - c1) / (a1 - a2);
                        if (x >= interval[0] && x <= interval[1]) return new Vec2(x, x * a1 + c1);else return false;
                    }
                }]);

                return LineSegment;
            }();

            module.exports = LineSegment;
        }, { "./vec2": 7 }], 4: [function (require, module, exports) {
            var Ball = exports.Ball = require('./ball');
            var Body = exports.Body = require('./body');
            var Vec2 = exports.Vec2 = require('./vec2');
            var Wall = exports.Wall = require('./wall');
            var LineSegment = exports.LineSegment = require('./linesegment');
            var Spring = exports.Spring = require('./spring');
            var Stick = exports.Stick = require('./stick');

            var Physics = function () {
                function Physics() {
                    _classCallCheck(this, Physics);

                    this.balls = [];
                    this.bodies = [];
                    this.fixedBalls = [];

                    this.walls = [];

                    this.bounds = 0;

                    this.springs = [];

                    this.gravity = null;
                }

                _createClass(Physics, [{
                    key: "update",
                    value: function update(t) {
                        // at first move objets
                        for (var i = 0; i < this.balls.length; i++) {
                            //move
                            this.balls[i].lastPos = this.balls[i].pos.copy;
                            this.balls[i].pos.add(Vec2.mult(this.balls[i].vel, t));

                            //angular vel
                            this.balls[i].rotation += this.balls[i].ang * t;
                            this.balls[i].rotation %= Math.PI * 2;
                        }
                        for (var _i3 = 0; _i3 < this.bodies.length; _i3++) {
                            this.bodies[_i3].lastPos = this.bodies[_i3].pos.copy;
                            this.bodies[_i3].move(this.bodies[_i3].vel.x * t, this.bodies[_i3].vel.y * t);
                            this.bodies[_i3].rotate(this.bodies[_i3].ang * t);
                        }

                        //update springs multiple times
                        for (var _i4 = 0; _i4 < this.springs.length; _i4++) {
                            var _iteratorNormalCompletion4 = true;
                            var _didIteratorError4 = false;
                            var _iteratorError4 = undefined;

                            try {
                                for (var _iterator4 = this.springs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                    var element = _step4.value;

                                    element.update(t / this.springs.length / 2);
                                }
                            } catch (err) {
                                _didIteratorError4 = true;
                                _iteratorError4 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                        _iterator4.return();
                                    }
                                } finally {
                                    if (_didIteratorError4) {
                                        throw _iteratorError4;
                                    }
                                }
                            }
                        }

                        for (var _i5 = 0; _i5 < this.balls.length; _i5++) {
                            //apply gravity
                            if (this.gravity) this.balls[_i5].vel.add(new Vec2(this.gravity.x * t, this.gravity.y * t));

                            //collision
                            for (var j = _i5 + 1; j < this.balls.length; j++) {
                                if (this.balls[_i5].group != this.balls[j].group || !this.balls[_i5].group && !this.balls[j].group) Ball.collide(this.balls[_i5], this.balls[j]);
                            }

                            //collision with walls
                            var _iteratorNormalCompletion5 = true;
                            var _didIteratorError5 = false;
                            var _iteratorError5 = undefined;

                            try {
                                for (var _iterator5 = this.walls[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                    var wall = _step5.value;

                                    wall.collideWithBall(this.balls[_i5]);
                                }

                                //collision with fixed balls
                            } catch (err) {
                                _didIteratorError5 = true;
                                _iteratorError5 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                        _iterator5.return();
                                    }
                                } finally {
                                    if (_didIteratorError5) {
                                        throw _iteratorError5;
                                    }
                                }
                            }

                            var _iteratorNormalCompletion6 = true;
                            var _didIteratorError6 = false;
                            var _iteratorError6 = undefined;

                            try {
                                for (var _iterator6 = this.fixedBalls[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                    var b = _step6.value;

                                    var ball = this.balls[_i5];

                                    var heading = void 0,
                                        rel = void 0;
                                    var p = new Vec2(b.x, b.y);
                                    p.x -= ball.pos.x;
                                    p.y -= ball.pos.y;
                                    p.mult(-1);
                                    if (p.length <= ball.r + b.r) {
                                        heading = p.heading;
                                        rel = p.length;
                                    }

                                    if (heading === 0 || heading) {
                                        var pos = new Vec2(ball.pos.x, ball.pos.y);
                                        var vel = new Vec2(ball.vel.x, ball.vel.y);
                                        pos.rotate(-heading + Math.PI / 2);
                                        vel.rotate(-heading + Math.PI / 2);

                                        vel.y *= -ball.k;
                                        pos.y += ball.r + b.r - rel;
                                        var _dvy4 = vel.y * (1 + 1 / ball.k);
                                        var _dvx4 = Math.abs(_dvy4) * ball.fc * Math.sign(vel.x - ball.ang * ball.r) * -1;
                                        if (Math.abs(_dvx4) > Math.abs(vel.x - ball.ang * ball.r)) {
                                            _dvx4 = -vel.x + ball.ang * ball.r;
                                        }
                                        vel.x += _dvx4 - ball.r * ball.r * ball.m * _dvx4 / (ball.am + ball.r * ball.r * ball.m);
                                        ball.ang -= ball.r * ball.r * ball.m * _dvx4 / ((ball.am + ball.r * ball.r * ball.m) * ball.r);
                                        pos.rotate(heading - Math.PI / 2);
                                        vel.rotate(heading - Math.PI / 2);
                                        ball.pos.x = pos.x;
                                        ball.pos.y = pos.y;
                                        ball.vel.x = vel.x;
                                        ball.vel.y = vel.y;
                                    }
                                }

                                //bounce from the edges
                            } catch (err) {
                                _didIteratorError6 = true;
                                _iteratorError6 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                        _iterator6.return();
                                    }
                                } finally {
                                    if (_didIteratorError6) {
                                        throw _iteratorError6;
                                    }
                                }
                            }

                            if (this.bounds) {
                                if (this.balls[_i5].pos.x - this.balls[_i5].r < this.bounds[0]) {
                                    var ball = this.balls[_i5];
                                    ball.vel.x *= -ball.k;
                                    ball.pos.x = this.bounds[1] + ball.r;
                                    var dvx = ball.vel.x * (1 + 1 / ball.k);
                                    var dvy = Math.abs(dvx) * ball.fc * Math.sign(ball.vel.y + ball.ang * ball.r) * -1;
                                    if (Math.abs(dvy) > Math.abs(ball.vel.y + ball.ang * ball.r)) {
                                        dvy = -ball.vel.y - ball.ang * ball.r;
                                    }
                                    ball.vel.y += dvy - ball.r * ball.r * ball.m * dvy / (ball.am + ball.r * ball.r * ball.m);
                                    ball.ang += ball.r * ball.r * ball.m * dvy / ((ball.am + ball.r * ball.r * ball.m) * ball.r);
                                } else if (this.balls[_i5].pos.x + this.balls[_i5].r > this.bounds[0] + this.bounds[2]) {
                                    var _ball = this.balls[_i5];
                                    _ball.vel.x *= -_ball.k;
                                    _ball.pos.x = this.bounds[0] + this.bounds[2] - _ball.r;
                                    var _dvx = _ball.vel.x * (1 + 1 / _ball.k);
                                    var _dvy = Math.abs(_dvx) * _ball.fc * Math.sign(_ball.vel.y - _ball.ang * _ball.r) * -1;
                                    if (Math.abs(_dvy) > Math.abs(_ball.vel.y - _ball.ang * _ball.r)) {
                                        _dvy = -_ball.vel.y + _ball.ang * _ball.r;
                                    }
                                    _ball.vel.y += _dvy + _ball.r * _ball.r * _ball.m * _dvy / (_ball.am + _ball.r * _ball.r * _ball.m);
                                    _ball.ang -= _ball.r * _ball.r * _ball.m * _dvy / ((_ball.am + _ball.r * _ball.r * _ball.m) * _ball.r);
                                }
                                if (this.balls[_i5].pos.y + this.balls[_i5].r > this.bounds[1] + this.bounds[3]) {
                                    var _ball2 = this.balls[_i5];
                                    _ball2.vel.y *= -_ball2.k;
                                    _ball2.pos.y = this.bounds[1] + this.bounds[3] - _ball2.r;
                                    var _dvy2 = _ball2.vel.y * (1 + 1 / _ball2.k);
                                    var _dvx2 = Math.abs(_dvy2) * _ball2.fc * Math.sign(_ball2.vel.x + _ball2.ang * _ball2.r) * -1;
                                    if (Math.abs(_dvx2) > Math.abs(_ball2.vel.x + _ball2.ang * _ball2.r)) {
                                        _dvx2 = -_ball2.vel.x - _ball2.ang * _ball2.r;
                                    }
                                    _ball2.vel.x += _dvx2 - _ball2.r * _ball2.r * _ball2.m * _dvx2 / (_ball2.am + _ball2.r * _ball2.r * _ball2.m);
                                    _ball2.ang += _ball2.r * _ball2.r * _ball2.m * _dvx2 / ((_ball2.am + _ball2.r * _ball2.r * _ball2.m) * _ball2.r);
                                } else if (this.balls[_i5].pos.y - this.balls[_i5].r < this.bounds[1]) {
                                    var _ball3 = this.balls[_i5];
                                    _ball3.vel.y *= -_ball3.k;
                                    _ball3.pos.y = this.bounds[1] + _ball3.r;
                                    var _dvy3 = _ball3.vel.y * (1 + 1 / _ball3.k);
                                    var _dvx3 = Math.abs(_dvy3) * _ball3.fc * Math.sign(_ball3.vel.x - _ball3.ang * _ball3.r) * -1;
                                    if (Math.abs(_dvx3) > Math.abs(_ball3.vel.x - _ball3.ang * _ball3.r)) {
                                        _dvx3 = -_ball3.vel.x + _ball3.ang * _ball3.r;
                                    }
                                    _ball3.vel.x += _dvx3 + _ball3.r * _ball3.r * _ball3.m * _dvx3 / (_ball3.am + _ball3.r * _ball3.r * _ball3.m);
                                    _ball3.ang -= _ball3.r * _ball3.r * _ball3.m * _dvx3 / ((_ball3.am + _ball3.r * _ball3.r * _ball3.m) * _ball3.r);
                                }
                            }
                        }

                        for (var _i6 = 0; _i6 < this.bodies.length; _i6++) {
                            var _iteratorNormalCompletion7 = true;
                            var _didIteratorError7 = false;
                            var _iteratorError7 = undefined;

                            try {
                                for (var _iterator7 = this.balls[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                    var _ball4 = _step7.value;

                                    if (_ball4.group != this.bodies[_i6].group || !_ball4.group && !this.bodies[_i6].group) this.bodies[_i6].collideWithBall(_ball4);
                                }
                            } catch (err) {
                                _didIteratorError7 = true;
                                _iteratorError7 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                        _iterator7.return();
                                    }
                                } finally {
                                    if (_didIteratorError7) {
                                        throw _iteratorError7;
                                    }
                                }
                            }

                            for (var _j2 = _i6 + 1; _j2 < this.bodies.length; _j2++) {
                                if (this.bodies[_i6].group != this.bodies[_j2].group || !this.bodies[_j2].group && !this.bodies[_i6].group) Body.collide(this.bodies[_i6], this.bodies[_j2]);
                            }

                            //apply gravity
                            if (this.gravity) {
                                this.bodies[_i6].vel.add(new Vec2(this.gravity.x * t, this.gravity.y * t));
                            }
                        }

                        //update springs again multiple times
                        for (var _i7 = 0; _i7 < this.springs.length; _i7++) {
                            var _iteratorNormalCompletion8 = true;
                            var _didIteratorError8 = false;
                            var _iteratorError8 = undefined;

                            try {
                                for (var _iterator8 = this.springs[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                                    var _element = _step8.value;

                                    _element.update(t / this.springs.length / 2);
                                }
                            } catch (err) {
                                _didIteratorError8 = true;
                                _iteratorError8 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion8 && _iterator8.return) {
                                        _iterator8.return();
                                    }
                                } finally {
                                    if (_didIteratorError8) {
                                        throw _iteratorError8;
                                    }
                                }
                            }
                        }
                    }
                }, {
                    key: "setGravity",
                    value: function setGravity(dir) {
                        this.gravity = dir.copy;
                    }
                }, {
                    key: "addBall",
                    value: function addBall(ball) {
                        this.balls.push(ball);
                    }
                }, {
                    key: "addBody",
                    value: function addBody(body) {
                        this.bodies.push(body);
                    }
                }, {
                    key: "addRectWall",
                    value: function addRectWall(x, y, w, h) {
                        var points = [];
                        points.push({
                            x: x - w / 2,
                            y: y - h / 2
                        });
                        points.push({
                            x: x + w / 2,
                            y: y - h / 2
                        });
                        points.push({
                            x: x + w / 2,
                            y: y + h / 2
                        });
                        points.push({
                            x: x - w / 2,
                            y: y + h / 2
                        });
                        //this.walls.push(new Wall(points));
                        this.bodies.push(new Body(points, new Vec2(0, 0), 0.5, 0, 0.3));
                    }
                }, {
                    key: "addWall",
                    value: function addWall(wall) {
                        this.walls.push(wall);
                    }
                }, {
                    key: "addFixedBall",
                    value: function addFixedBall(x, y, r) {
                        this.fixedBalls.push({
                            x: x,
                            y: y,
                            r: r
                        });
                    }
                }, {
                    key: "addSpring",
                    value: function addSpring(spring) {
                        this.springs.push(spring);
                    }
                }, {
                    key: "setBounds",
                    value: function setBounds(x, y, w, h) {
                        this.bounds = [x, y, w, h];
                    }
                }, {
                    key: "addField",
                    value: function addField(field) {
                        this.fields.push(field);
                    }
                }, {
                    key: "getObjectAtCoordinates",
                    value: function getObjectAtCoordinates(x, y) {
                        var ret = false;
                        var v = new Vec2(x, y);
                        this.balls.forEach(function (ball) {
                            if (ball.pos.dist(v) < ball.r) ret = ball;
                        });
                        return ret;
                    }
                }]);

                return Physics;
            }();

            module.exports = Physics;

            Physics.Ball = Ball;
            Physics.Body = Body;
            Physics.Vec2 = Vec2;
            Physics.Wall = Wall;
            Physics.LineSegment = LineSegment;
            Physics.Spring = Spring;
            Physics.Stick = Stick;
        }, { "./ball": 1, "./body": 2, "./linesegment": 3, "./spring": 5, "./stick": 6, "./vec2": 7, "./wall": 8 }], 5: [function (require, module, exports) {
            var Vec2 = require('./vec2');

            var Spring = function () {
                function Spring(length, springConstant) {
                    _classCallCheck(this, Spring);

                    this.length = length;
                    this.springConstant = springConstant;
                    this.pinned = false;
                    this.objects = [];
                    this.rotationLocked = false;
                }

                _createClass(Spring, [{
                    key: "pinHere",
                    value: function pinHere(x, y) {
                        this.pinned = {
                            x: x,
                            y: y
                        };
                    }
                }, {
                    key: "unpin",
                    value: function unpin() {
                        this.pinned = false;
                    }
                }, {
                    key: "attachObject",
                    value: function attachObject(object) {
                        this.objects.push(object);
                        if (this.objects.length === 2) {
                            this.pinned = false;
                        }
                        if (this.objects.length >= 3) {
                            this.objects = [this.objects[this.objects.length - 2], this.objects[this.objects.length - 1]];
                        }
                    }
                }, {
                    key: "lockRotation",
                    value: function lockRotation() {
                        this.rotationLocked = true;
                    }
                }, {
                    key: "unlockRotation",
                    value: function unlockRotation() {
                        this.rotationLocked = false;
                    }
                }, {
                    key: "update",
                    value: function update(t) {
                        var p1 = void 0,
                            p2 = void 0;
                        if (this.pinned && this.objects[0]) {
                            p2 = this.pinned;
                            p1 = this.objects[0];
                            var dist = new Vec2(p2.x - p1.pos.x, p2.y - p1.pos.y);
                            var dl = dist.length - this.length;
                            dist.setMag(1);
                            dist.mult(dl * this.springConstant * t / p1.m);
                            p1.vel.x += dist.x;
                            p1.vel.y += dist.y;

                            var v = p1.vel;
                            v.rotate(-dist.heading);
                            if (this.rotationLocked) {
                                var s = new Vec2(p2.x, p2.y);
                                var r2 = Vec2.sub(p1.pos, s);
                                var am = r2.length * r2.length * p1.m + p1.am;
                                var ang = (p1.am * p1.ang - r2.length * p1.m * v.y) / am;

                                v.y = -ang * r2.length;

                                p1.ang = ang;
                            }
                            v.rotate(dist.heading);
                        } else if (this.objects[0] && this.objects[1]) {
                            p1 = this.objects[0];
                            p2 = this.objects[1];
                            var _dist = Vec2.sub(p1.pos, p2.pos);
                            var _dl = _dist.length - this.length;
                            _dist.setMag(1);
                            _dist.mult(_dl * this.springConstant * t);
                            p2.vel.add(Vec2.div(_dist, p2.m));
                            p1.vel.add(Vec2.div(_dist, -p1.m));

                            _dist = Vec2.sub(p1.pos, p2.pos);
                            var v1 = p1.vel;
                            var v2 = p2.vel;
                            v1.rotate(-_dist.heading);
                            v2.rotate(-_dist.heading);

                            if (this.rotationLocked) {
                                var _s = new Vec2(p1.pos.x * p1.m + p2.pos.x * p2.m, p1.pos.y * p1.m + p2.pos.y * p2.m);
                                _s.div(p1.m + p2.m);
                                var r1 = Vec2.sub(p1.pos, _s);
                                var _r = Vec2.sub(p2.pos, _s);
                                var _am = r1.length * r1.length * p1.m + p1.am + _r.length * _r.length * p2.m + p2.am;
                                var sv = (v1.y - v2.y) * _r.length / (r1.length + _r.length) + v2.y;
                                var _ang = (p1.am * p1.ang + p2.am * p2.ang - r1.length * p1.m * (v1.y - sv) + _r.length * p2.m * (v2.y - sv)) / _am;

                                v1.y = -_ang * r1.length + sv;
                                v2.y = +_ang * _r.length + sv;

                                p1.ang = _ang;
                                p2.ang = _ang;
                            }

                            v1.rotate(_dist.heading);
                            v2.rotate(_dist.heading);
                        }
                    }
                }]);

                return Spring;
            }();

            module.exports = Spring;
        }, { "./vec2": 7 }], 6: [function (require, module, exports) {
            var Spring = require('./spring');
            var Vec2 = require('./vec2');

            var Stick = function (_Spring) {
                _inherits(Stick, _Spring);

                function Stick(length) {
                    _classCallCheck(this, Stick);

                    var _this3 = _possibleConstructorReturn(this, (Stick.__proto__ || Object.getPrototypeOf(Stick)).call(this, length));

                    _this3.springConstant = 0;
                    return _this3;
                }

                _createClass(Stick, [{
                    key: "update",
                    value: function update(t) {
                        var p1 = void 0,
                            p2 = void 0;
                        if (this.pinned && this.objects[0]) {
                            p2 = this.pinned;
                            p1 = this.objects[0];
                            var dist = new Vec2(p2.x - p1.pos.x, p2.y - p1.pos.y);
                            var dl = dist.length - this.length;
                            dist.setMag(1);
                            dist.mult(-this.length);
                            p1.pos.x = p2.x + dist.x;
                            p1.pos.y = p2.y + dist.y;

                            var v = p1.vel;
                            v.rotate(-dist.heading);
                            v.x = 0;

                            if (this.rotationLocked) {
                                var s = new Vec2(p2.x, p2.y);
                                var r2 = Vec2.sub(p1.pos, s);
                                var am = r2.length * r2.length * p1.m + p1.am;
                                var ang = (p1.am * p1.ang - r2.length * p1.m * v.y) / am;

                                v.y = -ang * r2.length;

                                p1.ang = ang;
                            }

                            v.rotate(dist.heading);
                        } else if (this.objects[0] && this.objects[1]) {
                            p1 = this.objects[0];
                            p2 = this.objects[1];

                            var _dist2 = Vec2.sub(p1.pos, p2.pos);
                            var _dl2 = this.length - _dist2.length;
                            _dist2.setMag(1);
                            p1.pos.add(Vec2.mult(_dist2, _dl2 * p2.m / (p1.m + p2.m)));
                            p2.pos.add(Vec2.mult(_dist2, -_dl2 * p1.m / (p1.m + p2.m)));

                            var v1 = p1.vel;
                            var v2 = p2.vel;
                            v1.rotate(-_dist2.heading);
                            v2.rotate(-_dist2.heading);
                            v1.x = v2.x = (p1.m * v1.x + p2.m * v2.x) / (p1.m + p2.m);

                            if (this.rotationLocked) {
                                var _s2 = new Vec2(p1.pos.x * p1.m + p2.pos.x * p2.m, p1.pos.y * p1.m + p2.pos.y * p2.m);
                                _s2.div(p1.m + p2.m);
                                var r1 = Vec2.sub(p1.pos, _s2);
                                var _r2 = Vec2.sub(p2.pos, _s2);
                                var _am2 = r1.length * r1.length * p1.m + p1.am + _r2.length * _r2.length * p2.m + p2.am;
                                var sv = (v1.y - v2.y) * _r2.length / (r1.length + _r2.length) + v2.y;
                                var _ang2 = (p1.am * p1.ang + p2.am * p2.ang - r1.length * p1.m * (v1.y - sv) + _r2.length * p2.m * (v2.y - sv)) / _am2;

                                v1.y = -_ang2 * r1.length + sv;
                                v2.y = +_ang2 * _r2.length + sv;

                                p1.ang = _ang2;
                                p2.ang = _ang2;
                            }

                            v1.rotate(_dist2.heading);
                            v2.rotate(_dist2.heading);
                        }
                    }
                }]);

                return Stick;
            }(Spring);

            module.exports = Stick;
        }, { "./spring": 5, "./vec2": 7 }], 7: [function (require, module, exports) {
            // every angle is counterclockwise (anticlockwise)
            /** Class representing a 2d vector. */
            var Vec2 = function () {
                /**
                 * Create a vector.
                 * @param {number} x - The x value.
                 * @param {number} y - The y value.
                 */
                function Vec2(x, y) {
                    _classCallCheck(this, Vec2);

                    this.x = x;
                    this.y = y;
                }

                /**
                 * Get a copy of the vector.
                 * @return {Vec2} The copy.
                 */


                _createClass(Vec2, [{
                    key: "add",


                    /**
                     * Adds another vector to the vector.
                     * @param {Vec2} a - The other vector.
                     */
                    value: function add(a) {
                        this.x += a.x;
                        this.y += a.y;
                    }

                    /**
                     * Subtracts another vector from the vector.
                     * @param {Vec2} a - The other vector.
                     */

                }, {
                    key: "sub",
                    value: function sub(a) {
                        this.x -= a.x;
                        this.y -= a.y;
                    }

                    /**
                     * Multiplies the vector by a scalar.
                     * @param {number} x - The scalar.
                     */

                }, {
                    key: "mult",
                    value: function mult(x) {
                        this.x *= x;
                        this.y *= x;
                    }

                    /**
                     * Divides the vector by a scalar.
                     * @param {number} x - The scalar.
                     */

                }, {
                    key: "div",
                    value: function div(x) {
                        this.x /= x;
                        this.y /= x;
                    }

                    /**
                     * Linearry interpolates the vector into the other vector by scalar x.
                     * @param {Vec2} other - The other vector.
                     * @param {number} x - The scalar.
                     */

                }, {
                    key: "lerp",
                    value: function lerp(other, x) {
                        this.x += (other.x - this.x) * x;
                        this.y += (other.y - this.y) * x;
                    }

                    /**
                     * Get the distance between the vector and the other vector.
                     * Vectors are representing points here.
                     * @param {Vec2} other - The other vector.
                     * @return {number} The distance between them.
                     */

                }, {
                    key: "dist",
                    value: function dist(other) {
                        return new Vec2(this.x - other.x, this.y - other.y).length;
                    }

                    /**
                     * Set the length of the vector.
                     * @param {number} l - The new length value.
                     */

                }, {
                    key: "setMag",
                    value: function setMag(l) {
                        if (this.length === 0) return;
                        this.mult(l / this.length);
                    }

                    /**
                     * Rotate the vector anticlockwise.
                     * @param {number} angle - Rotation angle.
                     */

                }, {
                    key: "rotate",
                    value: function rotate(angle) {
                        var h = this.heading;
                        var v = Vec2.fromAngle(angle + h);
                        v.mult(this.length);
                        this.x = v.x;
                        this.y = v.y;
                    }

                    // Static functions:
                    /**
                     * Add two vectors together.
                     * @param {Vec2} a - Vector.
                     * @param {Vec2} b - Other vector.
                     * @return {Vec2} The sum of the vectors.
                     */

                }, {
                    key: "copy",
                    get: function get() {
                        return new Vec2(this.x, this.y);
                    }

                    /**
                     * Get the length of the vector.
                     * @return {number} The length.
                     */

                }, {
                    key: "length",
                    get: function get() {
                        return Math.sqrt(this.x * this.x + this.y * this.y);
                    }

                    /**
                     * Get the length of the vector squared.
                     * @return {number} The length squared.
                     */

                }, {
                    key: "sqlength",
                    get: function get() {
                        return this.x * this.x + this.y * this.y;
                    }

                    /**
                     * Get the heading of the vector compared to (1, 0).
                     * @return {number} The angle between (1, 0)
                     * and the vector in anticlockwise direction.
                     */

                }, {
                    key: "heading",
                    get: function get() {
                        if (this.x === 0 && this.y === 0) return 0;
                        if (this.x === 0) return this.y > 0 ? Math.PI / 2 : 1.5 * Math.PI;
                        if (this.y === 0) return this.x > 0 ? 0 : Math.PI;
                        var v = Vec2.normalized(this);
                        if (this.x > 0 && this.y > 0) return Math.asin(v.y);
                        if (this.x < 0 && this.y > 0) return Math.asin(-v.x) + Math.PI / 2;
                        if (this.x < 0 && this.y < 0) return Math.asin(-v.y) + Math.PI;
                        if (this.x > 0 && this.y < 0) return Math.asin(v.x) + 1.5 * Math.PI;
                        return 0;
                    }
                }], [{
                    key: "add",
                    value: function add(a, b) {
                        return new Vec2(a.x + b.x, a.y + b.y);
                    }

                    /**
                     * Subtracts one vector from another.
                     * @param {Vec2} a - Vector.
                     * @param {Vec2} b - Other vector.
                     * @return {Vec2} The subtraction of the vectors.
                     */

                }, {
                    key: "sub",
                    value: function sub(a, b) {
                        return new Vec2(a.x - b.x, a.y - b.y);
                    }

                    /**
                     * Multiply the vector by a scalar.
                     * @param {Vec2} v - Vector.
                     * @param {number} x - Scalar.
                     * @return {Vec2} The multiplied vector.
                     */

                }, {
                    key: "mult",
                    value: function mult(v, x) {
                        return new Vec2(v.x * x, v.y * x);
                    }

                    /**
                     * Divide the vector by a scalar.
                     * @param {Vec2} v - Vector.
                     * @param {number} x - Scalar.
                     * @return {Vec2} The divided vector.
                     */

                }, {
                    key: "div",
                    value: function div(v, x) {
                        return new Vec2(v.x / x, v.y / x);
                    }

                    /**
                     * Create a unit vector from an angle.
                     * @param {number} a - The angle.
                     * @return {Vec2} The created vector.
                     */

                }, {
                    key: "fromAngle",
                    value: function fromAngle(a) {
                        return new Vec2(Math.cos(a), Math.sin(a));
                    }

                    /**
                     * Linearry interpolates a vector into another vector by scalar x.
                     * @param {Vec2} a - A vector.
                     * @param {Vec2} b - Other vector.
                     * @param {number} x - The scalar.
                     * @return {Vec2} The created vector.
                     */

                }, {
                    key: "lerp",
                    value: function lerp(a, b, x) {
                        return Vec2.add(a, Vec2.mult(Vec2.sub(b, a), x));
                    }

                    /**
                     * Get the distance between vectors.
                     * @param {Vec2} a - A vector.
                     * @param {Vec2} b - Other vector
                     * @return {number} The distance between them.
                     */

                }, {
                    key: "dist",
                    value: function dist(a, b) {
                        return Vec2.sub(a, b).length;
                    }

                    /**
                     * Get the dot product of two vectors.
                     * @param {Vec2} a - A vector.
                     * @param {Vec2} b - Other vector
                     * @return {number} The dot product of them.
                     */

                }, {
                    key: "dot",
                    value: function dot(a, b) {
                        return a.x * b.x + a.y * b.y;
                    }

                    /**
                     * Get the angle between two vectors.
                     * @param {Vec2} a - A vector.
                     * @param {Vec2} b - Other vector
                     * @return {number} Angle between them.
                     */

                }, {
                    key: "angle",
                    value: function angle(a, b) {
                        return Math.acos(Vec2.dot(a, b) / Math.sqrt(a.sqlength * b.sqlength));
                    }

                    /**
                     * Get the angle between two vectors but in the anticlockwise direction.
                     * @param {Vec2} a - A vector.
                     * @param {Vec2} b - Other vector
                     * @return {number} Angle between them.
                     */

                }, {
                    key: "angleACW",
                    value: function angleACW(a, b) {
                        var ah = a.heading;
                        var bh = b.heading;
                        var angle = bh - ah;
                        return angle < 0 ? 2 * Math.PI + angle : angle;
                    }

                    /**
                     * Get a vector with the same heading with the input vector
                     * but with length = 1.
                     * @param {Vec2} v - A vector.
                     * @return {Vec2} Vector with length = 0.
                     */

                }, {
                    key: "normalized",
                    value: function normalized(v) {
                        var l = v.length;
                        return l === 0 ? v : new Vec2(v.x / l, v.y / l);
                    }
                }]);

                return Vec2;
            }();

            module.exports = Vec2;
        }, {}], 8: [function (require, module, exports) {
            var Vec2 = require('./vec2');

            var Wall = function () {
                function Wall(points) {
                    _classCallCheck(this, Wall);

                    // The wall is immovable
                    this.points = points;

                    var pol = this.points;
                    var sum1 = 0;
                    var sum2 = 0;
                    var angle = Vec2.angleACW(Vec2.sub(pol[1], pol[0]), Vec2.sub(pol[pol.length - 1], pol[0]));
                    sum1 += angle;
                    sum2 += Math.PI * 2 - angle;
                    for (var i = 1; i < pol.length - 1; i++) {
                        angle = Vec2.angleACW(Vec2.sub(pol[(i + 1) % pol.length], pol[i]), Vec2.sub(pol[i - 1], pol[i]));
                        sum1 += angle;
                        sum2 += Math.PI * 2 - angle;
                    }
                    angle = Vec2.angleACW(Vec2.sub(pol[0], pol[pol.length - 1]), Vec2.sub(pol[pol.length - 2], pol[pol.length - 1]));
                    sum1 += angle;
                    sum2 += Math.PI * 2 - angle;
                    if (sum2 > sum1) return;else {
                        var temp = [];
                        for (var _i8 = pol.length - 1; _i8 >= 0; _i8--) {
                            temp.push(pol[_i8]);
                        }this.points = temp;
                    }
                }

                _createClass(Wall, [{
                    key: "collideWithBall",
                    value: function collideWithBall(ball) {
                        var _this4 = this;

                        var heading = null;
                        var rel = null;

                        this.points.forEach(function (point, idx) {
                            var p = new Vec2(point.x, point.y);
                            p.x -= ball.pos.x;
                            p.y -= ball.pos.y;
                            p.mult(-1);
                            if (p.length <= ball.r) {
                                heading = p.heading;
                                rel = p.length;
                            }
                            p = new Vec2(point.x, point.y);
                            var np = new Vec2(_this4.points[(idx + 1) % _this4.points.length].x, _this4.points[(idx + 1) % _this4.points.length].y);
                            var bp = new Vec2(ball.pos.x, ball.pos.y);
                            var side = new Vec2(np.x - p.x, np.y - p.y);
                            var h = side.heading;
                            p.rotate(-h + Math.PI);
                            np.rotate(-h + Math.PI);
                            bp.rotate(-h + Math.PI);
                            var d = bp.y - (p.y + np.y) / 2;
                            if (d >= -ball.r && d <= ball.r && bp.x >= np.x && bp.x <= p.x) {
                                heading = h - Math.PI / 2;
                                rel = d;
                            }
                        });

                        if (heading === 0 || heading) {
                            var pos = new Vec2(ball.pos.x, ball.pos.y);
                            var vel = new Vec2(ball.vel.x, ball.vel.y);
                            pos.rotate(-heading + Math.PI / 2);
                            vel.rotate(-heading + Math.PI / 2);

                            vel.y *= -ball.k;
                            pos.y += ball.r - rel;
                            var dvy = vel.y * (1 + 1 / ball.k);
                            var dvx = Math.abs(dvy) * ball.fc * Math.sign(vel.x - ball.ang * ball.r) * -1;
                            if (Math.abs(dvx) > Math.abs(vel.x - ball.ang * ball.r)) {
                                dvx = -vel.x + ball.ang * ball.r;
                            }
                            vel.x += dvx - ball.r * ball.r * ball.m * dvx / (ball.am + ball.r * ball.r * ball.m);
                            ball.ang -= ball.r * ball.r * ball.m * dvx / ((ball.am + ball.r * ball.r * ball.m) * ball.r);
                            pos.rotate(heading - Math.PI / 2);
                            vel.rotate(heading - Math.PI / 2);
                            ball.pos.x = pos.x;
                            ball.pos.y = pos.y;
                            ball.vel.x = vel.x;
                            ball.vel.y = vel.y;
                        }
                    }
                }]);

                return Wall;
            }();

            module.exports = Wall;
        }, { "./vec2": 7 }] }, {}, [4])(4);
});