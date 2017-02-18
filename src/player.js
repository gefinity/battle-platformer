import engine, {
    Entity,
    Input,
    Vec2,
    spriteLoader,
    SpriteRenderer,
    BoxCollider,
    BoxColliderRenderer,
    sceneIntersectBox,
    Box2,
    Transform2,
    mathUtils,
} from 'engine';
import PlatformController   from './platformController';
import Axe                  from './axe';

const moveSpeed = 300;
const jumpSpeed = 650;
const axeSpeed = 1000;
const gravity = 1600;
const airControl = 0.5;
const deadDuration = 3000;
const corpseDuration = 1000;
const meleeAttackInterval = 400;
const throwAttackInterval = 150;
const lethalWindow = (1000/60 * 3);
const spritePath = 'sprites/viking/viking.json';

export default class Player extends Entity {

    getDefaultProps () {
        return {
        };
    }

    init () {

        this.facing = 'E';
        this.triggeredRestart = false;
        this.dead = false;
        this.deadTime = 0;
        this.running = false;
        this.jumping = false;
        this.attacking = false;
        this.attackTime = 0;
        this.throwTime   = 0;
        this.numAxes = 2;
        this.teleporting = false;
        this.motion = new Vec2(0, 0);

        let resources = this.systems.resources;
        resources.register(spritePath, spriteLoader.load);

        this.zeroG = false;

        this.collider = this.addComponent(BoxCollider, {
            size: new Vec2(this.props.width, this.props.height),
        });

        if (engine.debug) {
            this.colliderRenderer = this.addComponent(BoxColliderRenderer, {
                collider: this.collider,
                color: 'white',
            });
        }

        this.playerSprite = this.addComponent(SpriteRenderer, {
            spriteConfigsJsonPath: spritePath,
            spriteName: 'idle'+this.facing,
            fps: 10,
            lockRotation: true,
            loop: true,
            scale: {x: 1.5, y: 1.5},
        });

        this.controller = this.addComponent(PlatformController, {
            gravityConstant: gravity,
            airControl: airControl,
            collisionFilter: (entity, collider) => {
                return entity !== this && !collider.isTrigger;
            },
        });

    }

    start () {
    }


    onHit (time) {

        if (!this.dead) {
            
            this.dead = true;
            this.deadTime = time.time;
            this.controller.velocity.x = 0;
            this.controller.velocity.y = 0;

            this.addComponent(SpriteRenderer, {
                spriteConfigsJsonPath: 'sprites/fx.json',
                spriteName: 'zombieBloodSplat',
                fps: 5,
                lockRotation: true,
                loop: false,
                scale: {x: 1.5, y: 1.5},
                offsetPosition: {x: 0, y: -10},
                delayUntil: time.time + corpseDuration,
            });

        }

    }

    onTeleported (time, fromPosition, toPosition) {

        this.teleporting = true;
        this.teleportingFrom = fromPosition.clone();
        this.teleportingTo = toPosition.clone();
        this.teleportingTime = time.time;

    }

    updateAnimation (time) {

        let {velocity, grounded, lastGrounded} = this.controller;

        if (this.dead) {

            this.playerSprite.setSprite('death'+this.facing, {
                loop: false,
                offsetPosition: {x: 0, y: -6},
            });

        } else if (this.attacking) {

            if (!grounded) {

                this.playerSprite.sprites['attack1Jump'+this.facing].reset();
                this.playerSprite.sprites['attack1Jump'+this.facing].props.noInterrupt = true;
                this.playerSprite.setSprite('attack1Jump'+this.facing, {
                    loop: false,
                    offsetPosition: {x: 0, y: -15},
                });

            } else {

                this.playerSprite.sprites['attack1'+this.facing].reset();
                this.playerSprite.sprites['attack1'+this.facing].props.noInterrupt = true;
                this.playerSprite.setSprite('attack1'+this.facing, {
                    loop: false,
                    offsetPosition: {x: 0, y: -15},
                });

            }

        } else if (this.throwing) {

            // TODO can also make a jump throwing if needed and this works out

            this.playerSprite.sprites['throw'+this.facing].reset();
            this.playerSprite.sprites['throw'+this.facing].props.noInterrupt = true;
            this.playerSprite.sprites['throw'+this.facing].props.fps = 20;
            this.playerSprite.setSprite('throw'+this.facing, {
                loop: false,
                offsetPosition: {x: 0, y: -6},
            });

        } else if (this.jumping) {

            this.playerSprite.setSprite('jump'+this.facing, {
                loop: false,
                offsetPosition: {x: 0, y: 0},
            });

        } else if (grounded) {

            if (lastGrounded) {

                if (this.running) {

                    this.playerSprite.setSprite('run'+this.facing, {
                        loop: true,
                        offsetPosition: {x: 0, y: 0},
                    });

                } else {

                    this.playerSprite.setSprite('idle'+this.facing, {
                        loop: true,
                        offsetPosition: {x: 0, y: 0},
                    });

                }


            } else {

                this.playerSprite.setSprite('land'+this.facing, {
                    loop: false,
                    offsetPosition: {x: 0, y: 0},
                });

            }

        } else if (!grounded) {

            let falling = Math.sign(velocity.y) === -1;

            if (falling) {

                this.playerSprite.setSprite('fall'+this.facing, {
                    loop: false,
                    offsetPosition: {x: 0, y: 0},
                });

            } else {

                this.playerSprite.setSprite('fly'+this.facing, {
                    loop: false,
                    offsetPosition: {x: 0, y: 0},
                });

            }

        }

    }

