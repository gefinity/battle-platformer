/**
        
    3x3 Matrix

    Storing elements in a 1 d array, mapping col first

        [0]    [3]    [6]
        [1]    [4]    [7]
        [2]    [5]    [8]

*/

import Vec2 from './vec2';

export default class Mat3 {

    static Identity = Object.freeze(new Mat3(
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ));

    static MultiplyMatrices (targetMat3, ...matricies) {

        if (!targetMat3) {
            throw new Error("targetMat3 required.");
        }

        if (matricies.length < 2) {
            throw new Error("multiplyMatrices expects >= 2 target matricies");
        }

        let re = targetMat3.elements;
        let ae = matricies[0].elements;
        let be;

        for (let i=1; i<matricies.length; i++) {

            be = matricies[i].elements;

            let a11 = ae[ 0 ],    a12 = ae[ 3 ],    a13 = ae[ 6 ];
            let a21 = ae[ 1 ],    a22 = ae[ 4 ],    a23 = ae[ 7 ];
            let a31 = ae[ 2 ],    a32 = ae[ 5 ],    a33 = ae[ 8 ];

            let b11 = be[ 0 ],    b12 = be[ 3 ],    b13 = be[ 6 ];
            let b21 = be[ 1 ],    b22 = be[ 4 ],    b23 = be[ 7 ];
            let b31 = be[ 2 ],    b32 = be[ 5 ],    b33 = be[ 8 ];

            // top row
            re[0] = a11*b11 + a12*b21 + a13*b31;    re[3] = a11*b12 + a12*b22 + a13*b32;    re[6] = a11*b13 + a12*b23 + a13*b33;

            // mid row
            re[1] = a21*b11 + a22*b21 + a23*b31;    re[4] = a21*b12 + a22*b22 + a23*b32;    re[7] = a21*b13 + a22*b23 + a23*b33;

            // last row
            re[2] = a31*b11 + a32*b21 + a33*b31;    re[5] = a31*b12 + a32*b22 + a33*b32;    re[8] = a31*b13 + a32*b23 + a33*b33;

            ae = re;

        }

        return targetMat3;

    }

    constructor (m11, m12, m13, m21, m22, m23, m31, m32, m33) {

        this.elements = new Float32Array([

            1, 0, 0,
            0, 1, 0,
            0, 0, 1

        ]);

        this.reset(m11, m12, m13, m21, m22, m23, m31, m32, m33);

    }

    reset (m11, m12, m13, m21, m22, m23, m31, m32, m33) {

        let el = this.elements;

        el[ 0 ] = (m11 || m11 === 0) ? m11 : 1;     el[ 3 ] = m12 || 0;                         el[ 6 ] = m13 || 0;
        el[ 1 ] = m21 || 0;                         el[ 4 ] = (m22 || m22 === 0) ? m22 : 1;     el[ 7 ] = m23 || 0;
        el[ 2 ] = m31 || 0;                         el[ 5 ] = m32 || 0;                         el[ 8 ] = (m33 || m33 === 0) ? m33 : 1;

        return this;

    }

    copy (mat3) {

        let el = mat3.elements;

        this.reset(

            el[ 0 ],    el[ 3 ],    el[ 6 ],
            el[ 1 ],    el[ 4 ],    el[ 7 ],
            el[ 2 ],    el[ 5 ],    el[ 8 ]

        );

        return this;

    }

    clone () {

        return new Mat3(...this.elements);

    }

    equals (mat3) {

        return !this.elements.some((element, index) => {
            return element !== mat3.elements[index];
        });

    }

    getPosition () {

        const outVec2 = new Vec2();

        let el = this.elements;
        outVec2.x = el[2];
        outVec2.y = el[5];

        return outVec2;

    }

    getRotation () {

        let el = this.elements;

        // z = atan2(r21, r11)

        return Math.atan2(el[1], el[0]);

    }

    getScale () {

        const outVec2 = new Vec2();

        let el = this.elements;
        outVec2.x = el[0];
        outVec2.y = el[4];

        return outVec2;

    }

    getDeterminant () {

        let el = this.elements;
        let m11 = el[ 0 ],    m12 = el[ 3 ],    m13 = el[ 6 ];
        let m21 = el[ 1 ],    m22 = el[ 4 ],    m23 = el[ 7 ];
        let m31 = el[ 2 ],    m32 = el[ 5 ],    m33 = el[ 8 ];

        return (m11 * (m22*m33 - m23*m32)) + (m12 * (m21*m33 - m23*m31)) + (m13 * (m21 * m32 - m22*m31));

    }

