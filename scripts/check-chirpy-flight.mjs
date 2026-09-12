import assert from 'node:assert/strict';
import {birdFlightPose,FLIGHT_DURATION} from '../src/lib/chirpy-flight.ts';

const left=birdFlightPose(.46),pause=birdFlightPose(.76),right=birdFlightPose(1.23),end=birdFlightPose(FLIGHT_DURATION);
assert(left.x<0 && right.x>0 && end.x===0,'Left, right, then centre');
assert(left.bank>0 && right.bank<0 && end.bank===0,'Body banks into each turn');
const pauseSpeed=Math.abs(pause.x-left.x)/.3;
const dashSpeed=Math.abs(right.x-pause.x)/.47;
assert(dashSpeed>pauseSpeed*10,'Pause is slower than rightward dash');
for(const fps of [30,60,120]){
 let previous=birdFlightPose(0);
 for(let i=1;i<=Math.ceil(3*fps);i++){
  const pose=birdFlightPose(i/fps);
  assert(Object.values(pose).every(v=>typeof v!=='number'||Number.isFinite(v)));
  assert(pose.approach>=previous.approach && pose.approach<=1,'Never fly backwards in depth');
  assert(Math.abs(pose.x-previous.x)<.04,'No lateral teleport');
  assert(Math.abs(pose.bank-previous.bank)<.05,'No abrupt body rotation');
  previous=pose;
 }
}
for(const t of [0,.2,.45,1,3]){
 const pose=birdFlightPose(t,true);assert.equal(pose.x,0);assert.equal(pose.bank,0);
}
assert.equal(birdFlightPose(.45,true).arrived,true);
assert.deepEqual(birdFlightPose(3),birdFlightPose(FLIGHT_DURATION));
console.log('PASS: zigzag waypoints, dash/pause speeds, banking, continuity at 30/60/120 fps, reduced motion');
