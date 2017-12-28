
// TODO support transform scale

export default function drawTileMap (time, context, resourceManager, vpMatrix, renderSource) {

    let transform = renderSource.transform;
    let grid = renderSource.props.grid;
    let tilesets = renderSource.props.tilesets;

    // TODO
    // only draw the tiles which are visible
    grid.loop((x, y, value) => {

        let cellPosition = grid.getPosition(x, y);
        // TODO as an optimisation, don't project every single cell position,
        // aught to be able to calc 1 only
        cellPosition.applyMatrix3(transform.matrixWorld);
        cellPosition.applyMatrix3(vpMatrix);

        // cellPosition is the center point of each cell, but draw calls want to draw from top left
        // TODO not rounding these causes artifacts between some tiles? 
        // and I think performance strain but not recently tested
        // BUT it makes scrolling look jittery
        let drawX = (cellPosition.x - grid.halfCellWidth);
        let drawY = (cellPosition.y - grid.halfCellHeight);

        let layers = grid.getKey(x, y, 'layers');

        if (grid.get(x, y).norender) {
            return;
        }

        for (let i=0; i<layers.length; i++) {

            let layer = layers[i];

            if (layer.gid !== 0) { // gid === 0 is blank in this layer

                let tileset = tilesets[layer.tileset];
                let texture = resourceManager.get(tileset.src);
                let gid = tileset.firstgid !== 1 ? layer.gid - tileset.firstgid + 1 : layer.gid;
                let tileY = Math.ceil(gid / (tileset.width / tileset.tilewidth))-1;
                let tileX = gid - ((tileset.width / tileset.tilewidth) * tileY)-1;
                
                // round draw coords to avoid sub-pixel
                drawX = drawX | 0;
                drawY = drawY | 0;

                // FIXME should bail out and disable this renderer somehow and warn in the log but allow game to run
                if (!texture) {
                    return;
                }

                context.drawImage(
                    texture,                            // image
                    tileX * tileset.tilewidth,          // slice x
                    tileY * tileset.tileheight,         // slice y
                    tileset.tilewidth,                  // slice width
                    tileset.tileheight,                 // slice height
                    drawX,                              // draw x
                    drawY,                              // draw y
                    tileset.tilewidth,                  // draw width
                    tileset.tileheight                  // draw height
                );

            }

        }

    });

}