import invariant        from 'invariant';
import _                from 'lodash';
import Collider         from './collider';
import Box2             from 'lib/math/box2';
import Vec2             from 'lib/math/vec2';
import collisions       from 'lib/math/collisions';

class SphereCollider extends Collider {

    getDefaultProps () {
        return _.merge(super.getDefaultProps(), {
            offset: new Vec2(0, 0),
        });
    }

    init () {

        invariant(this.props.radius && (typeof this.props.radius !== 'undefined'), 'SphereCollider requires radius prop');

    }

    getWorldBoundingBox (overridePosition = null) {

        let d = this.props.radius * 2;
        let worldPosition = new Vec2().copy(overridePosition || this.transform.position);
        worldPosition.add(this.props.offset);
        let worldBB = new Box2().setFromCenterAndSize(worldPosition, new Vec2(d * this.transform.scale.x, d * this.transform.scale.y));
        return worldBB;

    }

    intersectRay (testRay, maxDistance, outCollisionData) {

        let center = this.transform.position.clone().add(this.props.offset);
        let circle = {
            position: center,
            radius: this.props.radius * this.transform.scale.x,
        };
        let contact = collisions.rayVsCircle(testRay, circle);
        if (contact) {
            if (!maxDistance || contact.distance <= maxDistance) {
                if (outCollisionData) {
                    outCollisionData.contact = contact;
                }
                return true;
            }
        }

    }

    intersectBox (testBox, outCollisionData) {

        let center = this.transform.position.clone().add(this.props.offset);
        let circle = {
            position: center,
            radius: this.props.radius * this.transform.scale.x,
        };
        let contact = collisions.aabbVsCircle(testBox, circle);
        if (contact.distance < 0) {
            if (outCollisionData) {
                outCollisionData.contacts = [contact];
            }
            return true;
        }

    }

}

export default SphereCollider;