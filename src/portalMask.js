import Entity           from 'engine/entity';
import rendererTypes    from 'engine/rendererTypes';

export default class Portal extends Entity {

    start () {

        this.systems.renderer.addSource(rendererTypes.RECT, this.transform, {
            width: this.props.width,
            height: this.props.height,
            color: '#000',
        });

    }

}