    resetKillzoneRenderers () {

        if (this.killzoneRenders && this.killzoneRenders.length) {
            for (let i=0; i<this.killzoneRenders.length; i++) {
                this.systems.renderer.removeSource(this.killzoneRenders[i]);
            }
        }

    }

    platformControls (time) {

        let input = this.systems.input;
        let movement = new Vec2(0, 0);
        let moveVelocity = moveSpeed;
        let jumpVelocity = jumpSpeed;
        this.jumping = false;
        this.running = false;
        this.attacking = false;
        this.throwing = false;

        if ( input.getKey(Input.Keys.D) || input.getKey(Input.Keys.RIGHT) ) {

            movement.x = moveVelocity;
            this.running = true;
            this.facing = 'E';

        } else if ( input.getKey(Input.Keys.A) || input.getKey(Input.Keys.LEFT) ) {

            movement.x = -moveVelocity;
            this.running = true;
            this.facing = 'W';

        }

        if (input.getKeyDown(Input.Keys.SPACE) && this.controller.grounded) {

            movement.y = jumpVelocity;
            this.jumping = true;

        }

        if (input.getKeyDown(Input.Keys.F)) {

            if (!this.attackTime || time.time - this.attackTime > meleeAttackInterval) {

                this.attacking = true;
                this.attackTime = time.time;

                if (engine.debug) {
                    this.resetKillzoneRenderers();
                }

            }

        }

        if (input.getKeyDown(Input.Keys.R)) {

            if (!this.throwTime || time.time - this.throwTime > throwAttackInterval) {
                if (this.numAxes) {
                    this.throwing = true;
                    this.throwTime = time.time;
                }
            }

        }

        return movement;

    }

    zeroGControls (time) {

        let input = this.systems.input;
        let movement = new Vec2(0, 0);
        let moveVelocity = moveSpeed;
        this.jumping = false;
        this.running = false;

        if ( input.getKey(Input.Keys.D) || input.getKey(Input.Keys.RIGHT) ) {

            movement.x = moveVelocity;
            this.facing = 'E';

        } else if ( input.getKey(Input.Keys.A) || input.getKey(Input.Keys.LEFT) ) {

            movement.x = -moveVelocity;
            this.facing = 'W';

        }

        if ( input.getKey(Input.Keys.S) || input.getKey(Input.Keys.DOWN) ) {

            movement.y = -moveVelocity;

        } else if ( input.getKey(Input.Keys.W) || input.getKey(Input.Keys.UP) ) {

            movement.y = moveVelocity;

        }

        return movement;

    }

    updateMove (time) {

        if (!this.zeroG) {
            this.controller.move(time, this.motion);
        } else {
            this.transform.localPosition = this.transform.position.clone().add(this.motion.clone().multiplyScalar(time.deltaTime));
        }

    }

    fixedUpdate (time) {

        if (this.dead) {
            return;
        }

    }

