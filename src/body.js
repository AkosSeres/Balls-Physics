class Body {
    constructor(points, vel, k, ang, fc) {
        this.points = points;

        let pol = this.points;
        let sum1 = 0;
        let sum2 = 0;
        let angle = Vec2.angleACW(Vec2.sub(pol[1], pol[0]),
            Vec2.sub(pol[pol.length - 1], pol[0]));
        sum1 += angle;
        sum2 += Math.PI * 2 - angle;
        for (let i = 1; i < pol.length - 1; i++) {
            angle = Vec2.angleACW(Vec2.sub(pol[(i + 1) % pol.length],
                pol[i]), Vec2.sub(pol[i - 1], pol[i]));
            sum1 += angle;
            sum2 += Math.PI * 2 - angle;
        }
        angle = Vec2.angleACW(Vec2.sub(pol[0], pol[pol.length - 1]),
            Vec2.sub(pol[pol.length - 2], pol[pol.length - 1]));
        sum1 += angle;
        sum2 += Math.PI * 2 - angle;
        if (sum2 < sum1) {
            let temp = [];
            for (let i = pol.length - 1; i >= 0; i--)temp.push(pol[i]);
            this.points = temp;
        }

        this.calculatePosAndMass();
        this.lastPos = this.pos.copy;
        this.fc = 0.4;//coefficient of friction

        this.rotation = 0;

        if (ang) this.ang = ang;
        else this.ang = 0;

        if (fc || fc === 0) this.fc = fc;

        if (k) this.k = k;
        else this.k = 0.8;

        if (vel != undefined) this.vel = vel.copy;
        else this.vel = new Vec2(0, 0);

        console.log(this);
    }

    move(x, y) {
        this.pos.x += x;
        this.pos.y += y;
        this.points.forEach(p => {p.x += x; p.y += y;});
    }

    collideWithBall(ball) {
        let heading = null;
        let rel = null;
        let cp;

        this.points.forEach((point, idx) => {
            let p = new Vec2(point.x, point.y);
            p.x -= ball.pos.x; p.y -= ball.pos.y;
            if (p.length <= ball.r) {
                heading = p.heading + Math.PI;
                rel = p.length;

                let move = Vec2.fromAngle(heading);
                move.mult(ball.r - rel);
                this.move(move.x * -1 * ball.m / (this.m + ball.m), move.y * -1 * ball.m / (this.m + ball.m));
                ball.move(move.x * 1 * this.m / (this.m + ball.m), move.y * 1 * this.m / (this.m + ball.m));

                cp = new Vec2(point.x, point.y);

                let a = Vec2.fromAngle(heading);
                a.mult(-30);
                stroke("red");
                line(cp.x, cp.y, cp.x + a.x, cp.y + a.y);
            }
            p = new Vec2(point.x, point.y);
            let np = new Vec2(this.points[(idx + 1) % this.points.length].x, this.points[(idx + 1) % this.points.length].y);
            let bp = new Vec2(ball.pos.x, ball.pos.y);
            let side = new Vec2(np.x - p.x, np.y - p.y);
            let h = side.heading;
            p.rotate(-h + Math.PI);
            np.rotate(-h + Math.PI);
            bp.rotate(-h + Math.PI);
            let d = bp.y - ((p.y + np.y) / 2);
            if (d >= -ball.r && d <= ball.r && bp.x >= np.x && bp.x <= p.x) {
                heading = h - Math.PI / 2;
                rel = d;

                let move = Vec2.fromAngle(heading);
                move.mult(ball.r - rel);
                this.move(move.x * -1 * ball.m / (this.m + ball.m), move.y * -1 * ball.m / (this.m + ball.m));
                ball.move(move.x * 1 * this.m / (this.m + ball.m), move.y * 1 * this.m / (this.m + ball.m));

                cp = ball.pos.copy;
                cp.add(Vec2.mult(Vec2.fromAngle(heading + Math.PI), d));

                let a = Vec2.fromAngle(heading);
                a.mult(-30);
                stroke("red");
                line(cp.x, cp.y, cp.x + a.x, cp.y + a.y);
            }
        });

        if (heading === 0 || heading) {
            let v1 = this.vel.copy;
            let v2 = ball.vel.copy;
            let ang1 = this.ang;
            let ang2 = ball.ang;
            let r1 = Vec2.sub(cp, this.pos);
            let r2 = Vec2.sub(cp, ball.pos);
            let am1 = this.am;
            let am2 = ball.am;
            let m1 = this.m;
            let m2 = ball.m;
            let k = (this.k + ball.k) / 2;
            let fc = (this.fc + ball.fc) / 2;

            let v1v = r1.copy;
            let v2v = r2.copy;
            v1v.rotate(Math.PI / 2);
            v2v.rotate(-Math.PI / 2);
            v1v.mult(ang1);
            v2v.mult(ang2);
            v1v.add(v1);
            v2v.add(v2);

            v1v.rotate(-heading);
            v2v.rotate(-heading);

            let dv1vx = (1 + k) * (m1 * v1v.x + m2 * v2v.x) / (m1 + m2) - (k + 1) * v1v.x;
            let dv2vx = (1 + k) * (m1 * v1v.x + m2 * v2v.x) / (m1 + m2) - (k + 1) * v2v.x;

            let vk = (v1v.y * m1 + v2v.y * m2) / (m1 + m2);

            let dv1vy = -Math.sign(v1v.y) * fc * dv1vx;
            let dv2vy = -Math.sign(v2v.y) * fc * dv2vx;
            if (Math.abs(vk - v1v.y) > Math.abs(dv1vy)) dv1vy = vk - v1v.y;
            if (Math.abs(vk - v2v.y) > Math.abs(dv2vy)) dv2vy = vk - v2v.y;

            let dv1v = new Vec2(dv1vx, dv1vy);
            let dv2v = new Vec2(dv2vx, dv2vy);
            dv1v.rotate(heading);
            dv2v.rotate(heading);

            v1.add(dv1v);
            v2.add(dv2v);

            dv1v.rotate(-r1.heading);
            dv2v.rotate(-r2.heading);

            let dang1 = (dv1v.y * m1 * r1.length) / (am1 + r1.length * r1.length * m1);
            let dang2 = -(dv2v.y * m2 * r2.length) / (am2 + r2.length * r2.length * m2);

            ang1 += dang1;
            ang2 += dang2;

            let vp1 = Vec2.fromAngle(r1.heading - Math.PI / 2);
            vp1.mult(r1.length * dang1);
            let vp2 = Vec2.fromAngle(r2.heading - Math.PI / 2);
            vp2.mult(r2.length * dang2);
            v2.sub(vp2);
            v1.add(vp1);

            this.vel = v1;
            ball.vel = v2;

            this.ang = ang1;
            ball.ang = ang2;
        }
    }

    calculatePosAndMass() {
        let poligons = [];
        poligons.push([]);
        this.points.forEach(p => {poligons[0].push({x: p.x, y: p.y})});

        if (this.isConcave) {
            const includes = (arr, item) => {
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i] === item) return true;
                }
                return false;
            };
            const intersectWithPoligon = function(segment, pol, exceptions) {
                for (let i = 0; i < pol.length; i++) {
                    if (!includes(exceptions, i)) {
                        let side = new LineSegment(new Vec2(pol[i].x, pol[i].y),
                            new Vec2(pol[(i + 1) % pol.length].x,
                                pol[(i + 1) % pol.length].y));
                        if (LineSegment.intersect(segment, side)) return true;
                    }
                }
                return false;
            };
            let found = true;

            checkAllPoligons: while (found) {
                found = false;
                for (let i = 0; i < poligons.length; i++) {
                    let pol = poligons[i];
                    let a = Vec2.sub(pol[1], pol[0]);
                    let b = Vec2.sub(pol[pol.length - 1], pol[0]);
                    let angle = Vec2.angleACW(a, b);
                    if (angle > Math.PI) {
                        found = true;
                        let j = 0;
                        let k = j + 2;
                        let newSide = new LineSegment(new Vec2(pol[j].x, pol[j].y),
                            new Vec2(pol[k % pol.length].x, pol[k % pol.length].y));
                        let newSideHeading =
                            (new Vec2(newSide.b.x - newSide.a.x,
                                newSide.b.y - newSide.a.y)).heading;
                        while (!(a.heading > b.heading ?
                            ((newSideHeading > a.heading &&
                                newSideHeading < 2 * Math.PI) ||
                                (newSideHeading > 0 &&
                                    newSideHeading < b.heading)) :
                            (newSideHeading > a.heading &&
                                newSideHeading < b.heading))
                            || intersectWithPoligon(
                                new LineSegment(new Vec2(pol[j % pol.length].x,
                                    pol[j % pol.length].y),
                                    new Vec2(pol[k % pol.length].x,
                                        pol[k % pol.length].y)),
                                pol,
                                [(pol.length - 1) % pol.length,
                                j % pol.length,
                                (k - 1) % pol.length,
                                k % pol.length])) {
                            k++;
                            newSide = new LineSegment(
                                new Vec2(pol[j].x,
                                    pol[j].y),
                                new Vec2(pol[k % pol.length].x,
                                    pol[k % pol.length].y));
                            newSideHeading = (
                                new Vec2(
                                    newSide.b.x - newSide.a.x,
                                    newSide.b.y - newSide.a.y))
                                .heading;
                        }
                        let pol1 = [];
                        let pol2 = [];
                        for (let l = j; l <= k; l++) {
                            pol1.push(pol[l % pol.length]);
                        }
                        for (let l = k; l <= j + pol.length; l++) {
                            pol2.push(pol[l % pol.length]);
                        }
                        poligons[i] = pol1;
                        poligons.push(pol2);
                        continue checkAllPoligons;
                    }
                    for (let j = 1; j < pol.length; j++) {
                        let a = Vec2.sub(pol[(j + 1) % pol.length], pol[j]);
                        let b = Vec2.sub(pol[j - 1], pol[j]);
                        let angle = Vec2.angleACW(a, b);
                        if (angle > Math.PI) {
                            found = true;
                            let k = j + 2;
                            let newSide = new LineSegment(
                                new Vec2(pol[j].x,
                                    pol[j].y),
                                new Vec2(pol[k % pol.length].x,
                                    pol[k % pol.length].y));
                            let newSideHeading = (
                                new Vec2(newSide.b.x - newSide.a.x,
                                    newSide.b.y - newSide.a.y))
                                .heading;
                            while (!(a.heading > b.heading ?
                                ((newSideHeading > a.heading &&
                                    newSideHeading < 2 * Math.PI) ||
                                    (newSideHeading > 0 &&
                                        newSideHeading < b.heading)) :
                                (newSideHeading > a.heading &&
                                    newSideHeading < b.heading)) ||
                                intersectWithPoligon(
                                    newSide,
                                    pol,
                                    [(j - 1) % pol.length,
                                    j % pol.length,
                                    (k - 1) % pol.length,
                                    k % pol.length])) {
                                k++;
                                newSide = new LineSegment(
                                    new Vec2(pol[j].x,
                                        pol[j].y),
                                    new Vec2(pol[k % pol.length].x,
                                        pol[k % pol.length].y));
                                newSideHeading = (
                                    new Vec2(
                                        newSide.b.x - newSide.a.x,
                                        newSide.b.y - newSide.a.y))
                                    .heading;
                            }
                            let pol1 = [];
                            let pol2 = [];
                            for (let l = j; l <= k; l++) {
                                pol1.push(pol[l % pol.length]);
                            }
                            for (let l = k; l <= j + pol.length; l++) {
                                pol2.push(pol[l % pol.length]);
                            }
                            poligons[i] = pol1;
                            poligons.push(pol2);
                            continue checkAllPoligons;
                        }
                    }
                }
            }
        }

        for (let i = poligons.length - 1; i >= 0; i--) {
            let pol = poligons[i];
            console.log(pol);
            while (pol.length > 3) {
                poligons.push([pol[0], pol[1], pol[2]]);
                pol.splice(1, 1);
            }
        }

        let mSum = 0;
        let pSum = new Vec2(0, 0);
        poligons.forEach(pol => {
            let a = Math.sqrt(Math.pow(pol[0].x - pol[1].x, 2) + Math.pow(pol[0].y - pol[1].y, 2));
            let b = Math.sqrt(Math.pow(pol[1].x - pol[2].x, 2) + Math.pow(pol[1].y - pol[2].y, 2));
            let c = Math.sqrt(Math.pow(pol[2].x - pol[0].x, 2) + Math.pow(pol[2].y - pol[0].y, 2));
            let s = (a + b + c) / 2;
            let m = Math.sqrt(s * (s - a) * (s - b) * (s - c));
            mSum += m;
            pSum.x += m * (pol[0].x + pol[1].x + pol[2].x) / 3;
            pSum.y += m * (pol[0].y + pol[1].y + pol[2].y) / 3;
        });
        pSum.div(mSum);
        this.pos = pSum;
        this.m = mSum;
        this.am = this.m * this.m * 0.4;
    }

    rotate(angle) {
        this.points.forEach(p => {
            let point = new Vec2(p.x, p.y);
            point.sub(this.pos);
            point.rotate(angle);
            point.add(this.pos);
            p.x = point.x;
            p.y = point.y;
        });
        this.rotation += angle;
    }

    get isConcave() {
        let pol = this.points;
        let angle = Vec2.angleACW(Vec2.sub(pol[1], pol[0]),
            Vec2.sub(pol[pol.length - 1], pol[0]));
        if (angle > Math.PI) return true;
        for (let i = 1; i < pol.length - 1; i++) {
            angle = Vec2.angleACW(Vec2.sub(pol[(i + 1) % pol.length],
                pol[i]), Vec2.sub(pol[i - 1], pol[i]));
            if (angle > Math.PI) return true;
        }
        angle = Vec2.angleACW(Vec2.sub(pol[0], pol[pol.length - 1]),
            Vec2.sub(pol[pol.length - 2], pol[pol.length - 1]));
        if (angle > Math.PI) return true;
        return false;
    }

    static collide(b1, b2) {
        let matches = 0;
        let heading = 0;
        let cp = new Vec2(0, 0);
        let intersect = false;
        b1.points.forEach((p, idx) => {
            let side1 = new LineSegment(new Vec2(p.x, p.y), new Vec2(b1.points[(idx + 1) % b1.points.length].x, b1.points[(idx + 1) % b1.points.length].y));
            b2.points.forEach((pp, idxx) => {
                let side2 = new LineSegment(new Vec2(pp.x, pp.y), new Vec2(b2.points[(idxx + 1) % b2.points.length].x, b2.points[(idxx + 1) % b2.points.length].y));
                let sect = LineSegment.intersect(side1, side2);
                if (sect) {
                    matches++;
                    cp.add(sect);
                    intersect = true;

                    let v1 = Vec2.sub(side1.b, side1.a);
                    let v2 = Vec2.sub(side2.b, side2.a);
                    heading += v1.heading + v2.heading;
                }
            });
        });

        if (!intersect) return;
        cp.div(matches);
        heading /= matches * 2;

        let a = Vec2.fromAngle(heading);
        a.mult(-30);
        stroke("red");
        line(cp.x, cp.y, cp.x + a.x, cp.y + a.y);

        let v1 = b1.vel.copy;
        let v2 = b2.vel.copy;
        let ang1 = b1.ang;
        let ang2 = b2.ang;
        let r1 = Vec2.sub(cp, b1.pos);
        let r2 = Vec2.sub(cp, b2.pos);
        let am1 = b1.am;
        let am2 = b2.am;
        let m1 = b1.m;
        let m2 = b2.m;
        let k = (b1.k + b2.k) / 2;
        let fc = (b1.fc + b2.fc) / 2;

        let v1v = r1.copy;
        let v2v = r2.copy;
        v1v.rotate(Math.PI / 2);
        v2v.rotate(Math.PI / 2);
        v1v.mult(ang1);
        v2v.mult(ang2);
        let vk1 = v1v.copy;
        let vk2 = v2v.copy;
        v1v.add(v1);
        v2v.add(v2);

        v1v.rotate(-heading);
        v2v.rotate(-heading);
        v1.rotate(-heading);
        v2.rotate(-heading);
        vk1.rotate(-heading);
        vk2.rotate(-heading);

        let pk1 = am1 / r1.length;
        let pk2 = am2 / r2.length;

        let dvk1vx = (1 + k) * (pk1 * vk1.x + pk2 * vk2.x) / (pk1 + pk2) - (k + 1) * vk1.x;
        let dvk2vx = (1 + k) * (pk1 * vk1.x + pk2 * vk2.x) / (pk1 + pk2) - (k + 1) * vk2.x;

        let vkk = (am1 * vk1.y / r1.length + am2 * vk2.y / r2.length) / (am1 / r1.length + am2 / r2.length);

        let dvk1vy = -Math.sign(vk1.y) * fc * dvk1vx;
        let dvk2vy = -Math.sign(vk2.y) * fc * dvk2vx;
        if (Math.abs(vkk - vk1.y) > Math.abs(dvk1vy)) dvk1vy = vkk - vk1.y;
        if (Math.abs(vkk - vk2.y) > Math.abs(dvk2vy)) dvk2vy = vkk - vk2.y;


        let dv1vx = (1 + k) * (m1 * v1.x + m2 * v2.x) / (m1 + m2) - (k + 1) * v1.x;
        let dv2vx = (1 + k) * (m1 * v1.x + m2 * v2.x) / (m1 + m2) - (k + 1) * v2.x;

        let vk = (v1.y * m1 + v2.y * m2) / (m1 + m2);

        let dv1vy = -Math.sign(v1.y) * fc * dv1vx;
        let dv2vy = -Math.sign(v2.y) * fc * dv2vx;
        if (Math.abs(vk - v1.y) > Math.abs(dv1vy)) dv1vy = vk - v1.y;
        if (Math.abs(vk - v2.y) > Math.abs(dv2vy)) dv2vy = vk - v2.y;

        let dv1v = new Vec2(dv1vx + dvk1vx, dv1vy + dvk1vy);
        let dv2v = new Vec2(dv2vx + dvk2vx, dv2vy + dvk2vy);
        dv1v.rotate(heading);
        dv2v.rotate(heading);

        v1.rotate(heading);
        v2.rotate(heading);

        v1.add(dv1v);
        v2.add(dv2v);

        dv1v.rotate(-r1.heading);
        dv2v.rotate(-r2.heading);

        let dang1 = (dv1v.y * m1 * r1.length) / (am1 + r1.length * r1.length * m1);
        let dang2 = (dv2v.y * m2 * r2.length) / (am2 + r2.length * r2.length * m2);

        ang1 += dang1;
        ang2 += dang2;

        let vp1 = Vec2.fromAngle(r1.heading - Math.PI / 2);
        vp1.mult(r1.length * dang1);
        let vp2 = Vec2.fromAngle(r2.heading - Math.PI / 2);
        vp2.mult(r2.length * dang2);
        v2.sub(vp2);
        v1.add(vp1);

        b1.vel = v1;
        b2.vel = v2;

        b1.ang = ang1;
        b2.ang = ang2;

        b1.pos = b1.lastPos.copy;
        b2.pos = b2.lastPos.copy;
    }
}