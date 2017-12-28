import _            from "lodash";
import path         from "path";
import fileLoader   from "./fileLoader";

export default {

    load (url) {

        return new Promise((resolve) => {

            let resources = {};

            fileLoader.loadText(url).then((contents) => {

                contents = JSON.parse(contents);
                resources[url] = contents;
                
                // load sprite textures
                let textures = [];
                let sprites = _.isArray(contents) ? contents : [contents];
                sprites.forEach((sprite) => {
                    if (sprite.frames) {
                        textures = textures.concat(
                            _.map(sprite.frames, (frame) => {
                                return frame.texture;
                            })
                        ); 
                    } else if (sprite.fixed) {
                        textures.push(sprite.fixed.texture);
                    }
                });

                textures = _.uniq(textures.filter((texture) => {
                    return !! texture;
                }));

                textures = textures.map((texture) => {
                    return new Promise((resolve, reject) => {
                        let imagePath = path.join(path.dirname(url), texture);
                        fileLoader.loadImage(imagePath).then((loadedImage) => {
                            resources[texture] = loadedImage;
                            resolve();
                        });
                    });
                });

                Promise.all(textures).then(() => {
                    resolve(resources);
                });

            });

        });

    }

};