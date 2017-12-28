import _            from 'lodash';
import Vec2         from 'lib/math/vec2';
import Mat3         from 'lib/math/mat3';
import mathUtils    from 'lib/math/utils';
import Box2         from 'lib/math/box2';
import Ray2         from 'lib/math/ray2';
import Array2       from './array2';
import collisions   from 'lib/math/collisions';

/*
    
    class to create and manage a 2d grid like so:

    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
    
    grid coord system origin is top left and y axis is positive going down

*/

export default class SquareGrid extends Array2 {

    constructor (props) {
        
        // TODO probably these default 0's are just useless and should require non-zero values
        // keep thinking about writing/using some assert helpers?
        // ah node has an assert I could use!

        super(props.width, props.height);

        this.cellWidth = props.cellWidth || 0;
        this.cellHeight = props.cellHeight || 0;
        this.halfCellWidth = this.cellWidth / 2;
        this.halfCellHeight = this.cellHeight / 2;
        
        this.size = new Vec2(this.width * this.cellWidth, this.height * this.cellHeight);
        Object.freeze(this.size);

        this.originOffset = new Mat3(
            1,                  0,                  0,
            0,                  1,                  0,
            this.size.x/2,      this.size.y/2,      1
        );
        this.originOffsetInverse = this.originOffset.getInverse();
        Object.freeze(this.originOffset);
        Object.freeze(this.originOffsetInverse);

        this.flipY = new Mat3(
            1,  0,  0,
            0,  -1, 0,
            0,  0,  1
        );
        Object.freeze(this.flipY);

    }

    getModelPosition (cellX, cellY) {

        let position = new Vec2();

        cellX = mathUtils.clamp(cellX, 0, this.width - 1);
        cellY = mathUtils.clamp(cellY, 0, this.height - 1);

        position.x = cellX * this.cellWidth + this.halfCellWidth;
        position.y = cellY * this.cellHeight + this.halfCellHeight;
        
        return position;

    }

    // TODO grid could prob calc and cache the center positions for each tile
    // to avoid the cost of lots of this math

    // - returned position in the same form as expected by getCellCoords
    getPosition (cellX, cellY) {
        
        let position = this.getModelPosition(cellX, cellY);
        
        position.applyMatrix3(this.originOffsetInverse);
        position.applyMatrix3(this.flipY);

        return position;

    }

    // - caller passes model coords with the assumpion that
    // 0,0 is at the center of the grid as with normal objects
    getCellCoords (x, y) {

        let position = new Vec2(x, y);

        position.applyMatrix3(this.flipY);
        position.applyMatrix3(this.originOffset);

        position.x = mathUtils.clamp(Math.floor(position.x / this.cellWidth), 0, this.width - 1);
        position.y = mathUtils.clamp(Math.floor(position.y / this.cellHeight), 0, this.height - 1);
        
        return position;

    }

    getOverlappingCells (worldAABB) {

        let overlappingCells = [];
        let boxTopLeft = new Vec2(worldAABB.center().x - worldAABB.size().x/2, worldAABB.center().y + worldAABB.size().y/2);
        let boxBottomRight = new Vec2(worldAABB.center().x + worldAABB.size().x/2, worldAABB.center().y - worldAABB.size().y/2);
        let min = this.getCellCoords(boxTopLeft.x, boxTopLeft.y);
        let max = this.getCellCoords(boxBottomRight.x, boxBottomRight.y);

        for (let y=min.y; y<max.y+1; y++) {
            for (let x=min.x; x<max.x+1; x++) {
                overlappingCells.push(new Vec2(x, y));
            }
        }

        return overlappingCells;

    }

    getCellAABB (x, y) {

        return new Box2().setFromPoints(this.getCellVerticies(x, y));

    }

