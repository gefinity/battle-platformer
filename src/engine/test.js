import engine               from 'engine/engine';
import CanvasRenderer       from 'engine/systems/canvasRenderer/canvasRenderer';
import ResourceManager      from 'engine/systems/resources/resourceManager';
import rendererTypes        from 'engine/rendererTypes';
import Vec2                 from 'engine/lib/math/vec2';
import Input                from 'engine/systems/input';
import BoxCollider          from 'engine/components/boxCollider';
import sceneIntersectBox    from 'engine/sceneExtensions/intersectBox';
import sceneRaycast         from 'engine/sceneExtensions/raycast';
import BoxColliderRenderer  from 'engine/components/boxColliderRenderer';
import mathUtils            from 'engine/lib/math/utils';
import CircleCollider       from 'engine/components/circleCollider';
import Ray2                 from 'engine/lib/math/ray2';
import Collider             from 'engine/components/collider';
import collisions           from 'engine/lib/math/collisions';
import SimpleScene          from 'engine/scene';

// **************************************************************************************************
// **************************************************************************************************

class BoxObstacle extends Entity {

    getDefaultProps () {
        return {
            width: 100,
            height: 100,
        };
    }

    init () {

        this.collider = this.addComponent(BoxCollider, {
            size: new Vec2(this.props.width, this.props.height),
            offset: new Vec2(-50, 0),
            //isTrigger: true,
        });

        this.colliderRenderer = this.addComponent(BoxColliderRenderer, {
            collider: this.collider,
            color: 'red',
        });

        // render from width/height and transform
        this.systems.renderer.addSource(rendererTypes.RECT, this.transform, {
            width: this.props.width,
            height: this.props.height,
            color: 'green',
            wireframe: false,
        });

    }

    start () {
    }

}

class CircleObstacle extends Entity {

    getDefaultProps () {
        return {
            radius: 50,
        };
    }

    init () {
        
        this.addComponent(CircleCollider, {
            radius: this.props.radius,
        });

        this.systems.renderer.addSource(rendererTypes.CIRCLE, this.transform, {
            radius: this.props.radius,
            color: 'pink',
            wireframe: false,
        });

    } 

    start () {
    }

}
  
class PlayerTest extends Entity {

    getDefaultProps () {
        return {
            width: 100,
            height: 100,
        };
    }

    init () {

        this.collider = this.addComponent(BoxCollider, {
            size: new Vec2(this.props.width, this.props.height),
        });

    }

    start () {

        this.renderSource = this.systems.renderer.addSource(rendererTypes.RECT, this.transform, {
            width: this.props.width,
            height: this.props.height,
            color: 'blue',
            wireframe: false,
        });

        // test raycasting
        this.raySources = [];
        this.rays = [];
        for (let a=0; a<360; a+=10) {
            let aRad = a * mathUtils.deg2Rad;
            let dir = new Vec2();
            dir.x = Vec2.Up.x * Math.cos(aRad) - Vec2.Up.y * Math.sin(aRad);
            dir.y = Vec2.Up.x * Math.sin(aRad) + Vec2.Up.y * Math.cos(aRad);
            this.rays.push(dir);
        }

    }

    keyboardControls (time) {

        let input = this.systems.input;
        let movement = new Vec2(0, 0);

        if ( input.getKey(Input.Keys.D) || input.getKey(Input.Keys.RIGHT) ) {

            movement.x = 1;

        } else if ( input.getKey(Input.Keys.A) || input.getKey(Input.Keys.LEFT) ) {

            movement.x = -1;
        }

        if ( input.getKey(Input.Keys.S) || input.getKey(Input.Keys.DOWN) ) {

            movement.y = -1;

        } else if ( input.getKey(Input.Keys.W) || input.getKey(Input.Keys.UP) ) {

            movement.y = 1;

        }

        return movement;

    }

    update (time) {

        const moveSpeed = 100;

        let movement = this.keyboardControls();

        let nextPosition = this.transform.position.clone().add(movement.multiplyScalar(moveSpeed * time.deltaTime));

        // test sceneIntersectBox:
        let outHitInfo = {};
        let collisionTest = (entity, collider) => {
            //return entity !== this && !collider.isTrigger;
            return entity !== this;
        }
        
        const intersect = sceneIntersectBox(this.collider.getWorldBoundingBox(nextPosition), outHitInfo, collisionTest);

        if (intersect) {
            this.renderSource.props.color = 'orange';
            let contact = outHitInfo.collisions[0].contacts[0];
            let path = [
                contact.point,
                contact.point.clone().add(contact.normal.clone().multiplyScalar(Math.abs(contact.distance))),
            ];
            this.systems.renderer.render(rendererTypes.PATH, this.transform, {
                path: path,
                color: 'red',
            });
            this.systems.renderer.debugger.watch('n', contact.normal.x + ', ' + contact.normal.y);
        } else {
           this.renderSource.props.color = 'blue'; 
        }

        // test sceneRaycast:
        
        //
        this.raySources.forEach((source) => {
            this.systems.renderer.removeSource(source);
        });
        this.raySources = [];

        this.rays.forEach((direction) => {

            let outHitInfo = {};
            let collisionTest = (entity, collider) => {
                return entity !== this;
            }
            let ray = new Ray2(this.transform.position, direction);
            let intersection = sceneRaycast(ray, outHitInfo, collisionTest);

            if (intersection) {

                this.raySources.push(this.systems.renderer.addSource(rendererTypes.PATH, this.transform, {
                    path: [
                        this.transform.position,
                        outHitInfo.closest.contacts[0].point,
                    ],
                    color: '#fff',
                }));

            }

        });

        this.transform.localPosition = this.transform.position.clone().add(movement.multiplyScalar(moveSpeed * time.deltaTime));

    }

}

// **************************************************************************************************
// **************************************************************************************************

let resourceManager = new ResourceManager();

let renderContainer = document.createElement('div');
document.body.appendChild(renderContainer);
let renderer = new CanvasRenderer({
    resources: resourceManager,
    containerElement: renderContainer,
    maxWidth: 1080,
    aspect: 9/16,
    clearColor: '#000',
});

let inputManager = new Input();

engine.injectSceneClass(SimpleScene);

/*
        
    entityConfig: {
        id: '',
        entityClass:,
        transform: {},
        tags: [],
        props: {}
    }

*/
engine.importEntities([
    {
        entityClass: BoxObstacle,
        transform: {
            position: {
                x: 200,
                y: 0,
            },
            scale: {
                x: 1.5,
                y: 1.5,
            },
        },
    },
    {
        entityClass: CircleObstacle,
        transform: {
            position: {
                x: -200,
                y: 0,
            },
            scale: {
                x: 1,
                y: 1,
            },
        },
    },
    {
        entityClass: PlayerTest,
    },
]);

//engine.injectSceneClass(SimpleScene);
engine.setSystem('resources', resourceManager);
engine.setSystem('renderer', renderer);
engine.setSystem('input', inputManager);
engine.addUpdateCallback((deltaTime, time) => {
    //renderer.debugger.watch('dt', deltaTime);
});
engine.timeSettings.updateInterval = 1000/60;
engine.init();
engine.showStats();
//engine.hideStats();
engine.start();
//engine.advance(1000/60);

