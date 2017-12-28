import Collider     from 'components/collider';
import engine       from 'engine';

const noop = function () {return true;};

/**
    
    outHitInfo: {
        collisions: arrayOf({
            contact,
            entity,
            collider,
            collisionData,
        })
    }

*/

function sceneIntersectBox (aabb, outHitInfo, collisionCallback = noop) {

    const allCollisions = [];

    engine.forEachEntities((entity) => {

        let colliders = entity.findComponentsByType(Collider);

        colliders.forEach((collider) => {

            if (collisionCallback(entity, collider)) {

                const outCollisionData = {};
                if (collider.intersectBox(aabb, outCollisionData)) {

                    const collision = {
                        contacts: outCollisionData.contacts,
                        entity: entity,
                        collider: collider,
                        collisionData: outCollisionData,
                    }

                    allCollisions.push(collision);

                }

            }

        });

    });

    // calc outHitInfo.closest
    if (allCollisions.length && outHitInfo) {
        outHitInfo.collisions = allCollisions;
    }

    return !!allCollisions.length;

}

export default sceneIntersectBox;
