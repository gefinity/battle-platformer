export default {

    scale: function (valueIn, baseMin, baseMax, limitMin, limitMax) {
        return ((limitMax - limitMin) * (valueIn - baseMin) / (baseMax - baseMin)) + limitMin;
    },

    get deg2Rad () {
        return Math.PI / 180;
    },

    get rad2Deg () {
        return 180 / Math.PI;
    },

    clamp (x, a, b) {
        return ( x < a ) ? a : ( ( x > b ) ? b : x );
    },

    lerp (a, b, t) {

        return (1 - t) * a + t * b;

    },

    // a and b are in radians
    // http://stackoverflow.com/questions/2708476/rotation-interpolation
    lerpAngle (a, b, t) {

        let difference = Math.abs(b - a);

        if (difference > Math.PI) {
            // We need to add on to one of the values.
            if (b > a) {
                // We'll add it on to start...
                a += 2*Math.PI;
            } else {
                // Add it on to end.
                b += 2*Math.PI;
            }
        }

        // Interpolate it.
        let value = this.lerp(a, b, t);

        // Wrap it..
        let rangeZero = 2*Math.PI;

        if (value >= 0 && value <= 2*Math.PI)
            return value;

        return (value % rangeZero);

    },

};