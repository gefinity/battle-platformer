import Vec2 from './vec2';
import Mat3 from './mat3';

// TODO maybe document this a bit, explain the diff between position and localPosition

export default class Tranform2 {

    constructor (parent, position, rotation, scale) {
        this._worldMatrix = new Mat3();
        this._localMatrix = new Mat3();

        this._rotationMatrix = new Mat3();
        this._translationMatrix = new Mat3();
        this._scaleMatrix = new Mat3();
        this._localRotationMatrix = new Mat3();
        this._localTranslationMatrix = new Mat3();
        this._localScaleMatrix = new Mat3();

        this._position = new Vec2();
        this._rotation = 0;
        this._scale = new Vec2();
        this._localPosition = new Vec2(0, 0);
        this._localRotation = 0;
        this._localScale = new Vec2(1, 1);
        this._forward = new Vec2(0, 1);

        this._parent = parent || null;

        if (parent || position || rotation || scale) {
            if (position) {
                this.localPosition = position;
            }
            if (rotation) {
                this.localRotation = rotation;
            }
            if (scale) {
                this.localScale = scale;
            }
            this.updateWorldMatrix();
        } 
    }

    // TODO how much do I care about forcing callers not to mutate?
    get position () {
        return Object.freeze(new Vec2().copy(this._position));
    }

    get rotation () {
        return this._rotation;
    }

    // TODO how much do I care about forcing callers not to mutate?
    get scale () {
        return Object.freeze(new Vec2().copy(this._scale));
    }

    // TODO how much do I care about forcing callers not to mutate?
    get localPosition () {
        return Object.freeze(new Vec2().copy(this._localPosition));
    }

    set localPosition (newPosition) {
        this._localPosition.copy(newPosition);
        this._localTranslationMatrix.makeTranslation(this._localPosition);
    }

    get localRotation () {
        return this._localRotation;
    }

    set localRotation (newRotation) {
        this._localRotation = newRotation;
        this._localRotationMatrix.makeRotation(this._localRotation);
    }

    get localScale () {
        return this._localScale;
    }

    set localScale (newScale) {
        this._localScale.copy(newScale);
        this._localScaleMatrix.makeScale(newScale);
    }

    get matrixWorld () {
        return this._worldMatrix;
    }

    get translationMatrix () {
        return this._translationMatrix;
    }

    get rotationMatrix () {
        return this._rotationMatrix;
    }

    get scaleMatrix () {
        return this._scaleMatrix;
    }

    get forward () {
        return this._forward;
    }

    get parent () {
        return this._parent;
    }

    set parent (parent) {
        this._parent = parent;
    }

    updateWorldMatrix () {

        let applyParents = (m) => {

            let parent = m._parent;

            if (parent) {

                this._translationMatrix.multiply(parent._localTranslationMatrix);

                this._rotationMatrix.multiply(parent._localRotationMatrix);

                this._scaleMatrix.multiply(parent._localScaleMatrix);

                if (parent._parent) {
                    applyParents(parent._parent);
                }

            }

        }

        Mat3.MultiplyMatrices(this._localMatrix, this._localScaleMatrix, this._localRotationMatrix, this._localTranslationMatrix);

        this._translationMatrix.copy(this._localTranslationMatrix);
        this._rotationMatrix.copy(this._localRotationMatrix);
        this._scaleMatrix.copy(this._localScaleMatrix);        

        applyParents(this);

        this._position = this._translationMatrix.getPosition(this._position);

        this._rotation = this._rotationMatrix.getRotation();

        this._scale = this._scaleMatrix.getScale(this._scale);

        Mat3.MultiplyMatrices(this._worldMatrix, this._scaleMatrix, this._rotationMatrix, this._translationMatrix);

        this._forward = new Vec2(0, 1).applyMatrix3(this._rotationMatrix);

    }

    update () {
        this.updateWorldMatrix();
    }

}