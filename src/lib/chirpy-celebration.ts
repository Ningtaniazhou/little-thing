import * as THREE from "three";
import { birdFlightPose, FLIGHT_DURATION } from "./chirpy-flight";

/** Move the actual hat-wearing bird into a transparent, viewport-sized 3D stage. */
export function startBirdCelebration(bird: THREE.Object3D, camera: THREE.PerspectiveCamera,
  source: HTMLCanvasElement, host: HTMLElement, message: string, environment: THREE.Texture | null,
  reducedMotion: boolean) {
  bird.updateWorldMatrix(true, true);
  const saved = { parent: bird.parent!, position: bird.position.clone(), rotation: bird.quaternion.clone(), scale: bird.scale.clone() };
  const world = bird.getWorldPosition(new THREE.Vector3());
  const worldScale = bird.getWorldScale(new THREE.Vector3());
  const rotation = camera.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(bird.getWorldQuaternion(new THREE.Quaternion()));
  const bounds = source.getBoundingClientRect();
  const projected = world.clone().project(camera);
  const startScreen = new THREE.Vector2(bounds.left + (projected.x + 1) * bounds.width / 2,
    bounds.top + (1 - projected.y) * bounds.height / 2);
  const depth = -world.clone().applyMatrix4(camera.matrixWorldInverse).z;
  const startScale = worldScale.multiplyScalar(bounds.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * depth));
  const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=.93;
  renderer.domElement.setAttribute("aria-hidden","true");
  host.append(renderer.domElement);
  const scene=new THREE.Scene(); scene.environment=environment; scene.environmentIntensity=.55;
  scene.add(new THREE.HemisphereLight(0xf5fbff,0xd8cebb,1.3));
  scene.add(new THREE.AmbientLight(0xffffff,.7));
  const sun=new THREE.DirectionalLight(0xffecd4,1.3);sun.position.set(-3,8,5);scene.add(sun);
  const fill=new THREE.DirectionalLight(0xbde4ff,.8);fill.position.set(5,4,-3);scene.add(fill);
  const view=new THREE.OrthographicCamera(); view.position.z=2000; view.near=.1;view.far=4000;
  scene.add(bird);
  const wings=[bird.getObjectByName("Bird_Wing_L"),bird.getObjectByName("Bird_Wing_R")];
  const wingRotations=wings.map(wing=>wing?.quaternion.clone());
  const body=bird.getObjectByName("Bird_Body_Pivot")!;

  // Text is painted onto a curved cloth mesh, so it unfolds with the wings.
  const canvas=document.createElement("canvas");canvas.width=1536;canvas.height=432;
  const ctx=canvas.getContext("2d")!;
  ctx.fillStyle="#fff1cb";ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle="#dfac59";ctx.lineWidth=12;ctx.strokeRect(16,16,1504,400);
  ctx.strokeStyle="#f0cf88";ctx.lineWidth=4;ctx.strokeRect(34,34,1468,364);
  let font=116;ctx.font=`600 ${font}px sans-serif`;
  while(ctx.measureText(message).width>1350){font-=2;ctx.font=`600 ${font}px sans-serif`;}
  ctx.fillStyle="#71503a";ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillText(message,768,218);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const geometry=new THREE.PlaneGeometry(.98,.276,32,8);
  const material=new THREE.MeshStandardMaterial({map:texture,roughness:.92,side:THREE.DoubleSide,emissive:0xfff1cb,emissiveMap:texture,emissiveIntensity:.2});
  const banner=new THREE.Mesh(geometry,material);banner.name="Celebration_Banner";
  banner.position.set(0,-.14,.36);body.add(banner);
  const initialPositions=Float32Array.from(geometry.attributes.position.array);
  let elapsed=0,width=0,height=0,ended=false;
  function resize(){
    width=host.clientWidth;height=host.clientHeight;renderer.setSize(width,height);
    view.left=-width/2;view.right=width/2;view.top=height/2;view.bottom=-height/2;view.updateProjectionMatrix();
  }
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  const endRotation=new THREE.Quaternion();
  function update(dt:number){
    if(ended)return;
    elapsed+=dt;
    const flightDuration=reducedMotion?.45:FLIGHT_DURATION;
    const pose=birdFlightPose(elapsed,reducedMotion);
    const ease=pose.approach;
    const targetScale=Math.min(width*.86/1.12,height*.51/.95);
    bird.position.set(THREE.MathUtils.lerp(startScreen.x-width/2,0,ease)+pose.x*width,
      THREE.MathUtils.lerp(height/2-startScreen.y,height*.07,ease)+(reducedMotion?0:Math.sin(ease*Math.PI)*height*.055),0);
    bird.scale.copy(startScale).lerp(new THREE.Vector3(targetScale,targetScale,targetScale),ease);
    bird.quaternion.slerpQuaternions(rotation,endRotation,ease);
    bird.rotateZ(pose.bank);
    const unfold=THREE.MathUtils.smoothstep(elapsed,flightDuration+.12,flightDuration+.62);
    wings.forEach((wing,i)=>{
      if(!wing)return;
      wing.quaternion.copy(wingRotations[i]!);
      const flightFlap=1-THREE.MathUtils.smoothstep(elapsed,flightDuration-.3,flightDuration);
      const flap=reducedMotion?0:Math.sin(elapsed*22)*.4*flightFlap;
      wing.rotateZ((i===0?-1:1)*(.65+unfold*.77+flap));
      wing.rotateX(reducedMotion?0:Math.sin(elapsed*22)*.22*flightFlap+Math.sin(elapsed*2.5)*.035*(1-flightFlap));
    });
    banner.visible=unfold>.01;banner.scale.x=Math.max(.001,unfold);
    const positions=geometry.attributes.position;
    for(let i=0;i<positions.count;i++){
      const x=initialPositions[i*3],y=initialPositions[i*3+1];
      positions.setXYZ(i,x,y-.025*(1-(x/.49)**2),reducedMotion?0:.012*Math.sin(x*10+elapsed*2)*(1-unfold*.65));
    }
    positions.needsUpdate=true;geometry.computeVertexNormals();
    if(pose.arrived&&!reducedMotion){
      const settle=Math.min(1,(elapsed-flightDuration)/.35);
      bird.position.x+=Math.sin((elapsed-flightDuration)*1.8)*width*.006*settle;
      bird.position.y+=Math.sin((elapsed-flightDuration)*2)*height*.005*settle;
      bird.rotateZ(Math.sin((elapsed-flightDuration)*1.8)*.018*settle);
    }
    host.dataset.phase=unfold>=1?"holding":"flying";
    renderer.render(scene,view);
  }
  update(0);
  return { update, dispose(){
    if(ended)return;ended=true;observer.disconnect();
    body.remove(banner);geometry.dispose();material.dispose();texture.dispose();
    wings.forEach((wing,i)=>{if(wing)wing.quaternion.copy(wingRotations[i]!);});
    saved.parent.add(bird);bird.position.copy(saved.position);bird.quaternion.copy(saved.rotation);bird.scale.copy(saved.scale);
    renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();delete host.dataset.phase;
  }};
}
