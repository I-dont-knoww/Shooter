import PhysicsObject from './physicsobject.mjs';
import BulletObject from './bulletobject.mjs';
import { Vec2, Vector } from '../utils/vector.mjs';

import Input from './controls/input.mjs';
import Game from './game.mjs';

export const playerSpeed = 0.5;
export const socketKeyLength = 24;

export const playerMaxHealth = 5;
export const playerReloadSpeed = 30;

export const playerSize = 10;

export const playerMinXY = 0;
export const playerMaxXY = 500;

export default class PlayerObject extends PhysicsObject {
    /**
     * @param {Vec2} pos
     * @param {string} socketKey
     */
    constructor(pos, socketKey) {
        super(pos);
        this.health = playerMaxHealth;

        this.shootTimer = 0;

        this.socketKey = socketKey;
    }

    /**
     * @param {Object<string, Input>} inputs
     * @param {Game} game
     */
    update(inputs, game) {
        const input = inputs[this.socketKey];
        PlayerObject.moveWASD(this, input);
        this.#checkGun(input, game);

        this.#confinePlayerMovement();
        this.vel.mulInPlace(0.8);

        super.update();
    }

    /**
     * @param {Input} input
     * @param {Game} game
     */
    #checkGun(input, game) {
        const mouse = input.mouse;
        this.shootTimer++;

        if (mouse.left.held) {
            if (this.shootTimer >= playerReloadSpeed) {
                this.shootTimer = 0;
                game.addObject(BulletObject.createBullet(this, mouse.position.sub(this.pos).angle));
            }
        }
    }

    #confinePlayerMovement() {
        if (this.pos.x <= playerMinXY) {
            this.pos.x = playerMinXY;
            if (this.vel.x < 0) this.vel.x = 0;
        } else if (this.pos.x >= playerMaxXY) {
            this.pos.x = playerMaxXY;
            if (this.vel.x > 0) this.vel.x = 0;
        } else if (this.pos.y <= playerMinXY) {
            this.pos.y = playerMinXY;
            if (this.vel.y < 0) this.vel.y = 0;
        } else if (this.pos.y >= playerMaxXY) {
            this.pos.y = playerMaxXY;
            if (this.vel.y > 0) this.vel.y = 0;
        }
    }

    /**
     * @param {PhysicsObject} object
     * @param {Input} input
     */
    static moveWASD(object, input) {
        const keyboard = input.keyboard;

        const movementVector = Vector.ZERO;

        if (keyboard.held.has('KeyW')) movementVector.addInPlace(Vector.UP);
        if (keyboard.held.has('KeyA')) movementVector.addInPlace(Vector.LEFT);
        if (keyboard.held.has('KeyS')) movementVector.addInPlace(Vector.DOWN);
        if (keyboard.held.has('KeyD')) movementVector.addInPlace(Vector.RIGHT);

        object.vel.addInPlace(movementVector.normalize().mul(playerSpeed));
    }
}