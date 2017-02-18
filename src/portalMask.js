import {
    Entity,
    rendererTypes,
} from 'engine';

export default class Portal extends Entity {

    start () {

        this.systems.renderer.addSource(rendererTypes.RECT, this.transform, {
            width: this.props.width,
            height: this.props.height,
            color: '#000',
        });

    }

}