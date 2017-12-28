import Vec2 from 'lib/math/vec2';

export default class Box2 {

    constructor (min, max) {

        this.min = ( min !== undefined ) ? min : new Vec2(Infinity, Infinity);
        this.max = ( max !== undefined ) ? max : new Vec2(- Infinity, - Infinity);

    }

    clone () {

        return new Box2(this.min, this.max);

    }

    getRect () {

        return {
            x: this.center().x - this.size().x/2,
            y: this.center().y - this.size().y/2,
            w: this.size().x,
            h: this.size().y,
        };

    }

    getVertices () {

        let center = this.center();
        let size = this.size();
        return [
            new Vec2(center.x - size.x/2, center.y + size.y/2),
            new Vec2(center.x - size.x/2, center.y - size.y/2),
            new Vec2(center.x + size.x/2, center.y - size.y/2),
            new Vec2(center.x + size.x/2, center.y + size.y/2),
        ];

    }

    set (min, max) {

        this.min.copy(min);
        this.max.copy(max);

        return this;

    }

    setFromPoints (points) {

        this.makeEmpty();

        points.forEach((point) => {
            this.expandByPoint(point);
        });

        return this;

    }

    setFromCenterAndSize (center, size) {

        var halfSize = new Vec2().copy(size).multiplyScalar(0.5);
        this.min.copy(center).sub(halfSize);
        this.max.copy(center).add(halfSize);

        return this;

    }

    copy ( box ) {

        this.min.copy( box.min );
        this.max.copy( box.max );

        return this;

    }

    makeEmpty () {

        this.min.x = this.min.y = Infinity;
        this.max.x = this.max.y = - Infinity;

        return this;

    }

    equalsEmpty () {

        return (this.max.x < this.min.x) || (this.max.y < this.min.y);

    }

    center () {

        return Vec2.AddVectors(new Vec2(), this.min, this.max).multiplyScalar(0.5);

    }

    size () {

        return Vec2.SubVectors(new Vec2(), this.max, this.min);

    }

    expandByPoint (point) {

        this.min.min(point);
        this.max.max(point);

        return this;

    }

    expandByVector (vector) {

        this.min.sub(vector);
        this.max.add(vector);

        return this;

    }

    expandByScalar (scalar) {

        this.min.addScalar(-scalar);
        this.max.addScalar(scalar);

        return this;

    }

    containsPoint (point) {

        if ( point.x < this.min.x || point.x > this.max.x ||
             point.y < this.min.y || point.y > this.max.y ) {

            return false;

        }

        return true;

    }

    containsBox ( box ) {

        if ( ( this.min.x <= box.min.x ) && ( box.max.x <= this.max.x ) &&
             ( this.min.y <= box.min.y ) && ( box.max.y <= this.max.y ) ) {

            return true;

        }

        return false;

    }

    isIntersectionBox ( box ) {

        // using 6 splitting planes to rule out intersections.

        if ( box.max.x < this.min.x || box.min.x > this.max.x ||
             box.max.y < this.min.y || box.min.y > this.max.y ) {

            return false;

        }

        return true;

    }

    // TODO this is mutative.. which is ok but it's not clear from method name?
    // maybe should be called makeIntersect
    intersect ( box ) {

        this.min.max( box.min );
        this.max.min( box.max );

        return this;

    }

    translate (offsetVec2) {

        this.min.add(offsetVec2);
        this.max.add(offsetVec2);

        return this;

    }

    equals (box) {

        return box.min.equals(this.min) && box.max.equals(this.max);

    }

    setFromBoxes (boxA, boxB) {

        let min = new Vec2().copy(boxA.min).min(boxB.min);
        let max = new Vec2().copy(boxA.max).max(boxB.max);
        this.set(min, max);
        return this;

    }

    expandByBox (box) {

        this.min.min(box.min);
        this.max.max(box.max);
        return this;

    }

    getHalfSize () {

        return new Vec2(this.size().x/2, this.size().y/2);

    }

}