import invariant            from 'invariant';
import _                    from 'lodash';
import EventEmitter         from 'events';
import Clock                from 'lib/clock';
import Lifecycle            from 'lifecycle';
import SystemLifecycle      from 'systemLifecycle';
import Stats                from 'stats.js';

/**
    
    simple 2d game engine

*/

const events = new EventEmitter();

const clock = new Clock();

const systems = {};
let activeScene = null;
let SceneClass = null;
let initialised = false;
let started = false;
let registeredEntities = [];
let debugMode = false;
let showStats = false;

let accumulator = 0;

const timeSettings = {
    fixedInterval: 1000/60,
    timeScale: 1, // TODO impl support
    maxDelta: 1000/20,
    updateInterval: 1000/60,
};

const stats = new Stats();
stats.showPanel(1);
stats.dom.style.left = null;
stats.dom.style.right = '0px';
if (showStats) {
    document.body.appendChild(stats.dom);
}

function tick (deltaTime, time) {

    if (showStats) {
        stats.begin();
    }

    accumulator += deltaTime;

    // clamp accumulator to avoid death spiral
    accumulator = Math.min(accumulator, timeSettings.maxDelta);

    const timings = {
        deltaTime: deltaTime/1000, // in secs
        time: time,
    };

    let fixedTime = time - deltaTime;

    let systemKeys = Object.keys(systems);

    for (let i=0; i<systemKeys.length; i++) {
        let key = systemKeys[i];
        systems[key].beforeSceneUpdate(timings);
    }

    // fixed, ignore left over accumulator
    while (accumulator >= timeSettings.fixedInterval) {

        fixedTime += timeSettings.fixedInterval;
        accumulator -= timeSettings.fixedInterval;

        activeScene.fixedUpdate(Object.assign({}, timings, {
            deltaTime: timeSettings.fixedInterval/1000,
            time: fixedTime,
        }));

    } 

    accumulator = 0;

    // // semi-fixed
    // while (accumulator > 0) {

    //     let semiFixedDelta = Math.min(timeSettings.fixedInterval, accumulator)
    //     fixedTime += semiFixedDelta;
    //     accumulator -= semiFixedDelta;

    //     activeScene.fixedUpdate(Object.assign({}, timings, {
    //         deltaTime: semiFixedDelta/1000,
    //         time: fixedTime,
    //     }));

    // }

    activeScene.update(timings);

    activeScene.lateUpdate(timings);

    for (let i=0; i<systemKeys.length; i++) {
        let key = systemKeys[i];
        systems[key].afterSceneUpdate(timings);
    }

    if (showStats) {
        stats.end();
    }

}

clock.add(tick);

export default {

    get debug () {
        return debugMode;
    },

    set debug (debug) {
        debugMode = !!debug;
    },

    get events () {
        return events;
    },

    timeSettings: {

        set updateInterval (interval) {
            clock.interval = interval;
        },

        set fixedInterval (interval) {
            timeSettings.fixedInterval = interval;
        },

        set maxDelta (dt) {
            timeSettings.maxDelta = dt;
        },

        set timeScale (scale) {
            timeSettings.timeScale = scale;
        },

    },

    addUpdateCallback (update) {
        clock.add(update);
    },

    setSystem (key, system) {
        invariant(system, 'setSystem missing system');
        invariant(system instanceof SystemLifecycle, 'system must extend SystemLifecycle');
        invariant(!systems[key], 'system already exists at key: ' + key);

        systems[key] = system;
    },

    injectSceneClass (NewSceneClass) {
        invariant(!initialised, 'must call engine.injectSceneClass before engine.init');
        SceneClass = NewSceneClass;
    },

    // can only import top level entities
    importEntities (entityConfigs) {
        entityConfigs = _.isArray(entityConfigs) ? entityConfigs : [entityConfigs];
        if (!started) {
            registeredEntities.push(...entityConfigs);
        } else {
            activeScene.importEntities(entityConfigs);
        }
    },

    clearScene () {
        activeScene.destroy();
    },

    // can only remove top level entities
    removeEntity (entity) {
        return activeScene.removeEntity(entity);
    },

    findEntitiesByTag (tagName) {
        return activeScene.entities.filter((entity) => {
            return entity.tags.includes(tagName);
        });
    },

    findEntitiyById (id) {
        return activeScene.entities.find((entity) => {
            return entity.id === id;
        });
    },

    findEntitiesByType (type) {
        return activeScene.entities.filter((entity) => {
            return entity instanceof type;
        });
    },

    forEachEntities (callback) {
        return activeScene.forEachEntities(callback);
    },

    forEachEntitiesInAabb (aabb, callback) {
        return activeScene.forEachEntitiesInAabb(aabb, callback);
    },

    init () {
        if (initialised) {return};

        initialised = true;
        
        const newScene = new SceneClass(systems);
        invariant(newScene instanceof Lifecycle, 'SceneClass\'s must extend Lifecycle');

        activeScene = newScene;
        activeScene.init();
        activeScene.importEntities(registeredEntities);
        registeredEntities = [];
    },

    start () {
        invariant(initialised, 'must init engine before starting.');
        if (started) {
            return;
        }
        started = true;
        activeScene.start();
        clock.start();
    },

    advance (delta) {
        invariant(initialised, 'must init engine before advancing.');
        if (!started) {
            started = true;
            activeScene.start();
        }
        clock.advance(delta);
    },

    stop () {
        clock.stop();
    },

    showStats () {

        if (!showStats) {
            document.body.appendChild(stats.dom);
            showStats = true;
        }

    },

    hideStats () {

        if (showStats) {
            document.body.removeChild(stats.dom);
            showStats = false;
        }

    },

}