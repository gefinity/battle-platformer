import Entity           from 'engine/entity';
import Vec2             from 'engine/lib/math/vec2';
import BoxCollider      from 'engine/components/boxCollider';

export default class Wall extends Entity {

    init () {

        this.collider = this.addComponent(BoxCollider, {
            size: new Vec2(this.props.width, this.props.height),
            isTrigger: true,
        });

    }

}