    update (time) {

        let input = this.systems.input;

        if (this.dead) {
            if (time.time - this.deadTime > corpseDuration) {
                this.removeComponent(this.playerSprite);
                this.removeComponent(this.controller);
                this.removeComponent(this.collider);
                this.removeComponent(this.colliderRenderer);
                this.resetKillzoneRenderers();
            }
            if (time.time - this.deadTime > deadDuration && !this.triggeredRestart) {
                this.triggeredRestart = true;
                engine.events.emit('restartGame');
            }
            return;
        }

        if (engine.debug) {
            // G key to toggle zeroG controller
            if ( input.getKeyDown(Input.Keys.G) ) {
                this.zeroG = !this.zeroG;
                console.log('!');
            }
        }

        // TODO should the below go in update or fixedUpdate?
        if (!this.zeroG) {
            this.motion = this.platformControls(time);
        } else {
            this.motion = this.zeroGControls(time);
        }

        this.updateMove(time);

        // check if we hit any enemies,
        // lethalWindow here allows this check to happen repeatedly after
        // the attack input is picked up to make it more forgiving
        if (this.attackTime && (time.time - this.attackTime) < lethalWindow) {
            
            let facing = new Vec2(this.facing === 'E' ? 1 : -1, 0);
            let meleeKillzone = new Box2().setFromCenterAndSize(
                this.transform.position.clone().add(facing.multiplyScalar(32)),
                new Vec2(32, 60)
            );

            const hitInfo = {};
            const hit = sceneIntersectBox(meleeKillzone, hitInfo, (entity, collider) => {
                return entity.hasTag('Enemy') && !collider.trigger;
            });
            if (hit) {
                hitInfo.collisions[0].entity.onHit(time);
            }

            if (engine.debug) {
                // render killzone
                if (!this.killzoneRenders) {
                    this.killzoneRenders = [];
                }
                let t = new Transform2(null, new Vec2().copy(meleeKillzone.center()))
                this.killzoneRenders.push(
                    this.systems.renderer.addSource('RECT', t, {
                        width: meleeKillzone.size().x,
                        height: meleeKillzone.size().y,
                        wireframe: true,
                        color: hit ? 'white' : 'red',
                    })
                );
            }

        }

        // check if we have collected any axes
        const collisionInfo = {};
        let hit = sceneIntersectBox(this.collider.getWorldBoundingBox(), collisionInfo, (entity, collider) => {
            return entity instanceof Axe && entity.stuck;
        });
        if (hit) {
            collisionInfo.collisions.forEach((collision) => {
                engine.removeEntity(collision.entity);
                this.numAxes++;
            });
        }

        // throwing axes
        if (this.throwing && this.numAxes) {

            const dir = this.facing === 'E' ? new Vec2(1, 0.2) : new Vec2(-1, 0.2);
            const axeVelocity = dir.clone().multiplyScalar(axeSpeed).add(this.controller.velocity);
            const axeSpawnPosition = this.transform.position.clone().add(dir.clone().multiplyScalar(this.props.width))

            const newAxe = {
                entityClass: Axe,
                props: {
                    initialvelocity: axeVelocity,
                    gravityConstant: gravity,
                    width: 15,
                    height: 15,
                },
                transform: {
                    position: {
                        x: axeSpawnPosition.x,
                        y: axeSpawnPosition.y,
                    },
                },
            }

            engine.importEntities([newAxe]);

            this.numAxes--;

        }

        // render axe 'ui'
        let spacing = 15;
        let offsetY = -45;
        let offsetX = (((this.numAxes-1)*15)/2);
        for (let i=0; i<this.numAxes; i++) {

            this.systems.renderer.render('IMAGE', this.transform, {
                image: this.systems.resources.get('axe.png'),
                offsetPosition: {
                    x: -offsetX + (spacing * i),
                    y: offsetY,
                },
                scale: {x: 1.5, y: 1.5},
            });

        }

    }

    lateUpdate (time) {

        if (engine.debug) {
            this.systems.renderer.debugger.watch('grounded', !!this.controller.grounded);
        }
        
        this.updateAnimation(time);

        // update camera

        let camera = this.systems.renderer.camera;

        let nextCameraPosition;

        if (this.teleporting) {

            const camChaseSpeed = 1200;

            let move = camChaseSpeed * time.deltaTime;

            let dir = this.transform.position.clone().sub(camera.position).normalize();

            let teleportDir = this.teleportingTo.clone().sub(this.teleportingFrom).normalize();

            if (Math.sign(Vec2.Dot(dir, teleportDir)) === 1) {

                dir.multiplyScalar(move);
                let nextPosition = camera.position.clone().add(dir);
                nextCameraPosition = nextPosition;

            } else {
                this.teleporting = false;
                nextCameraPosition = this.transform.position.clone();
            }


        } else {

            nextCameraPosition = this.transform.position.clone();

        }

        // clamp camera to edges of CameraBounds
        let cameraBounds = engine.findEntitiyById('CameraBounds');
        let boundsW = cameraBounds.props.width;
        let boundsH = cameraBounds.props.height;
        let cameraBoundsBB = new Box2().setFromCenterAndSize(cameraBounds.transform.position, {x: boundsW, y: boundsH})

        let minX = cameraBoundsBB.min.x + camera._width/2;
        let maxY = cameraBoundsBB.max.y - camera._height/2;
        let minY = cameraBoundsBB.min.y + camera._height/2;
        let maxX = cameraBoundsBB.max.x - camera._width/2;

        if (cameraBoundsBB.size().x > camera._width) {
            nextCameraPosition.x = mathUtils.clamp(nextCameraPosition.x, minX, maxX);
        } else {
            nextCameraPosition.x = 0;
        }
        if (cameraBoundsBB.size().y > camera._height) {
            nextCameraPosition.y = mathUtils.clamp(nextCameraPosition.y, minY, maxY);
        } else {
            nextCameraPosition.y = 0;
        }

        camera.copyPosition(nextCameraPosition);

        // TODO seems to be popular but makes me feel sick? 
        // // lerp?
        // let smoothSpeed = 20;
        // nextCameraPosition = Vec2.LerpVectors(new Vec2(), camera.position, nextCameraPosition, smoothSpeed * time.deltaTime)
        // camera.copyPosition(nextCameraPosition);

    }

}