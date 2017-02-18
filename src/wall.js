import {
    Entity,
    Vec2,
    BoxCollider,
} from 'engine';

export default class Wall extends Entity {

    init () {

        this.collider = this.addComponent(BoxCollider, {
            size: new Vec2(this.props.width, this.props.height),
            isTrigger: true,
        });

    }

}