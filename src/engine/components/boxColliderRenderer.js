import invariant        from 'invariant';
import Component        from 'component';
import Collider         from './collider';
import rendererTypes    from 'rendererTypes';

class BoxColliderRenderer extends Component {

    getDefaultProps () {
        return {
        };
    }

    start () {

        let collider = this.props.collider;

        invariant(collider && collider instanceof Collider, 'collider prop required for BoxColliderRenderer');

        this.renderSource = this.systems.renderer.addSource(rendererTypes.RECT, this.transform, {
            width: collider.props.size.x,
            height: collider.props.size.y,
            offsetPosition: collider.props.offset,
            color: this.props.color || 'red',
            wireframe: this.props.wireframe || true,
            lockRotation: true,
        });

    }

    destroy () {

        this.systems.renderer.removeSource(this.renderSource);

    }

}

export default BoxColliderRenderer;