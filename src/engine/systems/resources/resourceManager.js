import _                from 'lodash';
import SystemLifecycle  from '../../systemLifecycle';

class Resources extends SystemLifecycle {

    constructor (initialResources = {}) {

        super();
        this._resourceCache = Object.assign({}, initialResources);
        this._pending = [];

    }

    get isLoading () {

        return !!this._pending.length;

    }

    get loading () {

        return Promise.all(this._pending);

    }

    resolveKey (resourceKey) {

        //return path.resolve(resourceKey);
        return resourceKey;

    }

    register (path, loader) {

        // TODO atm resources are cached by the key they are used by ... so all register/get calls must agree
        // really I should be resolving and matching filenames so it can figure out which resource you want

        let resourceKey = this.resolveKey(path);

        let cached = this.get(resourceKey);

        if (cached) {
            return cached;
        }

        let promise = new Promise((resolve, reject) => {
            Promise.all([loader(resourceKey)]).then((promises) => {
                let [resources] = promises;

                if (_.isPlainObject(resources)) {
                    Object.keys(resources).forEach((resourceKey) => {
                        this._resourceCache[resourceKey] = resources[resourceKey];
                    });
                } else {
                    this._resourceCache[resourceKey] = resources;
                }
                resolve();
                // for isLoading to work I need to cut it out as well
                this._pending.splice(this._pending.indexOf(promise), 1);
            });
        });
        this._pending.push(promise);

        return promise;

    }

    add (resources) {

        Object.assign(this._resourceCache, resources);

    }

    get (key) {

        key = this.resolveKey(key);
        return this._resourceCache[key];

    }

}

export default Resources;