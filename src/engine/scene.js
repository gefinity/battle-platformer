import invariant from 'invariant';
import _         from 'lodash';
import Lifecycle from './lifecycle';

class Scene extends Lifecycle {

    constructor (systems) {
        
        super();
        this.systems = systems;
        this.entities = [];

    }

    // entities can be nested, this walks entire hierarchy from passed in roots
    _walkEntities (entities, callback) {

        let walk = (entities) => {
            entities.forEach((entity) => {

                callback(entity);

                if (entity.children && entity.children.length) {
                    walk(entity.children);
                }

            });
        };

        walk(entities);

    }

    _createEntity (entityConfig) {

        let Constructor = entityConfig['entityClass'];
        let entity = new Constructor(this.systems, entityConfig.transform, entityConfig.id, entityConfig.tags, entityConfig.props);
        entity.init();
        entity.components.forEach((component) => {
            component.init();
        });
        entity._initialised = true;

        return entity;

    }

    // once entities are added, they have been initialised
    // and may have aquired children
    _startEntities (entities) {

        this._walkEntities(entities, (entity) => {
            entity.start();
            entity.components.forEach((component) => {
                component.start();
            });
            entity._started = true;
        });

    }

    /*
        can only import top level entities
        
        configs take the shape:
        
        {
            id: '',
            entityClass:,
            transform: {},
            tags: [],
            props: {}
        }

    */
    importEntities (entityConfigs) {

        const importedEntities = [];
        entityConfigs = _.isArray(entityConfigs) ? entityConfigs : [entityConfigs];
        entityConfigs.forEach((entityConfig) => {
            const entity = this._createEntity(entityConfig);
            this.entities.push(entity);
            importedEntities.push(entity);
        });
        // start imported entities together after they have all been added
        if (this._started) {
            this._startEntities(importedEntities);
        }

    }

    removeEntity (entity) { 

        if (this.entities.indexOf(entity) !== -1) {
            entity.components.forEach((component) => {
                component.destroy();
            });
            entity.components = [];
            entity.destroy();
            this.entities.splice(this.entities.indexOf(entity), 1);
        }

    }

    forEachEntities (callback) {

        this._walkEntities(this.entities, callback);

    }

    forEachEntitiesInAabb (aabb, callback) {

        invariant(callback && _.isFunction(callback), 'forEachEntitiesInAabb requires callback param'); 

        // TODO idea is that scene extensions like raycast, intersectBox etc
        // will use this to acess scene objects within some region defined by an aabb
        // (though this ref scene impl doesn't do that optimisation)
        // render might use this too with an aabb setup from the camera?

        let entitiesInAabb = this.entities;

        this._walkEntities(entitiesInAabb, callback);

    }

    init () {
    }

    start () {

        this._started = true;
        this._startEntities(this.entities);

    }

    destroy () {

        this._walkEntities(this.entities, (entity) => {
            if (this.entities.indexOf(entity) !== -1) {
                entity.components.forEach((component) => {
                    component.destroy();
                });
                entity.components = [];
                entity.destroy();
            }
        });
        this.entities = [];

    }

    fixedUpdate (time) {

        this.forEachEntities((entity) => {
            if (entity.enabled) {
                entity.fixedUpdate(time);
                entity.components.forEach((component) => {
                    if (component.enabled) {
                        component.fixedUpdate(time);
                    }
                });
            }
        });

    }

    update (time) {

        this.forEachEntities((entity) => {
            if (entity.enabled) {
                entity.update(time);
                entity.components.forEach((component) => {
                    if (component.enabled) {
                        component.update(time);
                    }
                });
            }
        });

    }

    lateUpdate (time) {

        this.forEachEntities((entity) => {
            if (entity.enabled) {
                entity.lateUpdate(time);
                entity.components.forEach((component) => {
                    if (component.enabled) {
                        component.lateUpdate(time);
                    }
                });
            }
        });

        // note: this means different entities cannot depend on being able to see eachothers transform changes in the same frame,
        // will have to wait for next frame to see changes
        this.forEachEntities((entity) => {
            if (entity.enabled) {
                entity.transform.update(time);
            }
        });

    }
    
}

export default Scene;