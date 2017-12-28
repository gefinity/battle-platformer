import invariant        from 'invariant';
import _                from 'lodash';

import Entity           from 'engine/entity';
import rendererTypes    from 'engine/rendererTypes';
import Vec2             from 'engine/lib/math/vec2';
import Collider         from 'engine/components/collider';
import Box2             from 'engine/lib/math/box2';
import collisionsLib    from 'engine/lib/math/collisions';

class GridCollider extends Collider {

    init () {

        invariant(this.props.grid, 'grid prop required');

    }

    getWorldBoundingBox (overridePosition = null) {

        let w = this.props.grid.width * this.props.grid.cellWidth;
        let h = this.props.grid.height * this.props.grid.cellHeight;
        let worldPosition = new Vec2().copy(overridePosition || this.transform.position);
        let worldBB = new Box2().setFromCenterAndSize(worldPosition, new Vec2(w * this.transform.scale.x, h * this.transform.scale.y));
        return worldBB;

    }

    // TODO
    // kinda a mess, because the aabbVsAabb check at the heart of it is discrete,
    // the resolved normal is unreliable, and such we can get a lot of contacts here,
    // I've reduced it a bit by picking the closest contact per axis, but
    // if you imagine a 'floor' of impassable tiles...
    // and the player landing on several of them, depending on the penetration I may get
    // inside 'wall' edges in addition to the destired floor ones.
    // I've moved away from using this for movement but it's still useful, 
    // but it will put an array of contacts in outCollisionData and the caller will need to sort it out
    intersectBox (box, outCollisionData) {

        let grid = this.props.grid;
        let candidates = grid.getOverlappingCells(box);
        let contacts = [];

        let closestByAxis = {
            top: null,
            right: null,
            bottom: null,
            left: null,
        };

        candidates.forEach((cellCoords) => {
            const testBox = grid.getCellAABB(cellCoords.x, cellCoords.y);
            const cellProps = grid.get(cellCoords.x, cellCoords.y);
            
            if (cellProps.impassable) {

                const contact = collisionsLib.aabbVsAabb(box, testBox);

                if (contact.distance <=0) {

                    const n = contact.normal;

                    // top
                    if (!n.x && n.y === 1) {
                        if (closestByAxis.top === null || contact.distance < closestByAxis.top) {
                           contacts.push(contact);
                        }
                        closestByAxis.top = contact.distance;
                    }
                    // right
                    else if (n.x === 1 && !n.y) {
                        if (closestByAxis.right === null || contact.distance < closestByAxis.right) {
                            contacts.push(contact);
                        }
                        closestByAxis.right = contact.distance;
                    }
                    // bottom
                    else if (!n.x && n.y === -1) {
                        if (closestByAxis.bottom === null || contact.distance < closestByAxis.bottom) {
                            contacts.push(contact); 
                        }
                        closestByAxis.bottom = contact.distance;
                    }
                    // left
                    else if (n.x === -1 && !n.y) {
                        if (closestByAxis.left === null || contact.distance < closestByAxis.left) {
                           contacts.push(contact);
                        }
                        closestByAxis.left = contact.distance;
                    }

                }

            }
        });

        if (contacts.length) {
            if (outCollisionData && _.isPlainObject(outCollisionData)) {
                outCollisionData.contacts = contacts;
            }
        }

        return contacts.length;

    }

    intersectRay (testRay, maxDistance, outCollisionData) {

        const grid = this.props.grid;

        const collisionFilter = (cellCoords) => {
            return grid.get(cellCoords.x, cellCoords.y).impassable;
        };

        const collisionInfo = grid.raycast(testRay, collisionFilter, maxDistance);

        if (collisionInfo && outCollisionData && _.isPlainObject(outCollisionData)) {
            outCollisionData.contact = collisionInfo.contact;
            outCollisionData.cellProps = grid.get(collisionInfo.cellCoords.x, collisionInfo.cellCoords.y);
        }

        return !!collisionInfo;

    }

}

export default class GridWorld extends Entity {

    init () {

        this.addComponent(GridCollider, {
            grid: this.props.grid,
        });

        this.renderSource = this.systems.renderer.addSource(rendererTypes.TILE_MAP, this.transform, {
            grid: this.props.grid,
            tilesets: this.props.tilesets,
        });

    }

    destroy () {

        this.systems.renderer.removeSource(this.renderSource);

    }

}