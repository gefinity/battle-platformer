import invariant        from 'invariant';
import _                from 'lodash';
import Collider         from './collider';
import Box2             from 'lib/math/box2';
import Vec2             from 'lib/math/vec2';
import collisions       from 'lib/math/collisions';

class BoxCollider extends Collider {

    getDefaultProps () {
        return _.merge(super.getDefaultProps(), {
            offset: new Vec2(0, 0),
        });
    }

    init () {

        invariant(this.props.size && (typeof this.props.size.x !== 'undefined') && (typeof this.props.size.y !== 'undefined'), 'boxCollider requires size prop');

        this.boundingBox = new Box2().setFromCenterAndSize(new Vec2(0, 0), this.props.size);

    }

    getWorldBoundingBox (overridePosition = null) {

        let size = this.boundingBox.size();
        let worldPosition = new Vec2().copy(overridePosition || this.transform.position);
        worldPosition.add(this.props.offset);
        let worldBB = new Box2().setFromCenterAndSize(worldPosition, new Vec2(size.x * this.transform.scale.x, size.y * this.transform.scale.y));

        return worldBB;

    }

    intersectRay (testRay, maxDistance, outCollisionData) {
        
        let thisBox = this.getWorldBoundingBox();
        let contact = collisions.rayVsAabb(testRay, thisBox);

        if (contact) {
            if (((maxDistance === null || typeof maxDistance === 'undefined')) || contact.distance <= maxDistance) {
                if (outCollisionData) {
                    outCollisionData.contact = contact;
                }
                return true;
            }
        }

    }

    intersectBox (testBox, outCollisionData) {

        let thisBox = this.getWorldBoundingBox();
        let contact = collisions.aabbVsAabb(testBox, thisBox);

        if (contact.distance < 0) {
            if (outCollisionData) {
                outCollisionData.contacts = [contact];
            }
            return true;
        }

    }

}

export default BoxCollider;