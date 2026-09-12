import * as THREE from "three";
import { CHIRPY_THEMES } from "./chirpy-themes";

/** Small, reusable meshes in Bird_Body_Pivot's coordinates: +Y up, +Z face. */
export function createBirdAccessories(body: THREE.Object3D) {
  const root = new THREE.Group();
  root.name = "Bird_Accessories";
  body.add(root);
  const groups = CHIRPY_THEMES.map(theme => {
    const group = new THREE.Group();
    group.name = `Accessory_${theme.key}`;
    root.add(group);
    return group;
  });
  const materials = CHIRPY_THEMES.map(theme => new THREE.MeshStandardMaterial({
    color: theme.color, roughness: .8, metalness: 0,
  }));
  materials[0].color.set("#38271f");
  materials[1].color.set("#a51e3b");
  materials[2].color.set("#c68b6a");
  materials[4].color.set("#c3a05d");
  const ochre = new THREE.MeshStandardMaterial({color:"#c3923e",roughness:.86});
  // Keep the authored foot nodes (and their animation tracks), replace the oval
  // silhouette with two distinct rounded toes in the same local coordinates.
  body.traverse(object=>{
    if(!(object instanceof THREE.Mesh)) return;
    if(/Bird[_ ]blue[_ ]beak/.test(object.name)) object.material=ochre;
    if(/Bird[_ ]blue[_ ]foot/.test(object.name)) {
      object.material=ochre;
      object.geometry=new THREE.BufferGeometry();
      for(const side of [-1,1]) {
        const toe=oval(object,ochre,[side*.48,0,.15],[.44,.8,.85]);
        toe.name=side<0?"Toe_Left":"Toe_Right";
      }
      oval(object,ochre,[0,0,-.48],[.78,.7,.4]).name="Foot_Heel";
      // Original geometry is still owned by the hidden idle mascot.
    }
  });
  const gold = new THREE.MeshStandardMaterial({ color: "#ffe3a0", roughness: .65 });
  function mesh(parent: THREE.Object3D, geometry: THREE.BufferGeometry, material: THREE.Material,
    position: [number, number, number] = [0, 0, 0]) {
    const item = new THREE.Mesh(geometry, material);
    item.position.set(...position); item.castShadow = true; item.receiveShadow = true;
    parent.add(item); return item;
  }
  function oval(parent: THREE.Object3D, material: THREE.Material,
    position: [number, number, number], scale: [number, number, number]) {
    const item = mesh(parent, new THREE.SphereGeometry(1, 24, 16), material, position);
    item.scale.set(...scale); return item;
  }
  function cord(parent: THREE.Object3D, material: THREE.Material, points: number[][], radius: number) {
    return mesh(parent, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(
      points.map(p => new THREE.Vector3(...p as [number, number, number])),
    ), 24, radius, 8, false), material);
  }

  // Oversized dark tortoiseshell frames, with open centres for the bead eyes.
  for (const side of [-1, 1]) {
    mesh(groups[0], new THREE.TorusGeometry(.119, .009, 8, 48), materials[0], [side * .132, .085, .298]);
    cord(groups[0], materials[0], [[side * .25,.085,.296],[side * .31,.08,.18],[side * .32,.06,.04]], .008);
  }
  cord(groups[0], materials[0], [[-.013,.087,.30],[0,.108,.32],[.013,.087,.30]], .008);

  // A plump cherry-red felt crown, gently tilted over a narrow lower band.
  const beret = new THREE.Group(); groups[1].add(beret);
  beret.position.set(.025,.275,0); beret.rotation.z = -.2;
  oval(beret, materials[1], [0,0,0], [.225,.025,.185]);
  oval(beret, materials[1], [.025,.061,-.007], [.26,.12,.215]);
  cord(beret, materials[1], [[.075,.174,0],[.083,.204,-.005],[.068,.22,-.01]], .012);

  // The selected living variant: a fitted terracotta housework kerchief.
  const kerchief = groups[2];
  const cream = new THREE.MeshStandardMaterial({color:"#fff0d1",roughness:.9});
  const flowerCentre = new THREE.MeshStandardMaterial({color:"#f3bf45",roughness:.9});
  const cap = mesh(kerchief, new THREE.SphereGeometry(1,48,28,0,Math.PI*2,0,1.08), materials[2], [0,.055,-.025]);
  cap.scale.set(.351,.329,.308);
  const hem: number[][] = [];
  for(let j=0;j<=64;j++) {
    const angle=j/64*Math.PI*2;
    hem.push([.351*Math.sin(1.08)*Math.cos(angle),.055+.329*Math.cos(1.08),-.025+.308*Math.sin(1.08)*Math.sin(angle)]);
  }
  cord(kerchief,cream,hem,.005);
  oval(kerchief,materials[2],[-.307,.223,.005],[.044,.038,.04]);
  for(const side of [-1,1]) {
    const tail=oval(kerchief,materials[2],[-.324+side*.025,.248+side*.041,-.004],[.03,.075,.024]);
    tail.rotation.z=side*.65;
  }
  for(const [x,y,z] of [[-.09,.293,.171],[.09,.255,.211],[.12,.33,.112]]) {
    for(let k=0;k<5;k++) {
      const angle=k*Math.PI*2/5;
      oval(kerchief,cream,[x+Math.cos(angle)*.012,y+Math.sin(angle)*.012,z],[.007,.008,.004]);
    }
    oval(kerchief,flowerCentre,[x,y,z+.002],[.005,.005,.005]);
  }
  const leather=new THREE.MeshStandardMaterial({color:"#44362a",roughness:.7});

  // A two-leaf clip: dimensional leaves with a fine central vein.
  for (const [x, angle, size] of [[.155,-.45,1],[.23,-1.12,.8]]) {
    const leaf = new THREE.Group(); groups[3].add(leaf);
    leaf.position.set(x,.292,.115); leaf.rotation.z=angle; leaf.scale.setScalar(size);
    const shape = new THREE.Shape();
    shape.moveTo(0,0); shape.bezierCurveTo(-.075,.05,-.05,.13,0,.175);
    shape.bezierCurveTo(.05,.13,.075,.05,0,0);
    mesh(leaf,new THREE.ExtrudeGeometry(shape,{depth:.009,bevelEnabled:true,bevelSize:.005,bevelThickness:.005,bevelSegments:2,steps:1}),materials[3]);
    cord(leaf,gold,[[0,.008,.018],[0,.08,.025],[0,.15,.018]],.003);
  }
  oval(groups[3],gold,[.155,.294,.132],[.025,.014,.014]);

  // Khaki pith helmet, dark leather band and bronze-rimmed expedition goggles.
  const hat = new THREE.Group(); groups[4].add(hat); hat.position.y=.24;
  const profile = [[0,.23],[.075,.224],[.15,.197],[.205,.15],[.236,.075],[.246,.025],[.29,-.015],[.34,-.055],[.34,-.069],[.285,-.03],[.23,.008]];
  const hatMaterial = materials[4]; hatMaterial.side = THREE.DoubleSide;
  mesh(hat,new THREE.LatheGeometry(profile.map(([x,y])=>new THREE.Vector2(x,y)),40),hatMaterial);
  mesh(hat,new THREE.CylinderGeometry(.238,.248,.042,48,1,true),leather,[0,.058,0]);
  const bronze=new THREE.MeshStandardMaterial({color:"#97603b",roughness:.4,metalness:.55});
  const lenses=new THREE.MeshStandardMaterial({color:"#263832",roughness:.17,metalness:.35});
  for(const side of [-1,1]){
    const goggle=new THREE.Group();goggle.position.set(side*.091,.082,.248);goggle.rotation.y=side*.1;hat.add(goggle);
    const housing=mesh(goggle,new THREE.CylinderGeometry(.071,.069,.035,32),leather);housing.rotation.x=Math.PI/2;
    mesh(goggle,new THREE.TorusGeometry(.067,.009,10,40),bronze,[0,0,.022]);
    mesh(goggle,new THREE.CircleGeometry(.058,32),lenses,[0,0,.023]);
    for(let i=0;i<6;i++){const a=i*Math.PI/3;oval(goggle,bronze,[Math.cos(a)*.072,Math.sin(a)*.072,.01],[.004,.004,.004]);}
  }
  cord(hat,leather,[[-.025,.082,.266],[0,.093,.28],[.025,.082,.266]],.01);

  function select(index: number) {
    const selected = ((index % groups.length) + groups.length) % groups.length;
    groups.forEach((group,i)=>{group.visible=i===selected;});
    root.userData.theme = CHIRPY_THEMES[selected].key;
  }
  select(0);
  // Geometries/materials are owned by the scene and disposed in its normal teardown.
  return { root, select };
}
