import {
    sceneRaycast,
    Ray2,
    Vec2,
} from 'engine';

function collidingWithPlatform (collision) {

    if (collision.entity.hasId('World')) {
        let cellProps;
        if (collision.collisionData && collision.collisionData.cellProps) {
            cellProps = collision.collisionData.cellProps;
        }
        if (cellProps && cellProps.oneWay) {
            return true;
        }
    }

    return false;

}

/**
    
    skinWidth:
    cannot allow collider to penetrate at all, with rounding errors etc,
    so skinWidth ensures there is a buffer between colliders

*/
export default function moveWithRays (collider, velocityStep, collisionFilter, skinWidth = 2, numHorzRays = 3, numVertRays = 3) {

    const currentPosition = collider.transform.position;

    const bounds = collider.getWorldBoundingBox(currentPosition);
    bounds.expandByScalar(skinWidth * -1);
    const boundsSize = bounds.size();
        
    const topLeft = bounds.center().add(new Vec2(-boundsSize.x/2, boundsSize.y/2));
    const topRight = bounds.center().add(new Vec2(boundsSize.x/2, boundsSize.y/2));
    const bottomRight = bounds.center().add(new Vec2(boundsSize.x/2, -boundsSize.y/2));
    const bottomLeft = bounds.center().add(new Vec2(-boundsSize.x/2, -boundsSize.y/2));

    const moveInfo = {
        correctedVelocityStep: velocityStep.clone(),
        collisionAbove: false,
        collisionBelow: false,
        missedRays: [],
        hitRays: [],
        movingThroughPlatform: false,
    };

    const dirX = Math.sign(velocityStep.x);
    const dirY = Math.sign(velocityStep.y);
            
    const horzRaySpacing = boundsSize.y/(Math.max(numHorzRays-1, 1));
    const vertRaySpacing = boundsSize.x/(Math.max(numVertRays-1, 1));
    const horzRayLength = Math.abs(velocityStep.x) + skinWidth;
    const vertRayLength = Math.abs(velocityStep.y) + skinWidth;

    // horizontal collisions
    if (velocityStep.x) {

        let closestDistance = horzRayLength;
        let closestHit = null;
        for (let i=0; i<numHorzRays; i++) {

            const origin = dirX === 1 ?
                bottomRight.clone() :
                bottomLeft.clone();
            origin.add(Vec2.Up.clone().multiplyScalar(horzRaySpacing*i));
            const ray = new Ray2(origin, dirX === 1 ? Vec2.Right : Vec2.Left);
            
            const collisionInfo = {};
            const intersection = sceneRaycast(ray, collisionInfo, collisionFilter, horzRayLength);
            if (intersection) {
                if (collisionInfo.closest.contacts[0].distance <= closestDistance) {
                    closestDistance = collisionInfo.closest.contacts[0].distance;
                    closestHit = collisionInfo.closest;
                }
            }

            if (intersection) {
                moveInfo.hitRays.push(ray);
            } else {
                moveInfo.missedRays.push(ray);
            }

        }

        if (closestHit) {

            moveInfo.correctedVelocityStep.x = (closestHit.contacts[0].distance - skinWidth) * dirX;
            moveInfo.movingThroughPlatform = collidingWithPlatform(closestHit);

        }

    }

    // vertical collisions
    if (velocityStep.y) {

        let closestDistance = vertRayLength;
        let closestHit = null;
        for (let i=0; i<numVertRays; i++) {

            const origin = dirY === 1 ?
                topLeft.clone() :
                bottomLeft.clone();
            origin.add(Vec2.Right.clone().multiplyScalar(vertRaySpacing*i));
            const ray = new Ray2(origin, dirY === 1 ? Vec2.Up : Vec2.Down);

            const collisionInfo = {};
            const intersection = sceneRaycast(ray, collisionInfo, collisionFilter, vertRayLength);
            if (intersection) {
                if (collisionInfo.closest.contacts[0].distance <= closestDistance) {
                    closestDistance = collisionInfo.closest.contacts[0].distance;
                    closestHit = collisionInfo.closest;
                }
            }

            if (intersection) {
                moveInfo.hitRays.push(ray);
            } else {
                moveInfo.missedRays.push(ray);
            }

        }

        if (closestHit) {

            moveInfo.correctedVelocityStep.y = (closestHit.contacts[0].distance - skinWidth) * dirY;
            moveInfo.movingThroughPlatform = collidingWithPlatform(closestHit);

            if (dirY === -1) {
                moveInfo.collisionBelow = true;
            } else {
                moveInfo.collisionAbove = true;
            }

        }

    }

    return moveInfo;

}