import Lifecycle        from 'lifecycle';

class GameObject extends Lifecycle {

    constructor (ownerEntity, systems, transform, props = {}) {
        super();
    }

    getDefaultProps () {
        return {
        };
    }

}

export default GameObject;