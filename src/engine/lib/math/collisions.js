import Vec2     from './vec2';
import Contact  from './contact';

export default {

    aabbVsAabb (aAabb, bAabb) {

        if (!aAabb.isIntersectionBox(bAabb)) {
            return new Contact();
        }

        let intersection = aAabb.clone().intersect(bAabb);
        let intersectionSize = intersection.size();
        let collisionNormal = new Vec2();
        let distance;
        let dir = aAabb.center().clone().sub(bAabb.center());
        if (Math.abs(intersectionSize.x) > Math.abs(intersectionSize.y)) {
            collisionNormal.reset(0, 1 * Math.sign(dir.y));
            distance = -intersectionSize.y;
        } else {
            collisionNormal.reset(1 * Math.sign(dir.x), 0);
            distance = -intersectionSize.x;
        }
        
        let contact = new Contact(collisionNormal, distance, intersection.center());

        return contact;

    },


    circleVsAabb (circle, aabb) {

        // project circle onto AABB
        let ab = circle.position.clone().sub(aabb.center());

        let clamped = ab.clamp(aabb.getHalfSize().negate(), aabb.getHalfSize());

        // form point on AABB
        let p = clamped.clone().add(aabb.center());

        // get distance to circle
        let d = circle.position.clone().sub(p).length() - circle.radius;

        return new Contact(ab.clone().normalize(), d, p);

    },

    aabbVsCircle (aabb, circle) {

        let contact = this.circleVsAabb(circle, aabb);
        contact.normal.negate();
        return contact;

    },

    // https://github.com/mrdoob/three.js/blob/dev/src/math/Ray.js
    // https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-box-intersection
    rayVsAabb (ray, aabb) {

        let tmin, tmax, tymin, tymax;

        let invdirx = 1 / ray.direction.x;
        let invdiry = 1 / ray.direction.y;

        let origin = ray.origin;

        if ( invdirx >= 0 ) {

            tmin = ( aabb.min.x - origin.x ) * invdirx;
            tmax = ( aabb.max.x - origin.x ) * invdirx;

        } else {

            tmin = ( aabb.max.x - origin.x ) * invdirx;
            tmax = ( aabb.min.x - origin.x ) * invdirx;

        }

        if ( invdiry >= 0 ) {

            tymin = ( aabb.min.y - origin.y ) * invdiry;
            tymax = ( aabb.max.y - origin.y ) * invdiry;

        } else {

            tymin = ( aabb.max.y - origin.y ) * invdiry;
            tymax = ( aabb.min.y - origin.y ) * invdiry;

        }

        if ( ( tmin > tymax ) || ( tymin > tmax ) ) return false;

        // These lines also handle the case where tmin or tmax is NaN
        // (result of 0 * Infinity). x !== x returns true if x is NaN
 
        if ( tymin > tmin || tmin !== tmin ) tmin = tymin;

        if ( tymax < tmax || tmax !== tmax ) tmax = tymax;

        if ( tmax < 0 ) return false;


        let intersectionPoint;
        if (tmin >= 0) {
            //intersectionPoint = ray.at( tmin >= 0 ? tmin : tmax );
            intersectionPoint = ray.at(tmin);
        } else {
            
            // TODO when ray origin is inside collider
            // original code returned tmax here...
            // but for my purposes I wanted to return the point behind the ray, 
            // because these cases were corner cases when the ray was allowed to penetrate 
            // a collider and shouldn't have. tmax picks up the opposite inside edge ahead of the ray
            
            //intersectionPoint = ray.at(tmax);
            intersectionPoint = ray.at(tmin);
        }

        const distance = Vec2.Distance(intersectionPoint, origin);

        return new Contact(ray.direction.clone().negate(), distance, intersectionPoint);

    },

    // https://github.com/mrdoob/three.js/blob/dev/src/math/Ray.js
    rayVsCircle (ray, circle) {

        let v1 = new Vec2();

        Vec2.SubVectors(v1, circle.position, ray.origin);

        var tca = v1.dot( ray.direction );
        var d2 = v1.dot( v1 ) - tca * tca;
        var radius2 = circle.radius * circle.radius;

        if ( d2 > radius2 ) return false;

        var thc = Math.sqrt( radius2 - d2 );

        // t0 = first intersect point - entrance on front of sphere
        var t0 = tca - thc;

        // t1 = second intersect point - exit point on back of sphere
        var t1 = tca + thc;

        // test to see if both t0 and t1 are behind the ray - if so, return null
        if ( t0 < 0 && t1 < 0 ) return false;

        let intersectionPoint;
        // test to see if t0 is behind the ray:
        // if it is, the ray is inside the sphere, so return the second exit point scaled by t1,
        // in order to always return an intersect point that is in front of the ray.
        if ( t0 < 0 ) {
            intersectionPoint = ray.at( t1 );
        } else {
            // else t0 is in front of the ray, so return the first collision point scaled by t0
            intersectionPoint = ray.at( t0 );
        }

        let distance = Vec2.Distance(intersectionPoint, ray.origin);

        return new Contact(ray.direction.clone().negate(), distance, intersectionPoint);

    },

};

