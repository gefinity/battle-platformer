import _            from 'lodash';
import mathUtils    from './math/utils';

export default class Clock {
  
    constructor (fps=60) {

        fps = mathUtils.clamp(fps, 1, 60);
        this.interval = 1000/fps;
        this.callbacks = [];
        this.lastTime;

        this.running = false;

    }

    set interval (interval) {
        
        if (interval !== 1000/60) {
            this._interval = interval;
        } else {
            this._interval = 0;
        }

    }

    tick (time) {

        if (!this.running) {
            return;
        }

        this.update(time);

        requestAnimationFrame(this.tick.bind(this));

    }

    update (time) {

        let deltaTime = this.lastTime ? time - this.lastTime : this._interval;

        if (deltaTime >= this._interval) {

            this.lastTime = time;
          
            this.callbacks.forEach((callback) => {
                if (callback && _.isFunction(callback)) {
                    callback(deltaTime, time);
                }
            });

        }

    }

    start () {

        if (!this.running) {
            this.running = true;
            requestAnimationFrame(this.tick.bind(this));
        }

    }

    stop () {
        this.running = false;
    }

    // manually tick once with delta (in ms)
    advance (delta = 0) {

        let time = performance.now() + delta;
        this.update(time);

    }

    add (callback) {

        if (this.callbacks.indexOf(callback) === -1) {
            this.callbacks.push(callback);
        }

    }

    remove (callback) {
        this.callbacks.splice(this.callbacks.indexOf(callback), 1);
    }
  
}