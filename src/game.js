import _            from 'lodash';
import engine, {
    Entity,
    Sprite,
    animation,
} from 'engine';
import waveConfig   from '../assets/waves.json';

function randomForEach (array, callback) {

    let indices = [];

    for (let i=0; i<array.length; i++) {
        indices.push(i);
    }

    while (indices.length) {

        let randIndex = _.random(0, indices.length-1);
        let index = indices[randIndex];
        indices.splice(randIndex, 1);

        if (callback(array[index], index) === false) {
            break;
        }

    }

}

export default class Game extends Entity {

    getDefaultProps () {
        return {
            portalOpeningDuration: 2000,
            portalOpenDuration: 1000,
            portalClosingDuration: 500,
            waveInterval: 2000,
        };
    }

    init () {
        
        this.currentWave = 0;
        this.nextWave = 0
        this.lastWaveTime = 0;
        this.openPortals = [];
        this.deferredSpawns = [];
        this.deferredPortals = [];
        this.lastNumEntities = 0;

        this.waveConfig = waveConfig.map((wave) => {
            return wave.map((entityConfig) => {
                entityConfig.entityClass = require('./' + entityConfig.type).default;
                return entityConfig;
            });
        });

        this.portalDuration = this.props.portalOpeningDuration + this.props.portalOpenDuration + this.props.portalClosingDuration;

    }

    start () {

        this.portalSpriteConfig = this.systems.resources.get('sprites/portal/portal.json');
        this.wavePortals = engine.findEntitiesByTag('WavePortal');

        if (!this.wavePortals.length) {
            console.error('no portals to spawnEntities');
        }

    }

    update (time) {

        // make sure to wait props.waveInterval between the last spaen dieing and a new one spawning
        let numEntities = engine.findEntitiesByTag('Enemy').length + this.deferredSpawns.length;
        if (numEntities === 0) {
            if (this.lastNumEntities !== 0) {
                // wave cleared
                this.lastWaveTime = time.time;
            }
            if (!this.lastWaveTime || (time.time - this.lastWaveTime > this.props.waveInterval)) {
                // spawn new wave
                this.spawnEntities(this.waveConfig[this.nextWave] || this.waveConfig[this.waveConfig.length-1]);
                this.currentWave = this.nextWave;
                //if (this.waveConfig[this.nextWave+1]) {
                    this.nextWave++;
                //}
            }
        }
        this.lastNumEntities = numEntities;

        // TODO both these iterations suck because of removal of live items
        // better solution?

        // spawn deferred entities
        let spawnedEntities = [];
        this.deferredSpawns.forEach((deferredEntity) => {
            if (time.time - deferredEntity.time > this.props.portalOpeningDuration) {
                spawnedEntities.push(deferredEntity);
                engine.importEntities([deferredEntity.entityConfig]);
            }
        });
        spawnedEntities.forEach((deferredEntity) => {
            this.deferredSpawns.splice(this.deferredSpawns.indexOf(deferredEntity), 1);
        });

        // spawn deferred portals
        let spawnedPortals = [];
        this.deferredPortals.forEach((deferredPortal) => {
            if (time.time - deferredPortal.time > 0) {

                spawnedPortals.push(deferredPortal);

                let source = this.systems.renderer.addSource('SPRITE', deferredPortal.transform, {
                    lockRotation: true,
                    loop: true,
                    sprite: deferredPortal.sprite,
                    scale: {
                        x: 0,
                        y: 0,
                    },
                });

                this.openPortals.push({
                    source: source,
                    time: performance.now(),
                });
            }
        });
        spawnedPortals.forEach((deferredPortal) => {
            this.deferredPortals.splice(this.deferredPortals.indexOf(deferredPortal), 1);
        });

        // animate portals created in spawnEntities
        const portalOpenScale = 3;
        this.openPortals.forEach((portal) => {

            if (time.time - portal.time > this.portalDuration) {
                this.systems.renderer.removeSource(portal.source);
            } else {

                let t = time.time - portal.time;
                let s;

                if (t < this.props.portalOpeningDuration) {
                    s = animation.step(animation.easing.easeOutQuart, t, 0, portalOpenScale, this.props.portalOpeningDuration);
                } else if (t >= this.props.portalOpeningDuration && t < this.props.portalOpeningDuration+this.props.portalOpenDuration) {
                    s = portalOpenScale;
                } else if (t >= this.props.portalOpeningDuration+this.props.portalOpenDuration) {
                    s = animation.step(animation.easing.easeInQuint, t, portalOpenScale, 0, this.portalDuration);
                }

                portal.source.props.scale.x = Math.max(s, 0);
                portal.source.props.scale.y = Math.max(s, 0);

            }

        });

        this.systems.renderer.debugger.watch('wave', this.currentWave+1);

    }

    spawnEntities (entityConfigs) {

        if (!this.wavePortals.length) {
            return;
        }

        let entitiesToSpawn = entityConfigs.slice(0);

        let numWaves = Math.ceil(entitiesToSpawn.length / this.wavePortals.length);

        for (let i=0; i<numWaves; i++) {

            randomForEach(this.wavePortals, (wavePortal, index) => {


                if (!entitiesToSpawn.length) {
                    return false;
                }

                let entity = Object.assign({}, entitiesToSpawn.shift(), {
                    transform: {
                        position: {
                            x: wavePortal.transform.position.x,
                            y: wavePortal.transform.position.y,
                        },
                    },
                });

                this.deferredSpawns.push({
                    time: performance.now() + (this.portalDuration * i),
                    entityConfig: entity,
                });

                // create portal
                let sprite = new Sprite({
                    fps: 30,
                }).setFromFixed(this.portalSpriteConfig);

                this.deferredPortals.push({
                    sprite,
                    transform: wavePortal.transform,
                    time: performance.now() + (this.portalDuration * i),
                });

            });

        }

    }

    destroy () {
        
        this.openPortals.forEach((portal) => {
            this.systems.renderer.removeSource(portal.source);
        });

    }

}