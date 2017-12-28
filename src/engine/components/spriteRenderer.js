import _                from 'lodash';
import invariant        from 'invariant';
import Component        from 'component';
import Sprite           from 'lib/sprite';
import rendererTypes    from 'rendererTypes';
import spriteLoader     from 'systems/resources/loaders/spriteLoader';

class SpriteRenderer extends Component {

    getDefaultProps () {
        return {
            fps: 30,
            lockRotation: false,
            loop: true,
            spriteConfigs: [],
            spriteConfigsJsonPath: null,
            spriteName: 'default',
            noInterrupt: false,
            delayUntil: 0,
        };
    }

    init () {

        invariant(this.props.spriteConfigs || this.props.spriteConfigsJsonPath, 'either spriteConfigs or spriteConfigsJsonPath prop required');

        // - register sprite path with resources service
        if (this.props.spriteConfigsJsonPath) {
            this.systems.resources.register(this.props.spriteConfigsJsonPath, spriteLoader.load);
        }

    }

    start () {

        this.sprites = {};

        let spriteConfigs = this.props.spriteConfigs;
        
        if (this.props.spriteConfigsJsonPath) {
            spriteConfigs = this.systems.resources.get(this.props.spriteConfigsJsonPath);
        }

        if (!spriteConfigs || !spriteConfigs.length) {
            throw new Error('no spriteConfigs');
        }

        spriteConfigs = _.isArray(spriteConfigs) ? spriteConfigs : [spriteConfigs];

        spriteConfigs.forEach((spriteConfig) => {

            if (spriteConfigs.length > 1 && !spriteConfig.name) {
                console.warn('sprite in sprite array without name');
                return;
            }

            if (spriteConfig.fixed) {
                this.sprites[spriteConfig.name] = new Sprite({
                    fps: this.props.fps,
                }).setFromFixed(spriteConfig);
            } else {
                this.sprites[spriteConfig.name] = new Sprite(Object.assign({}, spriteConfig, {
                    fps: this.props.fps,
                }));
            }

        });

        this.renderSource = this.systems.renderer.addSource(rendererTypes.SPRITE, this.transform, {
            lockRotation: this.props.lockRotation,
            sprite: this.sprites[this.props.spriteName],
            loop: this.props.loop,
            scale: this.props.scale,
            offsetPosition: this.props.offsetPosition,
            noInterrupt: this.props.noInterrupt,
            delayUntil: this.props.delayUntil,
        });

    }

    // TODO
    // props param here is only for the renderSource, not the sprite objects
    setSprite (spriteName, props = {}) {

        if (!this.sprites[spriteName]) {
            console.error('unknown spriteName ', spriteName);
            return;
        }

        if (this.sprites[this.props.spriteName].props.noInterrupt) {
            if (!this.sprites[this.props.spriteName].isFinished()) {
                return;
            }
        }

        this.props.spriteName = spriteName;
        this.renderSource.props.sprite = this.sprites[this.props.spriteName];

        _.merge(this.renderSource.props, props);

    }

    reset () {

        this.sprites[this.props.spriteName].reset();

    }

    destroy () {

        this.systems.renderer.removeSource(this.renderSource);

    }

}

export default SpriteRenderer;