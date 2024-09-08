import PhysicsObject from './physicsobject.mjs';
import PlayerObject, { playerMaxHealth, playerMaxXY, playerMinXY, playerSize } from './playerobject.mjs';
import Game from './game.mjs';

import { Vec2, Vector } from '../utils/vector.mjs';

export const bulletDamage = 1;
export const bulletSpeed = 5;
export const bulletLifespan = 100;

export const bulletSize = 5;

export default class BulletObject extends PhysicsObject {
    /**
     * @param {PlayerObject} player
     * @param {Vec2} vel
     * @param {PlayerObject} immune
     */
    constructor(player, vel) {
        super(player.pos.clone());
        this.vel.copy(vel);
        
        this.life = 0;
        this.player = player;
    }

    /**
     * @param {Game} game
     */
    update(_, game) {
        this.life++;
        if (this.life > bulletLifespan) this.remove = true;

        for (let i = 0; i < game.objects.length; i++) {
            const object = game.objects[i];

            if (object.socketKey) if (object.socketKey != this.player.socketKey) {

                if (object.pos.sub(this.pos).lengthSquared < (bulletSize + playerSize) ** 2) {
                    object.health -= bulletDamage;
                    this.remove = true;

                    if (object.health == 0) {
                        object.health = playerMaxHealth;
                        object.pos.set(game.random.randint(playerMinXY, playerMaxXY), game.random.randint(playerMinXY, playerMaxXY));
                    }
                }
            }
        }

        super.update();
    }

    /**
     * @param {PlayerObject} player
     * @param {number} direction
     */
    static createBullet(player, direction) {
        return new BulletObject(player, Vector.polarVector(direction, bulletSpeed));
    }
}