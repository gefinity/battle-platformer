import invariant        from 'invariant';
import _                from 'lodash';
import SystemLifecycle  from './systemLifecycle';
import rendererTypes    from './rendererTypes';
import Transform2       from 'lib/math/transform2';

function customRenderer (time, context, resourceManager, vpMatrix, renderSource) {

    if (renderSource.renderer) {

        renderSource.renderer(time, context, resourceManager, vpMatrix, renderSource);

    }

}

export default class Renderer extends SystemLifecycle {

    constructor () {

        //invariant(new.target !== Renderer, 'Cannot directly construct Abstract classes.');

        super();
        this.renderers = [];
        this.sources = [];
        this.singleFrameSources = [];

        this.renderers[rendererTypes.CUSTOM] = customRenderer;

    }

    addSource(type, transform, props = {}) {

        invariant(type, 'type required');

        transform = transform || new Transform2();

        let source;

        if (_.isFunction(type) || rendererTypes.hasOwnProperty(type) && this.renderers.hasOwnProperty(type)) {
            source = {
                rendererType: _.isFunction(type) ? 'CUSTOM' : type,
                transform: transform,
                props: props,
                renderer: _.isFunction(type) ? type : null,
            };
            this.sources.push(source);
        } else {
            console.error('unknown renderer type ' + type);
        }

        return source;

    }

    removeSource (source) {
        
        if (source && this.sources.indexOf(source) !== -1) {
            this.sources.splice(this.sources.indexOf(source), 1);
        }

    }

    // render a source once
    render (type, transform, props = {}) {

        invariant(type && transform, 'type and transform required');

        if (rendererTypes.hasOwnProperty(type) && this.renderers.hasOwnProperty(type)) {
            let source = {
                rendererType: type,
                transform: transform,
                props: props,
            };
            this.singleFrameSources.push(source);
        } else {
            console.error('unknown renderer type ' + type);
        }

    }
    
}