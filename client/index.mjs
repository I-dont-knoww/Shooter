import Lobby from './lobby.mjs';

import { Vec2, Vector } from '../utils/vector.mjs';

import { textEncoder } from '../utils/textDecoderAndEncoder.mjs';
import { HeaderEncoder } from './connection/encoder.mjs';

import Game from '../game/game.mjs';
import Random from '../utils/random.mjs';

import Input from '../game/controls/input.mjs';
import InputsManager from './inputsmanager.mjs';

import Path from './renderer/path.mjs';
import Renderer from './renderer/renderer.mjs';
import LayerRenderer from './renderer/layerrenderer.mjs';
import OffscreenCanvasManager from './renderer/offscreencanvasmanager.mjs';

import headers from '../headers.mjs';
import { sleepWorker } from '../utils/timer.mjs';

import { playerMaxHealth, playerMaxXY, playerMinXY, playerSize } from '../game/playerobject.mjs';
import { bulletSize } from '../game/bulletobject.mjs';

Lobby.initiate();

const isHost = await Lobby.askUserForHost();
console.log(`is host: ${isHost}`);

const connection = await Lobby.initiateConnection('ws://localhost:8000');
console.log(`connection made`);

if (isHost) await Lobby.hostGameMessageSequence(connection);
else await Lobby.joinGameMessageSequence(connection);
console.log(`host/join sequence made`);

const { socketKeys, randomseed } = await Lobby.startGame(connection);
const game = new Game(Game.createPlayers(socketKeys), connection, new Random(randomseed));
const layerenderer = new LayerRenderer(new Vec2(innerWidth, innerHeight));

const clientInput = new Input(game);
Input.listenToClient(clientInput);

const inputsManager = new InputsManager(game);

function draw() {
    layerenderer.clear();

    layerenderer.renderPath(0, Renderer.renderType.STROKE, Path.RECT(new Vec2(playerMinXY, playerMinXY), new Vec2(playerMaxXY, playerMaxXY)), {
        strokeStyle: 'black',
        lineWidth: 3
    });
    for (let i = 0; i < game.objects.length; i++) {
        const object = game.objects[i];

        if (object.socketKey) layerenderer.renderPath(0, Renderer.renderType.FILL, Path.CIRCLE(object.pos, playerSize), {
            fillStyle: `rgba(0, 0, 0, ${object.health/playerMaxHealth})`
        });
        else layerenderer.renderPath(0, Renderer.renderType.FILL, Path.CIRCLE(object.pos, bulletSize), { fillStyle: 'black' });
    }

    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

while (true) {
    const inputManagerPromise = inputsManager.listenForInputs();

    const serializedInput = clientInput.serialize();
    const inputsMessage = new Uint8Array(game.connection.key.length + serializedInput.length);
    inputsMessage.set(textEncoder.encode(game.connection.key));
    inputsMessage.set(serializedInput, game.connection.key.length);
    game.connection.send(HeaderEncoder(headers.client.REFLECT, HeaderEncoder(headers.client.INPUTS, inputsMessage)));

    await Promise.all([inputManagerPromise, sleepWorker(1000 / 60)]);

    game.update(inputsManager.inputs);
}