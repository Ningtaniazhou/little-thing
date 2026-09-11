import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { animationDelta, createChirpyPlayback } from '../src/lib/chirpy-animation.ts';

const bytes = readFileSync(new URL('../public/models/chirpy-machine-v1.glb', import.meta.url));
const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
const gltf = await new GLTFLoader().parseAsync(buffer, '');
assert.ok(gltf.animations.length > 0, 'GLB must contain portable animation');
assert.equal(gltf.animations[0].duration, 8);
const node = name => {
  const object = gltf.scene.getObjectByName(name);
  assert.ok(object, `Missing editable component: ${name}`);
  return object;
};
const hero = node('Hero_Egg');
const cap = node('Egg_Cap_Pivot');
const bird = node('Bird_Root');
const knob = node('Knob_Pivot');
node('Bird_Wing_L'); node('Bird_Wing_R'); node('Egg_Lower_Shell');
const playback = createChirpyPlayback(gltf.scene, gltf.animations);
function seek(t) {
  playback.seek(t); gltf.scene.updateMatrixWorld(true);
  const box = new Box3().setFromObject(gltf.scene);
  assert.ok([...box.min, ...box.max].every(Number.isFinite), `Invalid geometry at ${t}s`);
  assert.ok(box.getSize(new Vector3()).length() < 12, `Escaping geometry at ${t}s`);
}
seek(0);
assert.ok(hero.scale.x < .01 && bird.scale.x < .01, 'Hero egg must start hidden');
const capClosed = cap.position.clone();
const knobInitial = knob.quaternion.clone();
seek(.8);
assert.ok(knobInitial.angleTo(knob.quaternion) > .3, 'Knob must actually rotate');
seek(2.75);
assert.ok(hero.scale.x > .9 && bird.scale.x < .01, 'Dispense a whole egg before the bird appears');
seek(8);
assert.ok(cap.position.distanceTo(capClosed) > .3, 'Cap must separate from the shell');
assert.ok(bird.scale.x > .95, 'Bird must emerge');
const eggWorld = hero.getWorldPosition(new Vector3());
assert.ok(Math.abs(eggWorld.x - .73) < .03 && Math.abs(eggWorld.z - 1.38) < .03, 'Egg must settle in receiving tray');
assert.ok(Math.abs(new Box3().setFromObject(cap).min.y - .17) < .001, "Upper shell rests on platform");
const restingCap = cap.quaternion.clone();
for (let i = 0; i < 120; i++) playback.seek(8);
assert.ok(cap.quaternion.angleTo(restingCap) < .00001, 'Resting shell never accumulates rotation');
seek(4.2);
let previousCap = cap.quaternion.clone();
for (let frame = 253; frame <= 334; frame++) {
  seek(frame / 60);
  assert.ok(cap.quaternion.angleTo(previousCap) < .05, 'Shell tilts smoothly without spinning');
  previousCap.copy(cap.quaternion);
}
seek(8);
const landing = bird.getWorldPosition(new Vector3());
assert.ok(landing.distanceTo(new Vector3(.55, .52, 2.05)) < .001, 'Bird lands on the front platform');
playback.cheer(.275);
assert.ok(bird.getWorldPosition(new Vector3()).y > landing.y + .2, 'Celebration jumps upward');
playback.cheer(1.1);
assert.ok(bird.getWorldPosition(new Vector3()).distanceTo(landing) < .001, 'Celebration returns to the same landing');
// Backwards seeking and replay must restore the original hidden parts.
seek(0);
assert.ok(hero.scale.x < .01 && bird.scale.x < .01, 'Replay must reset egg and bird');
assert.ok(cap.position.distanceTo(capClosed) < .01, 'Replay must close the cap');
for (let t = 0; t < 8; t += .1) seek(t);
// Regression: a queued RAF frame can have an earlier timestamp than the click.
assert.equal(animationDelta(999.8, 1000), 0);
assert.equal(animationDelta(1000, null), 0);
assert.equal(animationDelta(2000, 1000), .05);
for (let round = 1; round <= 3; round++) {
  playback.reset();
  seek(animationDelta(999.8, 1000));
  assert.ok(hero.scale.x < .01 && bird.scale.x < .01, `Round ${round}: initial pose`);
  for (let frame = 1; frame <= 480; frame++) {
    playback.seek(frame / 60);
    if (frame === 180) assert.ok(hero.scale.x > .9 && bird.scale.x < .01, `Round ${round}: egg dispenses`);
    if (frame === 330) assert.ok(bird.scale.x > .95 && cap.position.distanceTo(capClosed) > .3, `Round ${round}: bird hatches`);
  }
  assert.ok(bird.scale.x > .95, `Round ${round}: exact final frame stays visible`);
}
// Identical timeline positions must match regardless of refresh rate or seek history.
seek(6.2);
const expectedBird = bird.getWorldPosition(new Vector3());
for (let i = 0; i < 90; i++) seek(6.2);
assert.ok(bird.getWorldPosition(new Vector3()).distanceTo(expectedBird) < 1e-6, 'Repeated frames cannot push the bird back and forth');
for (const fps of [30, 60, 120]) {
  playback.reset();
  let previousZ = -Infinity;
  for (let frame = 0; frame <= 8 * fps; frame++) {
    seek(frame / fps);
    if (frame / fps >= 5.7) {
      const z = bird.getWorldPosition(new Vector3()).z;
      assert.ok(z >= previousZ - 1e-6, 'Bird always moves out of the exit');
      previousZ = z;
    }
  }
  seek(6.2);
  assert.ok(bird.getWorldPosition(new Vector3()).distanceTo(expectedBird) < 1e-6, 'Jump is independent of frame rate');
}
playback.dispose();
console.log('PASS: geometry, 80 poses, nonnegative RAF deltas, and 3 complete 480-frame replays including exact endpoints.');
