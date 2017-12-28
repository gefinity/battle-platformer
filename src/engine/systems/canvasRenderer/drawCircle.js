import Vec2 from "lib/math/vec2";

export default function drawRect (time, context, resourceManager, vpMatrix, renderSource) {

    let transform = renderSource.transform;
    let r = renderSource.props.radius;
    let offsetPosition = renderSource.props.offsetPosition || new Vec2();
    let fillColor = renderSource.props.color || "#fff";
    let wireframe = renderSource.props.wireframe || false;
    let scale = transform.scale;
    let position = new Vec2().copy(transform.position);
    position.add(offsetPosition);
    position.applyMatrix3(vpMatrix);

    context.save();

    context.beginPath();
    // note: only uses x scalar,
    // don't see why I'd ever want to warp the circle
    context.arc(position.x | 0, position.y | 0, r*scale.x, 0, Math.PI*2, true);

    if (wireframe) {
        context.strokeStyle = fillColor;
        context.stroke();
    } else {
        context.fillStyle = fillColor;
        context.fill();
    }

    context.restore();

}