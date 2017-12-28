// reference for browser behavior here and key codes:
// http://unixpapa.com/js/key.html

import SystemLifecycle      from '../systemLifecycle';
import Vec2                 from 'lib/math/vec2';

const state = {
    NONE: 0,
    UP: 1,
    DOWN: 2,
};

const keys = {
    LEFT    : 37,
    UP      : 38,
    RIGHT   : 39,
    DOWN    : 40,
    ENTER   : 13,
    SPACE   : 32,
    SHIFT   : 16,
    CTRL    : 17,
    ALT     : 18,
    ESC     : 27,
    HOME    : 36,
    END     : 35,
    DEL     : 46,
    INS     : 45,
    PGUP    : 33,
    PGDN    : 34,
    SLASH   : 111,
    MINUS   : 109,
    PLUS    : 107,
    COMMA   : 188,
    PERIOD  : 190,
    TILDE   : 192,
    1       : 49,
    2       : 50,
    3       : 51,
    4       : 52,
    5       : 53,
    6       : 54,
    7       : 55,
    8       : 56,
    9       : 57,
    0       : 58,
    A       : 65,
    B       : 66,
    C       : 67,
    D       : 68,
    E       : 69,
    F       : 70,
    G       : 71,
    H       : 72,
    I       : 73,
    J       : 74,
    K       : 75,
    L       : 76,
    M       : 77,
    N       : 78,
    O       : 79,
    P       : 80,
    Q       : 81,
    R       : 82,
    S       : 83,
    T       : 84,
    U       : 85,
    V       : 86,
    W       : 87,
    X       : 88,
    Y       : 89,
    Z       : 90,
    F1      : 112,
    F2      : 113,
    F3      : 114,
    F4      : 115,
    F5      : 116,
    F6      : 117,
    F7      : 118,
    F8      : 119,
    F9      : 120,
    F10     : 121,
    F11     : 122,
    F12     : 123,
};

const mouseButtons = {
    LMB: 1,
    MMB: 2,
    RMB: 3 
};

function zeroState () {
    let newState = {};
    let states = Object.keys(state);
    for (let i=0; i<states.length; i++) {
        newState[state[states[i]]] = {
            captureTime: 0,
            frameTime: 0,
        };
    }
    return newState;
}

class Input extends SystemLifecycle {

    static get Keys () {

        return keys;

    }

    static get Mouse () {

        return mouseButtons;

    }

    constructor (rootElement) {

        super();

        // rootElement for mouse events
        this._rootElement = rootElement || document;
        this._keyboardState = {};
        this._mouseState = {};
        this._lastMousePosition = new Vec2();
        this._currentFrameTime = 0;

        // keyboard events should be on the body
        document.body.addEventListener('keydown', this._onKeyDown.bind(this), false);
        document.body.addEventListener('keyup', this._onKeyUp.bind(this), false);

        this._rootElement.addEventListener('mousedown', this._onMouseDown.bind(this), false);
        this._rootElement.addEventListener('mouseup', this._onMouseUp.bind(this), false);
        this._rootElement.addEventListener('mousemove', this._onMouseMove.bind(this), false);

    }

    _onKeyDown (e) {

        if (!this._keyboardState[e.keyCode]) {
            this._keyboardState[e.keyCode] = zeroState();
        }

        if (!this._keyboardState[e.keyCode][state.DOWN].captureTime) {
            this._keyboardState[e.keyCode][state.DOWN].captureTime = performance.now();
            this._keyboardState[e.keyCode][state.DOWN].frameTime = 0;
        } 

    }

    _onKeyUp (e) {

        if (!this._keyboardState[e.keyCode]) {
            this._keyboardState[e.keyCode] = zeroState();
        }

        this._keyboardState[e.keyCode][state.UP].captureTime = performance.now();
        this._keyboardState[e.keyCode][state.UP].frameTime = 0;

        this._keyboardState[e.keyCode][state.DOWN].captureTime = 0;
        this._keyboardState[e.keyCode][state.DOWN].frameTime = 0;

    }

    _onMouseDown (e) {

        this._lastMousePosition.reset(e.pageX, e.pageY);

        if (!this._mouseState[e.which]) {
            this._mouseState[e.which] = zeroState();
        }

        this._mouseState[e.which][state.DOWN].captureTime = performance.now();
        this._mouseState[e.which][state.DOWN].frameTime = 0;

        this._mouseState[e.which][state.UP].captureTime = 0;
        this._mouseState[e.which][state.UP].frameTime = 0;

    }

    _onMouseUp (e) {

        this._lastMousePosition.reset(e.pageX, e.pageY);

        if (!this._mouseState[e.which]) {
            this._mouseState[e.which] = zeroState();
        }

        this._mouseState[e.which][state.UP].captureTime = performance.now();
        this._mouseState[e.which][state.UP].frameTime = 0;

        this._mouseState[e.which][state.DOWN].captureTime = 0;
        this._mouseState[e.which][state.DOWN].frameTime = 0;

    }

    _onMouseMove (e) {

        e.stopPropagation();

        // am I worried about clicks being consumed with different coords as I only have this store for them?
        this._lastMousePosition.reset(e.pageX, e.pageY);

    }

    get mousePosition () {

        return this._lastMousePosition.clone();

    }

    _getButtonState (deviceState, button, state) {
        if (deviceState[button] && deviceState[button][state] && deviceState[button][state].captureTime && deviceState[button][state].frameTime === this._currentFrameTime) {
            return true;
        }
        return false;
    }

    _getButtonHeld (deviceState, button) {
        if (deviceState[button] && deviceState[button][state.DOWN] && deviceState[button][state.DOWN].captureTime && deviceState[button][state.DOWN].frameTime !== this._currentFrameTime) {
            return true;
        }
        return false;
    }

    // is key held down
    getKey (keycode) {
        return this._getButtonHeld(this._keyboardState, keycode);
    }

    // was key down this frame?
    getKeyDown (keycode) {
        return this._getButtonState(this._keyboardState, keycode, state.DOWN);
    }

    // was key up this frame?
    getKeyUp (keycode) {
        return this._getButtonState(this._keyboardState, keycode, state.UP);
    }

    // is mouse button held down?
    getMouse (mouseButton) {
        return this._getButtonHeld(this._mouseState, mouseButton);
    }

    // was mouse button down this frame?
    getMouseDown (mouseButton) {
        return this._getButtonState(this._mouseState, mouseButton, state.DOWN);
    }

    // was mouse button up this frame?
    getMouseUp (mouseButton) {
        return this._getButtonState(this._mouseState, mouseButton, state.UP);
    }

    beforeSceneUpdate (time) {

        let states = Object.keys(state);
        let keys = Object.keys(this._keyboardState);
        for (let i=0; i<keys.length; i++) {
            for (let j=0; j<states.length; j++) {
                let buttonState = this._keyboardState[keys[i]][state[states[j]]];
                if (buttonState.frameTime === 0) { 
                    buttonState.frameTime = time.time;
                }
            }
        }

        let mouseButtons = Object.keys(this._mouseState);
        for (let i=0; i<mouseButtons.length; i++) {
            for (let j=0; j<states.length; j++) {
                let buttonState = this._mouseState[mouseButtons[i]][state[states[j]]];
                if (buttonState.frameTime === 0) { 
                    buttonState.frameTime = time.time;
                }
            }
        }

        this._currentFrameTime = time.time;

    }

}

export default Input;
