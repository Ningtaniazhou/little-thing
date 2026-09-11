import { AnimationMixer, LoopOnce, Vector3, Box3, Quaternion, Euler, type AnimationClip, type Object3D } from "three";

/** RAF timestamps may precede performance.now() sampled in a click handler. */
export function animationDelta(now: number, previous: number | null) {
  return previous === null ? 0 : Math.max(0, Math.min((now - previous) / 1000, .05));
}

export function createChirpyPlayback(root: Object3D, clips: AnimationClip[]) {
  const mixer = new AnimationMixer(root);
  const actions = clips.map(clip => {
    const action = mixer.clipAction(clip);
    action.setLoop(LoopOnce, 1);
    action.clampWhenFinished = true;
    action.play();
    return action;
  });
  const duration = Math.max(0, ...clips.map(clip => clip.duration));

  const bird = root.getObjectByName("Bird_Root");
  const cap = root.getObjectByName("Egg_Cap_Pivot");
  // Capture a fixed release pose; never accumulate rotations on the previous frame.
  mixer.setTime(4.2);
  root.updateMatrixWorld(true);
  const capStart = cap?.getWorldPosition(new Vector3()) ?? new Vector3();
  const capStartRotation = cap?.quaternion.clone() ?? new Quaternion();
  const capEndRotation = capStartRotation.clone().multiply(new Quaternion().setFromEuler(new Euler(-.6, 0, -1.15)));
  const capEnd = new Vector3(1.45, .4, 1.85);
  mixer.setTime(5.7);
  root.updateMatrixWorld(true);
  const birdStart = bird?.getWorldPosition(new Vector3()) ?? new Vector3();
  const birdAuthoredPosition = bird?.position.clone() ?? new Vector3();
  mixer.setTime(duration);
  root.updateMatrixWorld(true);
  if (cap?.parent) {
    cap.quaternion.copy(capEndRotation);
    cap.position.copy(cap.parent.worldToLocal(capEnd.clone()));
    root.updateMatrixWorld(true);
    capEnd.y += .17 - new Box3().setFromObject(cap).min.y;
  }
  // Outward first, then down: clear the bird and tray before touching the stage.
  const capControl = capStart.clone().add(new Vector3(.95, .35, .65));
  const capRotation = new Quaternion();
  const landing = new Vector3(.55, .52, 2.05);
  const position = new Vector3();
  function seek(time: number) {
    // setTime alone does not reactivate actions paused/disabled at an endpoint.
    for (const action of actions) { action.enabled = true; action.paused = false; }
    // Restore the authored pose before evaluating: Three may skip unchanged tracks.
    if (bird) bird.position.copy(birdAuthoredPosition);
    mixer.setTime(Math.max(0, Math.min(time, duration)));
    if (bird) birdAuthoredPosition.copy(bird.position);
    if (cap?.parent) {
      if (time > 4.2) {
        const u = Math.min(1, (time - 4.2) / 1.35);
        position.copy(capStart).multiplyScalar((1-u)*(1-u))
          .addScaledVector(capControl, 2*(1-u)*u).addScaledVector(capEnd, u*u);
        const tilt = u*u*(3-2*u);
        cap.quaternion.copy(capRotation.slerpQuaternions(capStartRotation, capEndRotation, tilt));
        root.updateMatrixWorld(true);
        cap.position.copy(cap.parent.worldToLocal(position));
      } else {
        cap.quaternion.copy(capStartRotation);
        cap.position.set(0, 0, 0);
      }
    }
    if (bird?.parent && time > 5.7) {
      const progress = Math.min(1, (time - 5.7) / 1.35);
      root.updateMatrixWorld(true);
      position.copy(birdStart).lerp(landing, progress);
      position.y += Math.sin(progress * Math.PI) * .65;
      bird.position.copy(bird.parent.worldToLocal(position));
    }
  }

  return {
    seek,
    cheer(time: number) {
      seek(duration);
      if (!bird?.parent) return;
      root.updateMatrixWorld(true);
      bird.getWorldPosition(position);
      position.y += Math.abs(Math.sin(Math.min(time / 1.1, 1) * Math.PI * 2)) * .28;
      bird.position.copy(bird.parent.worldToLocal(position));
    },
    reset() {
      for (const action of actions) action.reset().play();
      seek(0);
    },
    dispose() { mixer.stopAllAction(); mixer.uncacheRoot(root); },
  };
}
