import Renderer             from 'renderer';
import $                    from 'jquery';
import rendererTypes        from 'rendererTypes';
import Camera2d             from 'lib/camera2';
import Vec2                 from 'lib/math/vec2';
import drawTileMap          from './drawTileMap';
import drawSprite           from './drawSprite';
import drawGrid             from './drawGrid';
import drawRect             from './drawRect';
import drawPath             from './drawPath';
import drawCircle           from './drawCircle';
import drawImage            from './drawImage';
import Debugger             from './debugger';

export default class CanvasRenderer extends Renderer {

    constructor (props = {}) {

        super();

        this.parentElement = props.parentElement ? $(props.parentElement) : void(0);
        this.aspect = props.aspect || 0.75;
        this.maxWidth = props.maxWidth || (props.parentElement ? props.parentElement.width() : $(window).width());
        this.wireframe = false;
        this.clearColor = props.clearColor || '#000';
        this.resources = props.resources;

        this.renderers[rendererTypes.GRID] = drawGrid;
        this.renderers[rendererTypes.PATH] = drawPath;
        this.renderers[rendererTypes.RECT] = drawRect;
        this.renderers[rendererTypes.SPRITE] = drawSprite;
        this.renderers[rendererTypes.TILE_MAP] = drawTileMap;
        this.renderers[rendererTypes.CIRCLE] = drawCircle;
        this.renderers[rendererTypes.IMAGE] = drawImage;

        this.init();

    }

    resize () {

        this.width = Math.min(Math.min($(window).width(), $(window).height()) * 1 / this.aspect, this.maxWidth);
        this.height = this.width * this.aspect;
        this.parentElement.width(this.width);
        this.parentElement.height(this.height);

        if (this.camera) {
            this.camera.setSize(this.width, this.height);
        }

    }

    init () {

        // setup underlying element
        if (!this.parentElement) {
            this.parentElement = $(document.createElement('div')).attr('id', 'canvasRenderer');
            $('body').append(this.parentElement);
        } else {
            this.parentElement.empty();
        }

        this.parentElement.css({
            position: 'absolute',
            top: 0,
            left: 0,
            'background-color': this.clearColor,
            cursor: 'pointer',
        });

        this.resize();

        // create camera:
        this.camera = new Camera2d(this.width, this.height, new Vec2(0, 0));

        // screenBuffer is the on-screen canvas for drawing
        this.screenBuffer = document.createElement('canvas');
        this.screenBuffer.width = this.width;
        this.screenBuffer.height = this.height;
        $(this.screenBuffer).appendTo(this.parentElement);
        this.screenBufferContext = this.screenBuffer.getContext('2d');
        this.screenBufferContext.imageSmoothingEnabled = false;

        // handle window resize:
        $(window).on('resize.canvasRenderer', function () {
            this.resize();
            this.screenBuffer.width = this.width;
            this.screenBuffer.height = this.height;
        }.bind(this));

        this.debugger = new Debugger(this.screenBuffer);

    }

    afterSceneUpdate (time) {

        if (!this.resources) {
            throw new Error('missing resourceManager');
        }

        this.screenBufferContext.clearRect(0, 0, this.screenBuffer.width, this.screenBuffer.height);

        // render sources:
        // TODO scene may have something to say about visibility if it implements quadtrees or something
        
        this.sources.forEach((renderSource) => {

            const renderer = this.renderers[renderSource.rendererType];

            if (renderer) {

                renderer.call(null, time, this.screenBufferContext, this.resources, this.camera.worldToScreen, renderSource);

            }

        });

        this.singleFrameSources.forEach((renderSource) => {

            const renderer = this.renderers[renderSource.rendererType];

            if (renderer) {

                renderer.call(null, time, this.screenBufferContext, this.resources, this.camera.worldToScreen, renderSource);

            }

        });

        this.singleFrameSources = [];        

        this.debugger.update(time);

    }

}
