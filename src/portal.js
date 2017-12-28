import engine               from 'engine/engine';
import Entity               from 'engine/entity';
import rendererTypes        from 'engine/rendererTypes';
import Vec2                 from 'engine/lib/math/vec2';
import BoxCollider          from 'engine/components/boxCollider';
import sceneIntersectBox    from 'engine/sceneExtensions/intersectBox'

export default class Portal extends Entity {

    init () {
        
        this.collider = this.addComponent(BoxCollider, {
            size: new Vec2(this.props.width, this.props.height),
            isTrigger: true,
        });

    }

    start () {

        if (this.props.waypoint) {
            this.waypoint = engine.findEntitiyById(this.props.waypoint);
        }

    }

    lateUpdate (time) {

        if (!this.waypoint) {
            return;
        }

        const collisionCallback = (entity) => {
            return entity.hasId('Player') || entity.hasTag('Enemy');
        }
        const worldSpaceBB = this.collider.getWorldBoundingBox();
        const hitInfo = {};
        const hit = sceneIntersectBox(worldSpaceBB, hitInfo, collisionCallback);

        if (hit) {

            let collision = hitInfo.collisions[0];
            
            if (collision.entity.hasId('Player')) {
                collision.entity.onTeleported(time, collision.entity.transform.localPosition, this.waypoint.transform.position);
            }

            collision.entity.transform.localPosition = this.waypoint.transform.position;

        }

    }

}