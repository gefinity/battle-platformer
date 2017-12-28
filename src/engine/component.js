import invariant    from 'invariant';
import _            from 'lodash';
import GameObject   from 'gameObject';

class Component extends GameObject {

    constructor (ownerEntity, systems, transform, props = {}) {

        //invariant(new.target !== Component, 'Cannot directly construct Abstract classes.');

        super();

        invariant(transform, 'transform must be injected into components');

        // debatable... meant as an escape hatch
        // I much prefer for entities to pass props into their components and for components 
        // to not need this but there are cases when it's desired. 
        // (default collision callback for a controller component that wants to say if targetEntity !== myOwnerEntity)
        this.entity = ownerEntity;

        this.enabled = true;

        this.systems = systems;

        this.transform = transform;

        this.props = _.defaults(props, this.getDefaultProps());

    }
    
}

export default Component;