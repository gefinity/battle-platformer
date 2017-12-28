import invariant from 'invariant';

class SystemsLifecycle {

    constructor () {
        //invariant(new.target !== SystemsLifecycle, 'Cannot directly construct Abstract classes.');
    }

    beforeSceneUpdate (time) {}
    afterSceneUpdate (time) {}

}

export default SystemsLifecycle;