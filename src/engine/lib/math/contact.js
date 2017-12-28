import Vec2 from './vec2';

export default class Contact {

    constructor (normal, distance, point) {
        this.normal = normal || new Vec2();
        this.distance = distance;
        this.point = point;
    }

    get penetrationVector () {
        return new Vec2().copy(this.normal).multiplyScalar(this.distance);
    }

    set (normal, distance, point) {
        this.normal = normal;
        this.distance = distance;
        this.point = point;
        return this;
    }

}