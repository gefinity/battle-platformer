import Vec2 from "lib/math/vec2";
import Mat3 from "lib/math/mat3";

class Camera2d {

    constructor (width, height, position) {

        this._width = width;
        this._height = height;
        this._screenOffset = new Vec2(this._width/2, this._height/2);
        this._position = new Vec2((position ? (position.x || 0) : 0), (position ? (position.y || 0) : 0));
        this._cameraMatrix = new Mat3();
        this._projectionMatrix = new Mat3();
        this._inverseMatrix = new Mat3();
        this._inverseProjectionMatrix = new Mat3();

        this._updateMatrix();

    }

    _updateMatrix () {

        let {x, y} = this._position;

        this._cameraMatrix.reset(
            1,   0,  0,
            0,   1,  0,
            x,   y,  1
        );

        // offset origin and flip Y to move move into the canvas 2d coord system
        this._projectionMatrix.reset(
            1,   0,  0,
            0,  -1,  0,
            this._screenOffset.x,   this._screenOffset.y,  1 
        );

        // maintain inverse matrices:
        this._projectionMatrix.getInverse(this._inverseProjectionMatrix);
        this._cameraMatrix.getInverse(this._inverseMatrix);

        //
        this._worldToScreenMatrix = new Mat3();
        Mat3.MultiplyMatrices(this._worldToScreenMatrix, this._inverseMatrix, this._projectionMatrix);
        Object.freeze(this._worldToScreenMatrix);

        this._screnToWorldMatrix = new Mat3();
        Mat3.MultiplyMatrices(this._screnToWorldMatrix, this._inverseProjectionMatrix, this._cameraMatrix);
        Object.freeze(this._screnToWorldMatrix);

    }

    get worldToScreen () {
        return this._worldToScreenMatrix;
    }

    get screenToWorld () {
        return this._screnToWorldMatrix;
    }

    get position () {
        return new Vec2().copy(this._position);
    }

    copyPosition (position) {

        this._position.x = position.x;
        this._position.y = position.y;
        this._updateMatrix();

    }

    setPosition (x, y) {

        this._position.x = x;
        this._position.y = y;
        this._updateMatrix();

    }

    setSize (width, height) {

        this._width = width;
        this._height = height;
        this._screenOffset = new Vec2(this._width/2, this._height/2);
        this._updateMatrix();

    }

}

export default Camera2d;