    getCellVerticies (x, y) {

        let position = this.getPosition(x, y);
        // returned in CCW winding order
        return [
            new Vec2(position.x - this.halfCellWidth, position.y + this.halfCellHeight),
            new Vec2(position.x - this.halfCellWidth, position.y - this.halfCellHeight),
            new Vec2(position.x + this.halfCellWidth, position.y - this.halfCellHeight),
            new Vec2(position.x + this.halfCellWidth, position.y + this.halfCellHeight),
        ];

    }

    getAdjacentCells (x, y, includeDiag, callback) {

        let test;
        if (callback && _.isFunction(callback)) {
            test = callback;
        } else {
            test = () => {
                return true;
            };
        }

        let adjacentCells = [];

        // north
        // x, y-1
        if (this.inBounds(x, y-1)) {
            if (test(this.get(x, y-1))) {
                adjacentCells.push({x: x, y: y-1});
            }
        }

        // northeast
        // x+1, y-1
        if (includeDiag && this.inBounds(x+1, y-1)) {
            if (test(this.get(x+1, y-1))) {
                adjacentCells.push({x: x+1, y: y-1});
            }
        }

        // east
        // x+1, y
        if (this.inBounds(x+1, y)) {
            if (test(this.get(x+1, y))) {
                adjacentCells.push({x: x+1, y: y});
            }
        }

        // southeast
        // x+1, y+1
        if (includeDiag && this.inBounds(x+1, y+1)) {
            if (test(this.get(x+1, y+1))) {
                adjacentCells.push({x: x+1, y: y+1});
            }
        }

        // south
        // x, y+1
        if (this.inBounds(x, y+1)) {
            if (test(this.get(x, y+1))) {
                adjacentCells.push({x: x, y: y+1});
            }
        }

        // southwest
        // x-1, y+1
        if (includeDiag && this.inBounds(x-1, y+1)) {
            if (test(this.get(x-1, y+1))) {
                adjacentCells.push({x: x-1, y: y+1});
            }
        }

        // west
        // x-1, y
        if (this.inBounds(x-1, y)) {
            if (test(this.get(x-1, y))) {
                adjacentCells.push({x: x-1, y: y});
            }
        }

        // northwest
        // x-1, y-1
        if (includeDiag && this.inBounds(x-1, y-1)) {
            if (test(this.get(x-1, y-1))) {
                adjacentCells.push({x: x-1, y: y-1});
            }
        }

        return adjacentCells;

    }

    cellLinecast (startCoords, endCoords, filterCallback) {

        if (!this.inBounds(startCoords.x, startCoords.y) || !this.inBounds(endCoords.x, endCoords.y)) {
            throw Error("startCoords and/or endCoords are out of bounds.");
        }

        const startPosition = this.getPosition(startCoords.x, startCoords.y);
        const endPosition = this.getPosition(endCoords.x, endCoords.y);

        return this.linecast(startPosition, endPosition);

    }

    linecast (startPosition, endPosition, filterCallback) {

        const rayDirection = endPosition.clone().sub(startPosition).normalize();
        const ray = new Ray2(startPosition, rayDirection);
        
        return this.raycast(ray, filterCallback, Vec2.Distance(startPosition, endPosition));

    }

    // TODO idea of some kinda line walk algo to optimise this?
    raycast (testRay, filterCallback, maxDistance = Infinity) {

        maxDistance = maxDistance !== Infinity ? maxDistance : Math.max(this.width, this.height);
        const startPosition = testRay.origin;
        const endPosition = testRay.at(maxDistance);
        
        // get set of cells to test
        const testCells = this.getOverlappingCells(new Box2().setFromPoints([startPosition, endPosition]));

        let closest = null;

        testCells.forEach((cellCoords) => {

            const cellBox = this.getCellAABB(cellCoords.x, cellCoords.y);

            if (filterCallback(cellCoords)) {

                const contact = collisions.rayVsAabb(testRay, cellBox);

                if ( contact && contact.distance < maxDistance ) {

                    if (!closest || contact.distance < closest.contact.distance) {
                        closest = {
                            contact: contact,
                            cellCoords: cellCoords,
                        }
                    }

                }

            }

        });

        return closest;

    }

}