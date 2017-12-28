import _                        from 'lodash';

import engine                   from 'engine/engine';
import Entity                   from 'engine/entity';
import Vec2                     from 'engine/lib/math/vec2';
import SpriteRenderer           from 'engine/components/spriteRenderer';
import BoxCollider              from 'engine/components/boxCollider';
import BoxColliderRenderer      from 'engine/components/boxColliderRenderer';
import sceneIntersectBox        from 'engine/sceneExtensions/intersectBox';

import PlatformController       from './platformController';

const gravity = 1600;
const corpseDuration = 1000;

class Enemy extends Entity {

    getDefaultProps () {
        return {
            width: 32,
            height: 48,
            moveSpeed: 30,
        };
    }

    init () {

        this.tags.push('Enemy');

        this.dead = false;
        this.deadTime = 0;

        this.roamingDirection = _.random(0, 1) === 1 ? 1 : -1;

        this.collider = this.addComponent(BoxCollider, {
            size: new Vec2(this.props.width, this.props.height),
        });

        this.killzoneTrigger = this.addComponent(BoxCollider, {
            size: new Vec2(this.props.width + 20, this.props.height + 20),
            isTrigger: true,
        });

        if (engine.debug) {
            this.addComponent(BoxColliderRenderer, {
                collider: this.collider,
                color: 'red',
            });
            this.addComponent(BoxColliderRenderer, {
                collider: this.killzoneTrigger,
                color: 'red',
            });
        }

        this.controller = this.addComponent(PlatformController, {
            gravityConstant: gravity,
            collisionFilter: (entity, collider) => {
                if (this.dead && entity.hasId('Player')) {return false;}
                return !(entity instanceof Enemy) && entity !== this && !collider.isTrigger;
            },
        });

        let facing = this.roamingDirection === 1 ? 'E' : 'W';
        this.sprite = this.addComponent(SpriteRenderer, {
            spriteConfigsJsonPath: 'sprites/zombie/zombie1.json',
            spriteName: 'walk'+facing,
            // spriteConfigsJsonPath: 'sprites/fx.json',
            // spriteName: 'bloodSplatter',
            fps: 5,
            lockRotation: true,
            loop: true,
            scale: {x: 1.5, y: 1.5},
        });

    }

    updateAnimation (time) {

        let facing = this.roamingDirection === 1 ? 'E' : 'W';

        if (this.dead) {

            this.sprite.sprites['death'+facing].props.fps = 10;
            this.sprite.setSprite('death'+facing, {
                loop: false,
                offsetPosition: {x: 0, y: -20}, 
            });

        } else {

            this.sprite.setSprite('walk'+facing, {
                loop: true,
            });

        }

    }

    onHit (time) {

        if (!this.dead) {
            this.dead = true;
            this.deadTime = time.time;
            this.controller.velocity.x = 0;
            this.controller.velocity.y = 0;
            this.collider.props.isTrigger = true;
            this.collider.enabled = false;

            this.addComponent(SpriteRenderer, {
                spriteConfigsJsonPath: 'sprites/fx.json',
                spriteName: 'zombieBloodSplat',
                fps: 10,
                lockRotation: true,
                loop: false,
                scale: {x: 1.5, y: 1.5},
                offsetPosition: {x: 0, y: -10},
                //delayUntil: time.time + 700,
            });

        }   

    }

    checkHitWall () {

        // change directions if it hit a wall
        const hitInfo = {};
        const hit = sceneIntersectBox(this.killzoneTrigger.getWorldBoundingBox(), hitInfo, (entity, collider) => {
            return entity.hasTag('wall');
        });
        if (hit) {
            hitInfo.collisions.forEach((collision) => {
                collision.contacts.some((contact) => {
                    if (contact.normal.x !== 0) {
                        this.roamingDirection = contact.normal.x;
                        return true;
                    }
                });
            });
        }

    }

    update (time) {

        if (this.dead) {
            if (time.time - this.deadTime > corpseDuration) {
                engine.removeEntity(this);
            }
            return;
        }

        let movement = new Vec2(this.roamingDirection * this.props.moveSpeed, 0);

        this.controller.move(time, movement);

    }

    lateUpdate (time) {

        this.updateAnimation(time);

        if (this.dead) {
            return;
        }

        this.checkHitWall();

        // send onHit to player if hit
        // (in lateUpdate so if players attack and this happen in the same frame, give the advantage to the player) 
        const hitInfo = {};
        const hit = sceneIntersectBox(this.killzoneTrigger.getWorldBoundingBox(), hitInfo, (entity, collider) => {
            return entity.hasId('Player');
        });
        if (hit) {
            hitInfo.collisions.forEach((collision) => {
                collision.entity.onHit(time);
            });
        }

    }

}

export default Enemy;