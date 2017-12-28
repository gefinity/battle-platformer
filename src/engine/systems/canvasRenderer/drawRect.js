import Vec2 from 'lib/math/vec2';

export default function drawRect (time, context, resourceManager, vpMatrix, renderSource) {

    let transform = renderSource.transform;
    let w = renderSource.props.width;
    let h = renderSource.props.height;
    let offsetPosition = renderSource.props.offsetPosition || new Vec2();
    let fillColor = renderSource.props.color || '#fff';
    let wireframe = renderSource.props.wireframe || false;
    let lockRotation = renderSource.props.lockRotation;

    let vertices = [
        new Vec2(- w/2, + h/2),
        new Vec2(+ w/2, + h/2),
        new Vec2(+ w/2, - h/2),
        new Vec2(- w/2, - h/2),
    ].map((vertex) => {
        if (!lockRotation) {
            vertex.applyMatrix3(transform.matrixWorld);
        } else {
            vertex.applyMatrix3(transform.scaleMatrix);
            vertex.applyMatrix3(transform.translationMatrix);
        }
        if (offsetPosition) {
            vertex.add(offsetPosition);
        }
        return vertex.applyMatrix3(vpMatrix);
    });


    context.save();

    context.lineWidth = 1;

    context.beginPath();

    context.moveTo(vertices[0].x >> 0, vertices[0].y >> 0);

    for (let i = 1; i < vertices.length; i++) {
        context.lineTo(vertices[i].x >> 0, vertices[i].y >> 0);
    }

    context.lineTo(vertices[0].x, vertices[0].y);

    if (wireframe) {
        context.strokeStyle = fillColor;
        context.stroke();
    } else {
        context.fillStyle = fillColor;
        context.fill();
    }

    context.restore();

}