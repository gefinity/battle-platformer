import $        from 'jquery';
import _        from 'lodash';
import Grid     from 'lib/squareGrid';
import Vec2     from 'lib/math/vec2';
import Mat3     from 'lib/math/mat3';

/**
parse .tmx map file from Tiled editor
http://www.mapeditor.org/

Only works when map options have been set to export layers as XML
*/
export default function loader (text) {

    return new Promise((resolve, reject) => {

        let linkedResources = [];
        let gameObjectConfigs = [];
        let gameObjects = [];
        let tileMap;
        let tilesets = {};

        let doc = $($.parseXML(text));
        let map = doc.children("map:first");

        let bgColor = map.attr("backgroundcolor");

        tileMap = new Grid({
            width: parseInt(map.attr("width"),10),
            height: parseInt(map.attr("height"),10),
            cellWidth: parseInt(map.attr("tilewidth"),10),
            cellHeight: parseInt(map.attr("tileheight"),10),
        });

        // parse tilesets:

        map.children("tileset").each(function (index, tileset) {

            tileset = $(tileset);

            let tilesetImage = tileset.children("image:first");

            if (!tilesetImage.length) {
                console.warn("skipping tileset without image");
                return; // continue
            }

            let newTileset = {
                firstgid: parseInt(tileset.attr("firstgid"),10),
                name: tileset.attr("name"),
                tilewidth: parseInt(tileset.attr("tilewidth"),10),
                tileheight: parseInt(tileset.attr("tileheight"),10),
            };
            
            newTileset.src = tilesetImage.attr("source");
            newTileset.width = parseInt(tilesetImage.attr("width"),10);
            newTileset.height = parseInt(tilesetImage.attr("height"),10);
            newTileset.widthTiles = newTileset.width/newTileset.tilewidth;
            newTileset.heightTiles = newTileset.height/newTileset.tileheight;
            newTileset.transparentColor = tileset.attr("trans");
            
            // load tileset image:
            linkedResources.push(newTileset.src);

            // tileset tile properties and collision geometry:
            newTileset.tileProperties = {};
            //newTileset.tileCollisionGeometry = {};
            tileset.children("tile").each(function (index, tile) {

                tile = $(tile);

                let id = newTileset.firstgid + parseInt(tile.attr("id"), 10);

                newTileset.tileProperties[id] = [];
                tile.find("property").each(function (index, property) {
                    property = $(property);
                    let key = property.attr("name");
                    let value = property.attr("value");
                    newTileset.tileProperties[id][key] = value;
                });

            });

            tilesets[newTileset.name] = newTileset;

        });

        // parse tile layers:

        let layers = {};
        map.children("layer").each( function (index, layer) {

            layer = $(layer);
            let layerData = layer.children("data:first");

            if (!layerData.length) {
                console.warn("skipping layer without data");
                return; // continue
            }

            if (layerData.attr("encoding") || layerData.attr("compression")) {
                throw new Error("parseTmxXml method does not support encoding or compression on layer data.");
            }

            if (layer.attr("visible") === "0") {
                return; // continue
            }

            let newLayer = {
                name: layer.attr("name"),
                width: parseInt(layer.attr("width"),10),
                height: parseInt(layer.attr("height"),10)
            };

            // layer tiles

            let orderedTilesets = _(tilesets).sortBy(function (tileset) {
                return -tileset.firstgid;
            }).valueOf();

            newLayer.tiles = [];
            layerData.children("tile").each( function (index, tile) {

                tile = $(tile);

                let newTile = {
                    gid: parseInt(tile.attr("gid"),10)
                };

                // find which tileset this tile falls into

                if (newTile.gid !== 0) {

                    let tileset = _(orderedTilesets).find(function (tileset) {
                        return newTile.gid >= tileset.firstgid;
                    }).valueOf();

                    if (tileset) {
                        newTile.tileset = tileset.name;
                    } else {
                        console.warn("skipping tile. Couldn't match a tileset to gid: ", newTile.gid);
                        return; // continue
                    }

                }

                newLayer.tiles.push(newTile);

            });

            layers[newLayer.name] = newLayer;

        });

        // set layers data into the tileSet grid:

        tileMap.loop((x, y) => {

            let tileLayers = [];
            let tileProps = {};

            Object.keys(layers).forEach((key) => {

                let layer = layers[key];
                let gidIndex = x + (y * tileMap.width);
                let tile = layer.tiles[gidIndex];
                let tileset = tilesets[tile.tileset];

                if (tileset && tileset.tileProperties[tile.gid]) {
                    _.extend(tileProps, tileset.tileProperties[tile.gid]);
                }

                tileLayers.push(tile);
                
            });

            tileMap.setKey(x, y, "layers", tileLayers);
            tileMap.merge(x, y, tileProps);

        });
        
        // GameObject's in object layers:
        map.children("objectgroup").each(function (index, objectgroup) {

            objectgroup = $(objectgroup);

            let visible = objectgroup.attr("visible");

            if (visible && !parseInt(visible, 10)) {
                return; // continue
            }

            objectgroup.children("object").each(function (index, object) {

                object = $(object);
                let type = object.attr("type");
                let x = parseFloat(object.attr("x"));
                let y = parseFloat(object.attr("y"));
                let w = parseFloat(object.attr("width"));
                let h = parseFloat(object.attr("height"));
                let visible = object.attr("visible");

                if (visible && !parseInt(visible, 10)) {
                    return; // continue
                }

                if (!type) {
                    console.warn("tmxLoader parsed object without type, ignoring. ");
                    return; // continue
                }

                // extract properties:
                let properties = {};
                object.find("property").each(function (index, property) {
                    property = $(property);
                    properties[property.attr("name")] = property.attr("value");
                });

                _.extend(properties, {
                    type: type,
                    width: w || 0,
                    height: h || 0,
                    x: x || 0,
                    y: y || 0
                });

                // in tiled, x, y is always top left
                // convert to center 

                if (properties.width) {
                    properties.x += properties.width/2;
                }
                if (properties.height) {
                    properties.y += properties.height/2;
                }
                
                gameObjectConfigs.push(properties);

            }.bind(this));

        }.bind(this));

        gameObjects = gameObjectConfigs.map((gameObjectConfig) => {

            // TODO couldn't get this require working... path is not what I expect because
            // im requiring from this module
            //let classImpl = require('./' + gameObjectConfig.type).default;

            // need to transform position:
            // x,y from config is relative to top left origin in tilemap space
            let position = new Vec2(gameObjectConfig.x, gameObjectConfig.y);

            let flipY = new Mat3().reset(
                1,   0,  0,
                0,  -1,  0,
                0,   0,  1
            );
            position.sub(new Vec2(tileMap.size.x/2, tileMap.size.y/2)).applyMatrix3(flipY);
            
            let gameObject = {
                //gameObject: classImpl,
                type: gameObjectConfig.type,
                transform: {
                    position: {
                        x: position.x,
                        y: position.y,
                    },
                },
                props: _.omit(gameObjectConfig, 'type', 'id', 'tags', 'x', 'y'),
                id: gameObjectConfig.id,
                tags: gameObjectConfig.tags ? gameObjectConfig.tags.split(',') : [],
            };

            return gameObject;

        });

        // TODO check for and filter out duplicate id's and warn
        
        resolve({
            tileMap: tileMap,
            tilesets: tilesets,
            gameObjectConfigs: gameObjectConfigs,
            gameObjects: gameObjects,
            linkedResources: linkedResources,
            bgColor: bgColor,
        });

    });

}
