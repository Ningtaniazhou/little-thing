/** Normalized screen-space waypoints: dash left, breathe, dash right, settle. */
const beats = [
  {time:0, x:0, approach:0, bank:0},
  {time:.46, x:-.14, approach:.28, bank:.17},
  {time:.76, x:-.135, approach:.32, bank:.10},
  {time:1.23, x:.10, approach:.67, bank:-.18},
  {time:1.43, x:.095, approach:.72, bank:-.09},
  {time:2.02, x:0, approach:1, bank:0},
];
export const FLIGHT_DURATION = 2.02;
export function birdFlightPose(seconds:number, reducedMotion=false) {
  if(reducedMotion){
    const u=Math.max(0,Math.min(1,seconds/.45));
    return {x:0,approach:u*u*(3-2*u),bank:0,arrived:u===1};
  }
  const t=Math.max(0,Math.min(seconds,FLIGHT_DURATION));
  const index=Math.min(beats.length-2,beats.findIndex((beat,i)=>i<beats.length-1&&t<=beats[i+1].time));
  const a=beats[Math.max(0,index)],b=beats[Math.max(0,index)+1];
  const u=(t-a.time)/(b.time-a.time),ease=u*u*(3-2*u);
  return {x:a.x+(b.x-a.x)*ease,approach:a.approach+(b.approach-a.approach)*ease,
    bank:a.bank+(b.bank-a.bank)*ease,arrived:seconds>=FLIGHT_DURATION};
}
