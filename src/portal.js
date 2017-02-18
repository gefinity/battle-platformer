import engine, {
    Entity,
    Vec2,
    BoxCollider,
    sceneIntersectBox,
} from 'engine';

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