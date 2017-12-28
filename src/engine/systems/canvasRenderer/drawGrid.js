
function drawRect (ctx, x, y, w, h, color, wireframe = false) {

    ctx.save();

    ctx.lineWidth = 1;
    if (!wireframe) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    } else {
        ctx.strokeStyle = color;
        ctx.strokeRect(x, y, w, h);
    }

    ctx.restore();

}

export default function drawGrid (time, context, resourceManager, vpMatrix, renderSource) {

    let transform = renderSource.transform;
    let grid = renderSource.props.grid;
    let position = transform.position;

    grid.loop((x, y, value) => {

        let cellPosition = grid.getPosition(x, y);

        // TODO as an optimisation, don't project every single cell position,
        // aught to be able to calc 1 only
        cellPosition.applyMatrix3(transform.matrixWorld);
        cellPosition.applyMatrix3(vpMatrix);

        // cellPosition is the center point of each cell, but draw calls want to draw from top left
        let drawX = (cellPosition.x - grid.halfCellWidth);
        let drawY = (cellPosition.y - grid.halfCellHeight);

        if (value.impassable) {
            drawRect(context, drawX, drawY, grid.cellWidth, grid.cellHeight, "#23e52c");
        } else {
            drawRect(context, drawX, drawY, grid.cellWidth, grid.cellHeight, "#23e52c", true);
        }

        // draw tile coords
        let worldPosition1 = grid.getPosition(x, y);
        let cellCoords = grid.getCellCoords(worldPosition1.x, worldPosition1.y);
        let positionString = cellCoords.x + "," + cellCoords.y;
        context.fillStyle = "white";
        context.font = "10px serif";
        context.fillText(positionString, cellPosition.x, cellPosition.y);

    });

}
