import _ from 'lodash';

const watchTimeout = 3000;

const defaults = {
    watchOffset: {
        x: 0,
        y: 0
    },
    watchStyle: {
        fontSize: 16,
        fontFamily: 'sans-serif'
    }
}

class Debugger {

    constructor (canvas, props = {}) {

        this.canvas = canvas;
        this.watchList = {};

        this.props = _.defaults(props, defaults);

    }

    watch (key, value) {

        if (this.watchList[key]) {
            this.watchList[key].value = value;
            this.watchList[key].lastTime = performance.now();
        } else {
            this.watchList[key] = {key: key, value: value, lastTime: performance.now()};
        }

    }

    update (time) {

        let {fontSize, fontFamily} = this.props.watchStyle;
        let ctx = this.canvas.getContext('2d');

        ctx.save();

        ctx.font = fontSize + 'px ' + fontFamily;
        ctx.fillStyle = '#fff';

        for (let i=0; i<Object.keys(this.watchList).length; i++) {

            let key = Object.keys(this.watchList)[i];
            let watchee = this.watchList[key];

            if (watchee.lastTime + watchTimeout < time.time) {
                delete this.watchList[key];
                continue;
            }

            let watchOffset = {
                x: this.props.watchOffset.x,
                y: this.props.watchOffset.y + this.props.watchStyle.fontSize
            }

            watchOffset.y += (i * fontSize);

            ctx.fillText(watchee.key + ':   ' + watchee.value , watchOffset.x, watchOffset.y);

        }

        ctx.restore();

    }



}

export default Debugger;