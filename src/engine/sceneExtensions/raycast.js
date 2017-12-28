import Collider from 'components/collider';
import engine   from 'engine';

const noop = function () {return true;};

/**
    
    outHitInfo: {
        collisions: arrayOf({
            contacts,
            entity,
            collider,
            collisionData,
        })
        closest: {
            contacts,
            entity,
            collider,
            collisionData,
        }
    }

*/

function raycast (ray, outHitInfo, collisionCallback = noop, maxDistance = Infinity) {

    const allCollisions = [];
    let closestCollision;

    engine.forEachEntities((entity) => {

        let colliders = entity.findComponentsByType(Collider);

        if (colliders.length) {

            colliders.forEach((collider) => {

                if (collisionCallback(entity, collider)) {

                    const outCollisionData = {};

                    if (collider.intersectRay(ray, maxDistance, outCollisionData)) {

                        const collision = {
                            contacts: [outCollisionData.contact],
                            entity: entity,
                            collider: collider,
                            collisionData: outCollisionData,
                        }

                        if (!closestCollision || outCollisionData.contact.distance < closestCollision.contacts[0].distance) {
                            closestCollision = collision;
                        }

                        allCollisions.push(collision);

                    }

                }

            });

        }

    });

    if (closestCollision && outHitInfo) {
        outHitInfo.collisions = allCollisions;
        outHitInfo.closest = closestCollision;
    }

    return !!closestCollision;

}

export default raycast;
