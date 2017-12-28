import Entity               from 'engine/entity';
import Vec2                 from 'engine/lib/math/vec2';
import BoxCollider          from 'engine/components/boxCollider';
import SpriteRenderer       from 'engine/components/spriteRenderer';
import BoxColliderRenderer  from 'engine/components/boxColliderRenderer';
import sceneIntersectBox    from 'engine/sceneExtensions/intersectBox';
import mathUtils            from 'engine/lib/math/utils';

class Axe extends Entity {

    getDefaultProps () {
        return {
            initialvelocity: new Vec2(1, 0),
            gravityConstant: 1600,
            width: 15,
            height: 15,
            terminalVelocity: Infinity,
        };
    }

    init () {

        this.velocity = new Vec2().copy(this.props.initialvelocity);

        let facing = Math.sign(this.velocity.x) === 1 ? 'E' : 'W';

        this.sprite = this.addComponent(SpriteRenderer, {
            spriteConfigsJsonPath: 'sprites/fx.json',
            spriteName: 'axe'+facing,
            fps: 8,
            loop: true,
            scale: {x: 1.5, y: 1.5},
        });

        this.collider = this.addComponent(BoxCollider, {
            size: new Vec2(this.props.width, this.props.height),
            isTrigger: true,
        });

        // this.colliderRenderer = this.addComponent(BoxColliderRenderer, {
        //     collider: this.collider,
        //     color: 'red',
        // });

    }

    update (time) {

        if (this.stuck) {
            return;
        }

        const lastVelocity = new Vec2().copy(this.velocity);

        const acceleration = new Vec2();
        acceleration.y = -this.props.gravityConstant;

        this.velocity.add(acceleration.multiplyScalar(time.deltaTime));

        const velocityStep = lastVelocity.clone().add(this.velocity).multiplyScalar(0.5 * time.deltaTime)

        velocityStep.clampScalar(-this.props.terminalVelocity, this.props.terminalVelocity);

        const dir = Math.sign(this.velocity.x);
        let nextRotation = this.transform.localRotation - ((10*mathUtils.deg2Rad) * -dir);

        let nextPosition = this.transform.position.clone().add(velocityStep);

        const nextBox = this.collider.getWorldBoundingBox(nextPosition);

        const collisionInfo = {};
        const hit = sceneIntersectBox(nextBox, collisionInfo, (entity) => {
            return !(entity instanceof Axe);
        });

        if (hit) {

            let closestContact = null;
            let closestDistance = Infinity;

            collisionInfo.collisions.forEach((collision) => {

                if (collision.entity.hasId('World')) {

                    collision.contacts.forEach((contact) => { 
                        const normalsOppising = Math.sign(contact.normal.x) !== Math.sign(dir.x);
                        if (normalsOppising && contact.distance < closestDistance) {
                            closestDistance = contact.distance;
                            closestContact = contact;
                        }
                    });

                } else {

                    if (collision.entity.onHit) {
                        collision.entity.onHit(time);
                    }

                }

            });

            // axes stick into walls
            if (closestContact) {
                nextPosition.sub(closestContact.penetrationVector);
                this.stuck = true;
                let dir = Math.sign(this.velocity.x);
                this.velocity.reset(0, 0);
                let n = closestContact.normal;

                // rotate the axe so it looks like it could be stuck in the wall
                if (n.x === 1) {
                    // west wall
                    nextRotation = 0;
                } else if (n.x === -1) {
                    // east eall
                    nextRotation = 0;
                }

                else if (n.y === 1) {
                    // floor
                    if (dir === 1) {
                        // axe headed east
                        nextRotation = 65 * mathUtils.deg2Rad;
                    } else {
                        // axe headed west
                        nextRotation = -65 * mathUtils.deg2Rad;
                    }
                } else if (n.y === -1) {
                    // ceiling
                    if (dir === 1) {
                        // axe headed east
                        nextRotation = -90 * mathUtils.deg2Rad;
                    } else {
                        // axe headed west
                        nextRotation = 90 * mathUtils.deg2Rad;
                    }
                }

            }   

        }

        this.transform.localRotation = nextRotation
        this.transform.localPosition = nextPosition;

    }

}

export default Axe;