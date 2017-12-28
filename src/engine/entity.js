import invariant        from 'invariant';
import _                from 'lodash';
import GameObject       from 'gameObject';
import Transform2       from 'lib/math/transform2';
import Vec2             from 'lib/math/vec2';
import Component        from 'component';

class Entity extends GameObject {

    constructor (systems, transform, id, tags = [], props = {}) {
        super();

        this.systems = systems || {};

        this.enabled = true;

        this.id = id;

        this.tags = tags;

        this.props = _.defaults(props, this.getDefaultProps());

        let propsTransform = this.props.transform || {};
        this.props.transform = null;

        // note: took this feature out because my tools don't support configuring it
        // and the findEntitiyBy* methods only worked on top level entities
        // Is it useful? Transform2 can still be nested

        //this.children = [];
        
        transform = _.extend(transform, propsTransform, transform);

        transform = _.defaults(transform, {
            position: {x: 0, y: 0},
            rotation: 0,
            scale: {x: 1, y: 1},
        });
        this.transform = new Transform2(null, new Vec2(transform.position.x, transform.position.y), transform.rotation, transform.scale);
        
        this.components = [];

    }

    addComponent (componentContructor, props = {}) {

        let newComponent = new componentContructor(this, this.systems, this.transform, props);

        invariant(newComponent instanceof Component, 'addComponent passed non-component contructor');

        this.components.push(newComponent);

        if (this.initialised) {
            newComponent.init();
        }
        if (this.started) {
            newComponent.start();
        }

        return newComponent;

    }

    removeComponent (component) {

        if (this.components.indexOf(component) !== -1) {
            component.destroy();
            this.components.splice(this.components.indexOf(component), 1);
        }

    }

    findComponentsByType (type) {
        return this.components.filter((component) => {
            return component instanceof type;
        });
    }

    hasTag (tagName) {
        return !!(this.tags && this.tags.length && (this.tags.indexOf(tagName) !== -1));
    }

    hasId (id) {
        return this.id === id;
    }

    // addChild (childEntity) {

    //     this.children.push(childEntity);
    //     childEntity.transform.parent = this.transform;

    // }

}

export default Entity;