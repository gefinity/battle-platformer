import invariant from 'invariant';

class Lifecycle {
    
    constructor () {
        //invariant(new.target !== Lifecycle, 'Cannot directly construct Abstract classes.');
        this._started = false;
        this._initialised = false;
    }

    get started () {
        return this._started;
    }

    get initialised () {
        return this._initialised;
    }

    // called once immediately after the object is created
    // lifecyce objects should use init like they might use a constructor,
    // as init is more convenient since the engine uses constructor injection
    init () {}

    // - called once after the engine has been started
    // - always called after all other lifecycle objects have been initialised
    // (so the find* methods can be used)
    start () {}

    destroy () {}

    fixedUpdate (time) {}

    update (time) {}

    lateUpdate (time) {}

}

export default Lifecycle;