    getTranspose (outMat3) {

        outMat3 = outMat3 || new Mat3();

        let el = this.elements;
        let m11 = el[ 0 ],    m12 = el[ 3 ],    m13 = el[ 6 ];
        let m21 = el[ 1 ],    m22 = el[ 4 ],    m23 = el[ 7 ];
        let m31 = el[ 2 ],    m32 = el[ 5 ],    m33 = el[ 8 ];

        outMat3.reset(
            m11,    m21,    m31,
            m12,    m22,    m32,
            m13,    m23,    m33
        );

        return outMat3;

    }

    getInverse (outMat3) {

        outMat3 = outMat3 || new Mat3();

        let el = this.elements;
        let m11 = el[ 0 ],    m12 = el[ 3 ],    m13 = el[ 6 ];
        let m21 = el[ 1 ],    m22 = el[ 4 ],    m23 = el[ 7 ];
        let m31 = el[ 2 ],    m32 = el[ 5 ],    m33 = el[ 8 ];

        /*
            method based on:
            https://www.mathsisfun.com/algebra/matrix-inverse-minors-cofactors-adjugate.html

            1) 'matrix of minors'
            m22*m33 - m23*m32;    m21*m33 - m23*m31;    m21*m32 - m22*m31;
            m12*m33 - m13*m32;    m11*m33 - m13*m31;    m11*m32 - m12*m31;
            m12*m23 - m13*m22;    m11*m23 - m13*m21;    m11*m22 - m12*m21;
    
            2) 'Matrix of Cofactors'
            apply
            +   -   +
            -   +   -
            +   -   +

            3) 

        */

        let determinant = this.getDeterminant();

        if ( determinant === 0 ) {

            // no inverse
            outMat3.makeIdentity();
            return outMat3;

        }

        // steps 1) and 2) at once
        outMat3.reset(
            m22*m33 - m23*m32,       -(m21*m33 - m23*m31),    m21*m32 - m22*m31,
            -(m12*m33 - m13*m32),    m11*m33 - m13*m31,       -(m11*m32 - m12*m31),
            m12*m23 - m13*m22,       -(m11*m23 - m13*m21),    m11*m22 - m12*m21
        );

        /*
        
            3) 'Adjugate (also called Adjoint)'
            = transpose

        */

        outMat3.makeTranspose();

        /*
        
            4) 'Multiply by 1/Determinant'

        */
        outMat3.multiplyScalar( 1.0 / determinant );

        return outMat3;

    }

    makeIdentity () {

        this.reset(
            
            1, 0, 0,
            0, 1, 0,
            0, 0, 1

        );

        return this;

    }

    makeInverse () {

        return this.getInverse(this);

    }

    makeTranspose () {

        return this.getTranspose(this);

    }

    setPosition (vec2) {

        let {x, y} = vec2;
        let el = this.elements;

        /*
            1,  0,  0,
            0,  1,  0,
            x , y,  1
        */
        el[2] = x;
        el[5] = y;

        return this;

    }

    makeTranslation (vec2) {

        let {x, y} = vec2;

        this.reset(

            1, 0, 0,
            0, 1, 0,
            x, y, 1

        );

        return this;

    }

    // z rotation matrix is the type of rotation one expects in 2d
    makeRotation (angleRadians) {

        let c = Math.cos(angleRadians);
        let s = Math.sin(angleRadians);

        this.reset(

            c,  -s,  0,
            s,   c,  0,
            0,   0,  1

        );

        return this;

    }

    makeScale (scaleVec2) {

        let {x, y} = scaleVec2;

        this.reset(

            x, 0, 0,
            0, y, 0,
            0, 0, 1

        );

        return this;
    }

    multiplyScalar ( s ) {

        let el = this.elements;

        el[ 0 ] *= s;   el[ 3 ] *= s;   el[ 6 ] *= s;
        el[ 1 ] *= s;   el[ 4 ] *= s;   el[ 7 ] *= s;
        el[ 2 ] *= s;   el[ 5 ] *= s;   el[ 8 ] *= s;

        return this;

    }

    multiply (mat3) {

        return Mat3.MultiplyMatrices(this, this, mat3);

    }

}