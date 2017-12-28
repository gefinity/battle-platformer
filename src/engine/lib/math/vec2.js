import mathUtils from './utils';

export default class Vec2 {

    static Zero = Object.freeze(new Vec2(0, 0));
    static Up = Object.freeze(new Vec2(0, 1));
    static Down = Object.freeze(new Vec2(0, -1));
    static Right = Object.freeze(new Vec2(1, 0));
    static Left = Object.freeze(new Vec2(-1, 0));

    static DistanceSquared (v1, v2) {

        let dx = v1.x - v2.x;
        let dy = v1.y - v2.y;
        return dx * dx + dy * dy;

    }

    static Dot (v1, v2) {

        return v1.x * v2.x + v1.y * v2.y;

    }

    static Distance (v1, v2) {

        return Math.sqrt( Vec2.DistanceSquared(v1, v2) );

    }

    static Angle (v1, v2) {

        var theta = v1.dot( v2 ) / ( v1.length() * v2.length() );

        return Math.acos( mathUtils.clamp( theta, - 1, 1 ) );

    }

    static AddVectors (outVec2, aVec2, bVec2) {

        outVec2.x = aVec2.x + bVec2.x;
        outVec2.y = aVec2.y + bVec2.y;

        return outVec2;

    }

    static SubVectors (outVec2, aVec2, bVec2) {

        outVec2.x = aVec2.x - bVec2.x;
        outVec2.y = aVec2.y - bVec2.y;

        return outVec2;

    }

    static MultiplyVectors (outVec2, aVec2, bVec2) {

        outVec2.x = aVec2.x * bVec2.x;
        outVec2.y = aVec2.y * bVec2.y;

        return outVec2;

    }

    static LerpVectors (outVec2, aVec2, bVec2, alpha) {

        return Vec2.SubVectors(outVec2, bVec2, aVec2).multiplyScalar( alpha ).add(aVec2);


    }

    constructor (x, y) {

        this.reset(x, y);

    }

    reset (x, y) {

        this.x = (x || x === 0) ? x : 0;
        this.y = (y || y === 0) ? y : 0;

        return this;

    }

    equalsZero () {

        return this.x === 0 && this.y === 0;

    }

    copy (vec2) {

        this.x = vec2.x;
        this.y = vec2.y;

        return this;

    }

    clone () {

        return new Vec2(this.x, this.y);

    }

    add (vec2) {

        this.x += vec2.x;
        this.y += vec2.y;

        return this;

    }

    addScalar (s) {

        this.x += s;
        this.y += s;

        return this;

    }

    sub (vec2) {

        this.x -= vec2.x;
        this.y -= vec2.y;

        return this;

    }

    subScalar (scalar) {

        this.x -= scalar;
        this.y -= scalar;

        return this;

    }

    multiply ( v ) {

        this.x *= v.x;
        this.y *= v.y;

        return this;

    }

    multiplyScalar ( scalar ) {

        this.x *= scalar;
        this.y *= scalar;

        return this;

    }

    divide ( v ) {

        this.x /= v.x;
        this.y /= v.y;

        return this;

    }

    divideScalar ( scalar ) {

        if ( scalar !== 0 ) {

            let invScalar = 1 / scalar;

            this.x *= invScalar;
            this.y *= invScalar;

        } else {

            this.x = 0;
            this.y = 0;

        }

        return this;

    }

    min (vec2) {

        if ( this.x > vec2.x ) {

            this.x = vec2.x;

        }

        if ( this.y > vec2.y ) {

            this.y = vec2.y;

        }

        return this;

    }

    max (vec2) {

        if ( this.x < vec2.x ) {

            this.x = vec2.x;

        }

        if ( this.y < vec2.y ) {

            this.y = vec2.y;

        }

        return this;

    }

    clamp (min, max) {

        if ( this.x < min.x ) {

            this.x = min.x;

        } else if ( this.x > max.x ) {

            this.x = max.x;

        }

        if ( this.y < min.x ) {

            this.y = min.y;

        } else if ( this.y > max.y ) {

            this.y = max.y;

        }

        return this;

    }


    clampScalar (min, max) {
        
        if ( this.x < min ) {

            this.x = min;

        } else if ( this.x > max ) {

            this.x = max;

        }

        if ( this.y < min ) {

            this.y = min;

        } else if ( this.y > max ) {

            this.y = max;

        }

        return this;

    }

    floor () {

        this.x = Math.floor( this.x );
        this.y = Math.floor( this.y );

        return this;

    }

    ceil () {

        this.x = Math.ceil( this.x );
        this.y = Math.ceil( this.y );

        return this;

    }

    round () {

        this.x = Math.round( this.x );
        this.y = Math.round( this.y );

        return this;

    }

    abs () {

        this.x = Math.abs(this.x);
        this.y = Math.abs(this.y);

        return this;

    }

    maxComp () {

        if (this.x > this.y) {
            return this.x;
        }

        return this.y;

    }

    perp () {

        this.reset(this.y, -this.x);

    }

    majorAxis () {

        if (Math.abs(this.x) > Math.abs(this.y)) {
            this.reset(Math.sign(this.x), 0);
        } else {
            this.reset(0, Math.sign(this.y));
        }

        return this;

    }

    minorAxis () {

        let majorAxis = this.majorAxis();
        let minorAxis = new Vec2(majorAxis.y, majorAxis.x);
        return minorAxis;

    }

    negate () {

        this.x = - this.x;
        this.y = - this.y;

        return this;

    }

    dot (vec2) {

        return Vec2.Dot(this, vec2);

    }

    lengthSq () {

        return this.x * this.x + this.y * this.y;

    }

    length () {

        return Math.sqrt(this.lengthSq());

    }

    normalize () {

        return this.divideScalar(this.length());

    }

    distanceToSquared ( vec2 ) {

        var dx = this.x - vec2.x, dy = this.y - vec2.y;
        return dx * dx + dy * dy;

    }

    distanceTo (vec2) {

        return Math.sqrt(this.distanceToSquared(vec2));

    }

    lerp (vec2, alpha) {

        this.x += ( vec2.x - this.x ) * alpha;
        this.y += ( vec2.y - this.y ) * alpha;

        return this;

    }

    equals (vec2) {

        return ( ( vec2.x === this.x ) && ( vec2.y === this.y ) );

    }

    applyMatrix3 (mat3) {

        var x = this.x;
        var y = this.y;

        var e = mat3.elements;

        this.x = x * e[0] + y * e[1] + e[2];
        this.y = x * e[3] + y * e[4] + e[5];

        return this;

    }

}