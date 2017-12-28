import Vec2 from './vec2';

export default class Ray2 {

    constructor (origin, direction) {

        this.origin = (origin) ? origin : new Vec2();
        this.direction = (direction) ? direction : new Vec2();

    }

    at (t, optionalTarget) {

        let result = optionalTarget || new Vec2();
        return result.copy(this.direction).multiplyScalar(t).add(this.origin);

    }

}