import engine           from 'engine/engine';
import Entity           from 'engine/entity';
import Component        from 'engine/component';
import Vec2             from 'engine/lib/math/vec2';
import Collider         from 'engine/components/collider';

import moveWithRays from './moveWithRays';

class PlatformController extends Component {

    getDefaultProps () {
        return {
            collisionFilter: (entity, collider) => {
                return entity !== this.entity && !entity.isTrigger;
            },
            gravityConstant: 1600,
            airControl: 1,
            terminalVelocity: Infinity,
        };
    }

    init () {

        this.motion = new Vec2(0, 0);
        this.velocity = new Vec2(0, 0);
        this.grounded = false;
        this.movingThroughPlatform = false;

    }

    start () {

        this.collider = this.entity.findComponentsByType(Collider)[0];

    }

    move (time, motion) {

        if (!this.collider) {
            return;
        }

        const lastVelocity = new Vec2().copy(this.velocity);

        if (this.grounded) {
            this.velocity.x = motion.x;
        } else {

            // last x velocity is preserved while in air, but changing direction is allowed
            // but is limited by airControl
            if (motion.x !== 0 && Math.sign(motion.x) !== Math.sign(this.velocity.x)) {
                this.velocity.x += (motion.x * this.props.airControl);
            }

        }
        this.velocity.y += motion.y;

        const acceleration = new Vec2();
        acceleration.y = -this.props.gravityConstant;

        this.velocity.add(acceleration.multiplyScalar(time.deltaTime));

        // eular integration
        //let velocityStep = this.velocity.clone().multiplyScalar(time.deltaTime);
        const velocityStep = lastVelocity.clone().add(this.velocity).multiplyScalar(0.5 * time.deltaTime)

        //
        velocityStep.clampScalar(-this.props.terminalVelocity, this.props.terminalVelocity);

        //      
        const skinWidth = 2;
        const moveInfo = moveWithRays(this.collider, velocityStep, this.props.collisionFilter, skinWidth, 6, 4); // 4, 6
        
        if (engine.debug) {
            // render rays for debugging
            const allRays = [].concat(moveInfo.missedRays, moveInfo.hitRays);
            for (let i=0; i<allRays.length; i++) {
                const ray = allRays[i];
                let rayLength = ray.direction.x !== 0 ? velocityStep.x : velocityStep.y;
                rayLength = Math.abs(rayLength) + skinWidth;
                this.systems.renderer.render('PATH', this.collider.transform, {
                    path: [
                        ray.origin,
                        ray.origin.clone().add(ray.direction.clone().multiplyScalar(rayLength)),
                    ],
                    color: moveInfo.hitRays.indexOf(ray) !== -1 ? 'red' : 'white',
                });
            }
        }

        this.lastGrounded = this.grounded;
        this.grounded = moveInfo.collisionBelow;
        this.lastMovingThroughPlatform = this.movingThroughPlatform;
        this.movingThroughPlatform = moveInfo.movingThroughPlatform;

        // can collide with one way platforms if from above and player was not last frame
        if (!this.lastMovingThroughPlatform && this.movingThroughPlatform && moveInfo.collisionBelow) {
            this.movingThroughPlatform = false;
        }

        if (moveInfo.collisionBelow || (moveInfo.collisionAbove && !this.movingThroughPlatform)) {
            this.velocity.y = 0;
        }

        if (!this.movingThroughPlatform && !this.lastMovingThroughPlatform) {
            velocityStep.copy(moveInfo.correctedVelocityStep);
        }

        this.transform.localPosition = this.transform.position.clone().add(velocityStep);

    }

}

export default PlatformController;
