import invariant    from 'invariant';
import _            from 'lodash';

export default class Array2 {

    constructor (width, height) {
        
        invariant(width && width > 0 && height && height > 0, 'Array2 dimensions must be > 0');

        this.width = width;
        this.height = height;
        
        this._array = new Array(this.height);
        for (let y=0; y<this.height; y++) {
            this._array[y] = new Array(this.width);
            for (let x=0; x<this.width; x++) {
               this._array[y][x] = {}; 
            }
        }
        Object.freeze(this._array);

    }

    inBounds (elementX, elementY) {

        if (elementX >= 0 && elementX <= this.width-1 && elementY >= 0 && elementY <= this.height-1) {
            return true;
        }

        return false;
    }

    get (x, y, key) {

        if (this.inBounds(x, y)) {

            if (key) {

                if (this._array[y][x][key]) {
                    return this._array[y][x][key];
                }

            } else {
                return this._array[y][x];
            }

        }

        return undefined;

    }

    getKey (x, y, key) {

        return this.get(x, y, key);

    }

    set (x, y, value) {

        if (this.inBounds(x, y)) {
            this._array[y][x] = value;
            return value;
        } else {
            throw Error("array2 coords out of bounds");
        }

    }

    setKey (x, y, key, value) {

        if (this.inBounds(x, y)) {
            this._array[y][x] = this._array[y][x] || {};
            this._array[y][x][key] = value;
            return value;
        } else {
            throw Error("array2 coords out of bounds");
        }

    }

    merge (x, y, value) {

        if (this.inBounds(x, y)) {
            this._array[y][x] = _.extend(this._array[y][x], value);
            return value;
        } else {
            throw Error("array2 coords out of bounds");
        }

    }

    loop (callback) {

        if (!callback || !_.isFunction(callback)) {
            throw Error("loop callback required.");
        }

        this._array.forEach((col, y) => {

            col.forEach((row, x) => {

                callback(x, y, this.get(x, y));

            });

        });

    }

}