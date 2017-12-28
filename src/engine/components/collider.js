import invariant    from 'invariant';
import _            from 'lodash';
import Component    from 'component';

class Collider extends Component {

    constructor () {
        //invariant(new.target !== Collider, 'Cannot directly construct Abstract classes.');
        super(...arguments);
    }

    getDefaultProps () {
        return _.merge(super.getDefaultProps(), {
            isTrigger: false,
        });
    }

    get isTrigger () {
        return this.props.isTrigger;
    }

    // return Box2 instance in world space, allow worldPosition param
    // as a override over transform.position
    getWorldBoundingBox (overridePosition = null) {}

    intersectBox (testBox, outCollisionData) {}

    intersectRay (testRay, maxDistance, outCollisionData) {}

}

export default Collider;