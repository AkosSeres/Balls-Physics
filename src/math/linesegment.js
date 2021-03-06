import Vec2 from './vec2';

/**
 * Class representing a segment of a line
 */
class LineSegment {
  /**
   * Create a segment
   *
   * @param {Vec2} a_ Starting point
   * @param {Vec2} b_ Ending point
   */
  constructor(a_, b_) {
    this.a = a_;
    this.b = b_;
  }

  /**
   * Get the length of the segment
   *
   * @returns {number} The length
   */
  get length() {
    return Vec2.dist(this.a, this.b);
  }

  /**
   * Get the distance between a point and the line segment
   *
   * @param {Vec2|import('./vec2').Vec2AsObject} p The point as a vector
   * @returns {number} The distance
   */
  distFromPoint(p) {
    const v = Vec2.sub(this.b, this.a);
    const len = v.length;
    v.normalize();
    const rel = Vec2.sub(p, this.a);
    const parralelCoord = Vec2.dot(v, rel);
    const perpCoord = Vec2.cross(v, rel);
    if (parralelCoord >= 0 && parralelCoord <= len) return Math.abs(perpCoord);
    return Math.sqrt(Math.min(rel.sqlength, Vec2.sub(p, this.b).sqlength));
  }

  /**
   * Returns the nearest point to the origin on the segment.
   *
   * @returns {Vec2} The nearest point to the origin
   */
  get nearestPointO() {
    const v = Vec2.sub(this.b, this.a);
    if (Vec2.dot(this.a, v) >= 0) return this.a.copy;
    if (Vec2.dot(this.b, v) <= 0) return this.b.copy;
    v.normalize();
    const coord = -Vec2.dot(this.a, v);
    return Vec2.add(this.a, Vec2.mult(v, coord));
  }

  /**
   * Get if they intersect or not.
   * If they intersect it returns the intersection point.
   * If they do not it returns false.
   *
   * @param {LineSegment} segment1 A segment
   * @param {LineSegment} segment2 Other segment
   * @returns {Vec2 | boolean} Intersetion point
   */
  static intersect(segment1, segment2) {
    const v1 = Vec2.sub(segment1.b, segment1.a);
    const a1 = v1.y / v1.x;
    const c1 = segment1.b.y - segment1.b.x * a1;

    const v2 = Vec2.sub(segment2.b, segment2.a);
    const a2 = v2.y / v2.x;
    const c2 = segment2.b.y - segment2.b.x * a2;

    if (v1.x === 0 && v2.x !== 0) {
      if (
        (segment1.a.x >= segment2.a.x && segment1.a.x <= segment2.b.x)
        || (segment1.a.x <= segment2.a.x && segment1.a.x >= segment2.b.x)
      ) {
        const h = a2 * segment1.a.x + c2;
        if (
          (h > segment1.a.y && h < segment1.b.y)
          || (h < segment1.a.y && h > segment1.b.y)
        ) {
          return new Vec2(segment1.a.x, h);
        }
      }
      return false;
    }
    if (v2.x === 0 && v1.x !== 0) {
      if (
        (segment2.a.x >= segment1.a.x && segment2.a.x <= segment1.b.x)
        || (segment2.a.x <= segment1.a.x && segment2.a.x >= segment1.b.x)
      ) {
        const h = a1 * segment2.a.x + c1;
        if (
          (h > segment2.a.y && h < segment2.b.y)
          || (h < segment2.a.y && h > segment2.b.y)
        ) {
          return new Vec2(segment2.a.x, h);
        }
      }
      return false;
    }
    if (v1.x === 0 && v2.x === 0) {
      if (segment1.a.x === segment2.a.x) {
        let interval1;
        if (segment1.a.y < segment1.b.y) {
          interval1 = [segment1.a.y, segment1.b.y];
        } else {
          interval1 = [segment1.b.y, segment1.a.y];
        }
        let interval2;
        if (segment2.a.y < segment2.b.y) {
          interval2 = [segment2.a.y, segment2.b.y];
        } else {
          interval2 = [segment2.b.y, segment2.a.y];
        }
        const interval = [
          interval1[0] > interval2[0] ? interval1[0] : interval2[0],
          interval1[1] < interval2[1] ? interval1[1] : interval2[1],
        ];
        if (interval[0] <= interval[1]) {
          return new Vec2(segment1.a.x, (interval[0] + interval[1]) / 2);
        }
      }
      return false;
    }

    let interval1;
    if (segment1.a.x < segment1.b.x) {
      interval1 = [segment1.a.x, segment1.b.x];
    } else {
      interval1 = [segment1.b.x, segment1.a.x];
    }
    let interval2;
    if (segment2.a.x < segment2.b.x) {
      interval2 = [segment2.a.x, segment2.b.x];
    } else {
      interval2 = [segment2.b.x, segment2.a.x];
    }
    const interval = [
      interval1[0] > interval2[0] ? interval1[0] : interval2[0],
      interval1[1] < interval2[1] ? interval1[1] : interval2[1],
    ];
    // If they are parralel the only time they intersect is when c1 == c2.
    if (a1 === a2 && c1 === c2 && interval[0] <= interval[1]) {
      return new Vec2(
        (interval[0] + interval[1]) / 2,
        ((interval[0] + interval[1]) / 2) * a1 + c1,
      );
    }
    const x = (c2 - c1) / (a1 - a2);
    if (x >= interval[0] && x <= interval[1]) {
      return new Vec2(x, x * a1 + c1);
    } return false;
  }
}

export default LineSegment;
