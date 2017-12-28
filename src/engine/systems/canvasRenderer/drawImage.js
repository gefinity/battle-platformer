import Vec2 from "lib/math/vec2";

export default function drawImage (time, context, resourceManager, vpMatrix, renderSource) {

    let transform = renderSource.transform;
    let position = new Vec2().copy(transform.position);
    position.applyMatrix3(vpMatrix);
            
    let {image, lockRotation, offsetPosition, scale} = renderSource.props;
    offsetPosition = offsetPosition || new Vec2(0, 0);
    
    let canvasScale = scale || transform.scale;

    let rotationEular = transform.rotation;
    if (lockRotation) {
        rotationEular = 0;
    }

    if (!image) {
        return;
    }

    let width = image.width;
    let height = image.height;

    position.add(offsetPosition);

    // round draw coords to avoid sub-pixel
    position.x = position.x | 0;
    position.y = position.y | 0;

    context.save();

    context.translate(position.x, position.y);
    context.translate(-width/2, -height/2);
    context.translate(+width/2, +height/2);
    context.rotate(rotationEular);
    context.scale(canvasScale.x, canvasScale.y);
    context.translate(-width/2, -height/2);

    context.drawImage(
        image,                   // image
        0,                       // slice x
        0,                       // slice y
        width,                   // slice width
        height,                  // slice height 
        0,                       // draw x
        0,                       // draw y
        width,                   // draw width
        height                   // draw height
    );

    context.restore();

}