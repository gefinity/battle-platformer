import Vec2 from "lib/math/vec2";

export default function drawSprite (time, context, resourceManager, vpMatrix, renderSource) {

    let transform = renderSource.transform;
    let position = new Vec2().copy(transform.position);
    position.applyMatrix3(vpMatrix);
            
    let {sprite, lockRotation, loop, offsetPosition, scale, delayUntil} = renderSource.props;
    offsetPosition = offsetPosition || new Vec2(0, 0);
    
    if (delayUntil && time.time < delayUntil) {
        return;
    }

    let canvasScale = scale || transform.scale;

    let rotationEular = transform.rotation;
    if (lockRotation) {
        rotationEular = 0;
    }

    if (!sprite) {
        return;
    }

    let {frame, texture} = sprite.advance(time.deltaTime, loop);
    texture = resourceManager.get(texture);

    if (!texture) {
        return;
    }

    position.add(offsetPosition);

    // round draw coords to avoid sub-pixel
    position.x = position.x | 0;
    position.y = position.y | 0;

    context.save();

    context.translate(position.x, position.y);
    context.translate(-frame.w/2, -frame.h/2);
    context.translate(+frame.w/2, +frame.h/2);
    context.rotate(rotationEular);
    context.scale(canvasScale.x, canvasScale.y);
    context.translate(-frame.w/2, -frame.h/2);

    context.drawImage(
        texture,                       // image
        frame.x,                       // slice x
        frame.y,                       // slice y
        frame.w,                       // slice width
        frame.h,                       // slice height 
        0,                             // draw x
        0,                             // draw y
        frame.w,                       // draw width
        frame.h                        // draw height
    );

    context.restore();

}