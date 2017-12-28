import _ from 'lodash';

function getIndex (time, fps) {

    return Math.ceil(time/(1000/fps));

}

class Sprite {

    // TODO should demand a more specific format for frames, atm its just... whatever... 
    // *shrugs*
    constructor (props) {

        let defaults = {
            fps: 20,
            frames: [],
        };

        this.props = _.defaults(props, defaults);

        this.animationTime = 0;
        this.looped = false;

        this._setMaxSize();

    }

    _setMaxSize () {

        if (this.props.frames.length) {
            // set width/height as max framesize
            this.width = _.max(this.props.frames, (frame) => {
                return frame.frame.w;
            }).frame.w;
            this.height = _.max(this.props.frames, (frame) => {
                return frame.frame.h;
            }).frame.h;
        }

    }

    /*
    
        eg.

        "fixed": {
            "w": 32,
            "h": 32,
            "rows": 4,
            "cols": 6,
            "start": {"x": 0, "y": 1},
            "end": {"x": 5, "y": 1},
            "dir": "xy" 
        }
        
    */

    // FIXME works but only because my case is super trivial
    // 
    setFromFixed (config) {

        // TODO some runtime validation here?

        let {w, h, start, end, dir, texture} = config.fixed;
        let bounds = {
            minX: 0,
            minY: 0,
            maxX: 0,
            maxY: 0,
        };
        if (config.fixed.bounds) {
            bounds = config.fixed.bounds;
        } else if (config.fixed.rows && config.fixed.cols) {
            bounds.maxX = config.fixed.cols;
            bounds.maxY = config.fixed.rows;
        }

        // let dirX = Math.sign(end.x - start.x);
        // let dirY = Math.sign(end.y - start.y);

        this.props.frames = [];

        // TODO share this... only 2 loops are different
        if (dir === "xy") {

            if (start.x <= end.x && start.y <= end.y) {

                for (let y=start.y; y<end.y+1; y++) {
                    for (let x=start.x; x<end.x+1; x++) {

                        let frame = {
                            frame: {
                                x: x*w,
                                y: y*h,
                                w: w,
                                h: h,
                            },
                            texture: texture,
                        }
                        this.props.frames.push(frame);

                    }
                }

            } else if (start.x >= end.x && start.y >= end.y) {

                for (let y=start.y; y>end.y-1; y--) {
                    for (let x=start.x; x>end.x-1; x--) {

                        let frame = {
                            frame: {
                                x: x*w,
                                y: y*h,
                                w: w,
                                h: h,
                            },
                            texture: texture,
                        }
                        this.props.frames.push(frame);

                    }

                }

            }

        } else if (dir === "yx") {

            // TODO

        }

        this._setMaxSize();

        return this;

    }

    reset () {

        this.animationTime = 0;

    }

    get () {

        let frames = this.props.frames;
        return frames[Math.min(getIndex(this.animationTime, this.props.fps), frames.length-1)];

    }

    isFinished () {

        let nextIndex = getIndex(this.animationTime, this.props.fps);
        if (nextIndex > this.props.frames.length-1 || this.looped) {
            return true;
        }

        return false;

    }

    advance (deltaTime, loop = false) {

        let frames = this.props.frames;

        this.animationTime += deltaTime * 1000;

        let nextIndex = getIndex(this.animationTime, this.props.fps);

        if (nextIndex > frames.length-1) {
            nextIndex = frames.length-1;
            if (loop) {
                let maxTime = frames.length * 1000/this.props.fps;
                this.animationTime = this.animationTime - maxTime;
                this.looped = true;
            }
        }

        return frames[nextIndex] || {
            texture: null,
            frame: {
                x: 0, y: 0, w: 0, h: 0,
            },
        };

    }

}

export default Sprite;
