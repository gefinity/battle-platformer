
export default function drawPath (time, context, resourceManager, vpMatrix, renderSource) {

    let path = renderSource.props.path;
    let screenVerts = [];

    if (!path || !path.length) {
        return;
    }

    let color = renderSource.props.color || "red";
    let lineWidth = renderSource.props.lineWidth || 1;

    path.forEach((vertex) => {

        let screenVert = vertex.clone().applyMatrix3(vpMatrix);
        screenVerts.push(screenVert);

    });

    context.save();

    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    
    context.moveTo(screenVerts[0].x, screenVerts[0].y);

    for (let i=1; i<screenVerts.length; i++) {

        context.lineTo(screenVerts[i].x, screenVerts[i].y);

    }

    context.stroke();

    context.restore();

}