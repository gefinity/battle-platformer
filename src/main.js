import engine, {
    CanvasRenderer,
    fileLoader,
    tmxLoader,
    ResourceManager,
    Input,
    spriteLoader,
} from 'engine';
import path         from 'path';
import Game         from './game';
import GridWorld    from './gridWorld';
import url          from 'url';

function init (level) {

    console.log('tmx loaded: ', level);

    let worldGrid = level.tileMap;
    let worldWidth = worldGrid.width;
    let worldHeight = worldGrid.height;
    let cellWidth = worldGrid.cellWidth;
    let cellHeight = worldGrid.cellHeight;
    let bgColor = level.bgColor;

    let resourceManager = new ResourceManager();
    resourceManager.add(level.resources);

    let renderContainer = document.createElement('div');
    document.body.appendChild(renderContainer);

    let renderer = new CanvasRenderer({
        resources: resourceManager,
        containerElement: renderContainer,
        maxWidth: 1080,
        aspect: 9/16,
        clearColor: bgColor,
    });

    let inputManager = new Input(renderContainer);

    engine.timeSettings.updateInterval = 1000/60;

    const tmxEntities = level.gameObjects.map((entityConfig) => {
        entityConfig.entityClass = require('./' + entityConfig.type).default;
        return entityConfig;
    });

    const entities = tmxEntities.concat([
        {
            entityClass: Game,
        },
        {
            entityClass: GridWorld,
            transform: {
                position: {
                    x: 0,
                    y: 0,
                },
            },
            props: {
                grid: worldGrid,
                tilesets: level.tilesets,
            },
            id: 'World',
        },
    ]);

    engine.events.on('restartGame', () => {

        console.log('restarting ...');

        engine.clearScene();
        engine.importEntities(entities);

    });

    engine.importEntities(entities);

    engine.setSystem('resources', resourceManager);
    engine.setSystem('renderer', renderer);
    engine.setSystem('input', inputManager);
    engine.init();
    engine.showStats();

    resourceManager.register('sprites/portal/portal.json', spriteLoader.load);
    resourceManager.register('sprites/zombie/zombie1.json', spriteLoader.load);
    resourceManager.register('sprites/fx.json', spriteLoader.load);
    resourceManager.register('axe.png', fileLoader.loadImage);

    resourceManager.loading.then(() => {
        
        console.log('starting ...');
        engine.start();
        //engine.advance(1000/60);

    });

}

//fileLoader.loadText('arena01.tmx').then((tmx) => {
fileLoader.loadText('arena001.tmx').then((tmx) => {

    tmxLoader(tmx).then((level) => {

        let promises = [];
        level.resources = {};

        // load linked resources and cache:
        level.linkedResources.forEach((resource, index) => {
            let resourcePath = resource;
            let promise = new Promise((resolve, reject) => {
                fileLoader.loadImage(resourcePath).then((file) => {
                    level.resources[resource] = file;
                    resolve();
                });
            });
            promises.push(promise);
        });

        Promise.all(promises).then(() => {

            let parsedUrl = url.parse(window.location.href, true);
            if (typeof parsedUrl.query.debug !== 'undefined') {
                engine.debug = true;
            }

            // start game:
            init(level);

        });

    });

});