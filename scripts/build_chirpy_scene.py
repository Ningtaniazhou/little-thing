"""Reproducible Blender 5.x model + eight-second animation. No external assets.

Run: Blender --background --python scripts/build_chirpy_scene.py
Use -- --render to also render the two review keyframes.
Coordinates: Z up; the front of the machine faces -Y. glTF exports Y up.
"""
import bpy
import math
import random
import json
import sys
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/3d-v1'
OUT.mkdir(parents=True, exist_ok=True)
(ROOT / 'public/models').mkdir(parents=True, exist_ok=True)
random.seed(19)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.fps = 24
scene.frame_start = 0
scene.frame_end = 192

def rgb(h):
    vals = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(v / 12.92 if v < .04045 else ((v + .055) / 1.055) ** 2.4 for v in vals) + (1,)

def material(name, color, rough=.35, metallic=0, emission=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = rgb(color)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = rgb(color)
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metallic
    if emission:
        p.inputs['Emission Color'].default_value = rgb(color)
        p.inputs['Emission Strength'].default_value = emission
    return m

orange = material('Enamel / tangerine', 'EC683A', .28)
blue = material('Enamel / lagoon blue', '3989A4', .26)
gold = material('Trim / butter yellow', 'F8C754', .28, .25)
cream = material('Trim / vanilla', 'FFF0D0', .43)
dark = material('Dispensing recess', '783A29', .65)
ivory = material('Bird / warm ivory fleece', 'FFF5E5', .95)
fur_mats = [material('Fleece strand '+str(i), c, 1) for i,c in enumerate(['FFF8EC','F4E8D3','FFF2DE'])]
beak_mat = material('Bird / blue felt', '8FB8CA', .86)
eye_mat = material('Bird / black bead eyes', '27201D', .21)
bulb = material('Bulbs / warm emissive', 'FFF1B1', .2, emission=2.5)
glass = material('Glass / pale blue', 'D9F0F5', .12)
gp = glass.node_tree.nodes.get('Principled BSDF')
gp.inputs['Transmission Weight'].default_value = .92
gp.inputs['IOR'].default_value = 1.45
shell_mats = [material('Capsule / '+n, c, .28) for n,c in [('sky','7DC2DF'),('pink','EE9FAB'),('lemon','F5D467'),('mint','9CCBA4'),('lilac','B8A0D6')]]

def empty(name, loc=(0,0,0), parent=None):
    o = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.parent = parent
    return o

def finish(o,name,mat,parent=None):
    o.name=name
    o.data.materials.append(mat)
    o.parent=parent
    if o.type=='MESH':
        for p in o.data.polygons: p.use_smooth=True
    return o

def box(name, loc, size, mat, bevel=.06, parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o=bpy.context.object
    o.dimensions=size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod=o.modifiers.new('Soft toy edges','BEVEL'); mod.width=bevel; mod.segments=3
        bpy.ops.object.modifier_apply(modifier=mod.name)
        mod=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return finish(o,name,mat,parent)

def ellipsoid(name,loc,scale,mat,parent=None,segments=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=16, radius=1, location=loc)
    o=bpy.context.object; o.scale=scale
    return finish(o,name,mat,parent)

def cylinder(name,loc,radius,depth,mat,parent=None,front=False):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=radius, depth=depth, location=loc)
    o=bpy.context.object
    if front: o.rotation_euler[0]=math.pi/2
    mod=o.modifiers.new('Rounded rim','BEVEL'); mod.width=.025; mod.segments=3
    bpy.ops.object.modifier_apply(modifier=mod.name)
    return finish(o,name,mat,parent)

def tube(name,points,radius,mat,parent=None):
    c=bpy.data.curves.new(name,'CURVE'); c.dimensions='3D'; c.bevel_depth=radius; c.bevel_resolution=3
    s=c.splines.new('POLY'); s.points.add(len(points)-1)
    for p,co in zip(s.points,points): p.co=(*co,1)
    o=bpy.data.objects.new(name,c); bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active=o; o.select_set(True)
    bpy.ops.object.convert(target='MESH'); o=bpy.context.object; o.select_set(False)
    return finish(o,name,mat,parent)

def star(name, center, outer, inner, depth, mat, parent=None):
    pts=[]
    for i in range(10):
        a=math.pi/2+i*math.pi/5; r=outer if i%2==0 else inner
        pts.append((r*math.cos(a),r*math.sin(a)))
    verts=[(x,y,z) for y in (-depth/2,depth/2) for x,z in pts]
    faces=[tuple(range(9,-1,-1)),tuple(range(10,20))]
    faces += [(i,(i+1)%10,(i+1)%10+10,i+10) for i in range(10)]
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(verts,[],faces); mesh.update()
    o=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(o); o.location=center
    finish(o,name,mat,parent)
    if outer>.2:
        bpy.context.view_layer.objects.active=o
        mod=o.modifiers.new('Rounded star points','BEVEL'); mod.width=.045; mod.segments=3
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return o

root=empty('CHIRPY_SCENE')
machine=empty('Machine_Root',parent=root)
cylinder('Porcelain stage',(0,0,.08),2.6,.18,cream,root)
box('Blue illuminated foot',(0,0,.32),(3.6,2.1,.35),blue,.16,machine)
box('Gold base piping',(0,0,.17),(3.5,2,.09),gold,.04,machine)
for i in range(11):
    ellipsoid('Bulb_Base_%02d'%i,(-1.53+i*.306,-1.055,.33),(.065,.035,.065),bulb,machine,16)
# Open chassis built from walls: the dispensing recess has real depth.
box('Chassis back',(0,.54,1.22),(3.14,.35,1.62),orange,.1,machine)
box('Chassis left',(-.71,-.02,1.22),(1.72,1.44,1.62),orange,.11,machine)
box('Chassis right',(1.4,-.02,1.22),(.34,1.44,1.62),orange,.08,machine)
box('Chassis upper lintel',(.72,-.02,1.9),(1.08,1.44,.26),orange,.08,machine)
box('Recess floor',(.73,-.15,.61),(1.05,1.3,.2),dark,.04,machine)
box('Recess rear',(.73,.32,1.18),(1,.06,1.08),dark,.04,machine)
# Cream arch around the actual aperture.
arch=[(.22,-.77,.65),(.22,-.77,1.3)]
arch += [(.73+.51*math.cos(a),-.77,1.3+.51*math.sin(a)) for a in [math.pi-i*math.pi/32 for i in range(33)]]
arch += [(1.24,-.77,.65)]
tube('Cream arch',arch,.055,cream,machine)
for x in [-1.62,1.62]:
    box('Blue side bumper',(x,.04,1.24),(.18,1.38,1.44),blue,.08,machine)
    box('Gold side strip',(x,-.61,1.24),(.19,.035,1.18),gold,.013,machine)
# Knob consists of a static trim ring and rotating spindle + grip.
cylinder('Knob cream collar',(-.8,-.81,1.04),.43,.1,cream,machine,True)
cylinder('Knob gold collar',(-.8,-.885,1.04),.38,.055,gold,machine,True)
knob=empty('Knob_Pivot',(-.8,-.94,1.04),machine)
cylinder('Knob blue disk',(0,0,0),.335,.11,blue,knob,True)
box('Knob grip',(0,-.085,0),(.12,.18,.53),blue,.055,knob)
box('Knob grip highlight',(-.025,-.179,.025),(.026,.012,.33),cream,.01,knob)
cylinder('Coin plate',(-.15,-.79,1.19),.15,.05,gold,machine,True)
box('Coin slot',(-.15,-.825,1.19),(.025,.015,.18),dark,.008,machine)
for i in range(7): box('Speaker bar',(-1.22+i*.12,-.76,1.63),(.045,.028,.2),gold,.02,machine)
for i in range(3): ellipsoid('Bulb_Control_%02d'%i,(-.18,-.79,1.7-i*.13),(.039,.025,.039),bulb,machine,16)
# Protruding tray with walls, sized for the physical hatching egg.
box('Tray bottom',(.73,-1.16,.56),(1.28,1.28,.13),orange,.065,machine)
box('Tray front rim',(.73,-1.8,.68),(1.36,.12,.29),cream,.05,machine)
for x in [.08,1.38]: box('Tray side rim',(x,-1.18,.68),(.1,1.25,.29),cream,.04,machine)
# Chamber, framed by blue posts. Thin transparent panes stay independent.
box('Glass chamber floor',(0,0,2.08),(3.26,1.72,.18),gold,.06,machine)
box('Upper orange fascia',(0,0,3.96),(3.34,1.8,.4),orange,.09,machine)
box('Top gold piping',(0,-.91,4.14),(3.27,.04,.045),gold,.02,machine)
for x in [-1.61,1.61]:
    for y in [-.78,.78]: box('Chamber frame post',(x,y,3.01),(.09,.09,1.77),gold,.025,machine)
    box('Blue crown end cap',(x,0,3.96),(.28,1.88,.45),blue,.08,machine)
box('Glass_Front',(0,-.823,3),(3.1,.025,1.67),glass,.01,machine)
box('Glass_Back',(0,.823,3),(3.1,.025,1.67),glass,.01,machine)
for x in [-1.565,1.565]: box('Glass_Side',(x,0,3),(.025,1.62,1.67),glass,.01,machine)
for i in range(7): ellipsoid('Bulb_Fascia_%02d'%i,(-1.32+i*.44,-.926,3.97),(.066,.03,.066),bulb,machine,16)
# Large extruded star marquee.
star('Star gold frame',(0,.08,4.73),1.24,.61,.24,gold,machine)
star('Star blue inset',(0,-.065,4.73),1.02,.50,.06,blue,machine)
star_pts=[]
for i in range(10):
    a=math.pi/2-i*math.pi/5; r=1.13 if i%2==0 else .56
    star_pts.append(Vector((r*math.cos(a),-.13,4.73+r*math.sin(a))))
lamp_i=0
for i in range(10):
    for t in [0,.33,.66]:
        p=star_pts[i].lerp(star_pts[(i+1)%10],t)
        ellipsoid('Bulb_Star_%02d'%lamp_i,p,(.06,.034,.06),bulb,machine,16); lamp_i+=1
# Front brand plaque; real text geometry is exportable and editable.
box('Brand plaque',(0,-.92,3.68),(1.64,.12,.36),cream,.055,machine)
font_path=Path('/System/Library/Fonts/STHeiti Medium.ttc')
font=bpy.data.fonts.load(str(font_path)) if font_path.exists() else None
def label(name,text,loc,size,mat,parent,font=None):
    c=bpy.data.curves.new(name,'FONT'); c.body=text; c.size=size; c.align_x='CENTER'; c.align_y='CENTER'; c.extrude=.002
    if font: c.font=font
    o=bpy.data.objects.new(name,c); bpy.context.collection.objects.link(o); o.location=loc; o.rotation_euler=(math.pi/2,0,0); o.parent=parent; c.materials.append(mat)
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active=o
    bpy.ops.object.convert(target='MESH'); o.select_set(False)
    return o
label('Brand lettering','啾啾小事' if font else 'CHIRPY',(0,-.989,3.68),.26,dark,machine,font)
for x in [-.7,.7]: ellipsoid('Plaque screw',(x,-.99,3.68),(.022,.012,.022),gold,machine,12)

def capsule(name,loc,mat,parent,r=.25):
    e=empty(name,loc,parent)
    ellipsoid(name+'_body',(0,0,0),(r,r,r*1.18),mat,e)
    # Decorative star placed on front, kept low relief rather than texture.
    star(name+'_star',(0,-r-.002,.02),r*.28,r*.13,.006,gold,e)
    pts=[(r*math.cos(a),r*math.sin(a),0) for a in [i*2*math.pi/48 for i in range(49)]]
    tube(name+'_seam',pts,.009,cream,e)
    return e

eggs=[]
for row in range(3):
    for col in range(5):
        x=-1.15+col*.57+(0.08 if row%2 else 0)+random.uniform(-.045,.045)
        e=capsule('Chamber_Egg_%02d'%len(eggs),(x,-.43+random.uniform(-.025,.025),2.45+row*.47+random.uniform(-.05,.05)),shell_mats[(row*2+col)%5],machine,.255)
        e.rotation_euler=(random.uniform(-.35,.35),random.uniform(-.6,.6),random.uniform(-.4,.4)); eggs.append(e)
for col in range(5): eggs.append(capsule('Chamber_Egg_%02d'%len(eggs),(-1.15+col*.57,.33,2.57),shell_mats[(col+2)%5],machine,.255))

# Hero egg has a matched zigzag equator and actual shell thickness.
hero=empty('Hero_Egg',(.73,.08,1.04),machine)
def shell(name,upper,parent):
    n=64; rings=14; verts=[]; faces=[]
    for k in range(rings+1):
        t=k/rings
        for j in range(n):
            a=2*math.pi*j/n
            edge=math.pi/2 + (.10 if (j//4)%2==0 else -.10)
            theta=(.012*(1-t)+edge*t) if upper else (edge*(1-t)+(math.pi-.012)*t)
            rr=.365*math.sin(theta)*(1-.11*math.cos(theta))
            verts.append((rr*math.cos(a),rr*math.sin(a),.46*math.cos(theta)))
    for k in range(rings):
        for j in range(n):
            q=k*n+j; nxt=k*n+(j+1)%n
            faces.append((q,nxt,nxt+n,q+n))
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(verts,[],faces); mesh.update()
    o=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(o); finish(o,name,shell_mats[0],parent)
    bpy.context.view_layer.objects.active=o
    m=o.modifiers.new('Real shell thickness','SOLIDIFY'); m.thickness=.023
    bpy.ops.object.modifier_apply(modifier=m.name)
    return o
bottom=shell('Egg_Lower_Shell',False,hero)
cap=empty('Egg_Cap_Pivot',parent=hero)
shell('Egg_Upper_Shell',True,cap)
for i,(x,z) in enumerate([(-.15,-.17),(.13,-.21),(0,.2)]):
    parent=cap if z>0 else hero
    y=-math.sqrt(max(.015,.365**2-x*x-(z*.72)**2))-.012
    star('Hero shell star '+str(i),(x,y,z),.061,.028,.006,gold,parent)

def fur(name,scale,parent,count=7000):
    # Tapered low-poly tufts: actual exportable geometry, no nonportable hair system.
    verts=[]; faces=[]; indices=[]
    for i in range(count):
        z=1-2*(i+.5)/count; a=i*2.3999632297
        n=Vector((math.sqrt(1-z*z)*math.cos(a),math.sqrt(1-z*z)*math.sin(a),z))
        p=Vector((n.x*scale[0],n.y*scale[1],n.z*scale[2]))
        normal=Vector((n.x/scale[0],n.y/scale[1],n.z/scale[2])).normalized()
        tangent=normal.cross(Vector((0,0,1)))
        if tangent.length<.01: tangent=normal.cross(Vector((0,1,0)))
        tangent.normalize(); bit=normal.cross(tangent)
        length=random.uniform(.014,.035); width=random.uniform(.002,.0045)
        tip=p+normal*length+tangent*random.uniform(-.008,.008)
        start=len(verts)
        verts.extend([p+tangent*width,p-tangent*width,p+bit*width,tip])
        faces.extend([(start,start+1,start+3),(start+1,start+2,start+3),(start+2,start,start+3)])
        indices.extend([i%3]*3)
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(verts,[],faces); mesh.update()
    o=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(o); o.parent=parent
    for m in fur_mats: mesh.materials.append(m)
    for p,mi in zip(mesh.polygons,indices): p.material_index=mi; p.use_smooth=True
    return o

bird=empty('Bird_Root',(0,0,-.17),hero)
body=empty('Bird_Body_Pivot',parent=bird)
ellipsoid('Bird plush body',(0,0,0),(.325,.265,.32),ivory,body,40)
fur('Bird fine fleece',(.325,.265,.32),body)
for x in [-.112,.112]:
    eye=ellipsoid('Bird bead eye',(x,-.247,.073),(.024,.022,.027),eye_mat,body,20)
    ellipsoid('Eye glint',(x-.006,-.267,.082),(.005,.005,.005),cream,body,12)
ellipsoid('Bird blue beak',(0,-.285,.007),(.033,.047,.052),beak_mat,body)
wings=[]
for side in [-1,1]:
    wing=empty('Bird_Wing_'+('L' if side<0 else 'R'),(side*.29,-.02,-.035),body)
    w=ellipsoid('Plush wing',(0,0,-.065),(.105,.071,.17),ivory,wing)
    f=fur('Wing fleece',(.105,.071,.17),wing,850); f.location.z=-.065
    wings.append(wing)
for x in [-.105,.105]: ellipsoid('Bird blue foot',(x,-.14,-.3),(.075,.10,.045),beak_mat,body)
# A matching mascot for the idle frame disappears before the hero egg emerges.
mascot=empty('Idle_Bird',(1.17,-.18,4.55),machine)
def duplicate_tree(source,parent):
    o=source.copy()
    if source.data: o.data=source.data
    bpy.context.collection.objects.link(o); o.parent=parent; o.animation_data_clear()
    o.name='Idle_'+source.name
    for child in source.children: duplicate_tree(child,o)
    return o
duplicate_tree(body,mascot)
mascot.scale=(1.15,)*3
empty('Sound_Button_Anchor',(0,-.18,4.73),machine)

# Small shell fragments, independent so they arc out and settle in the tray.
chips=[]
for i in range(3):
    o=box('Shell_Chip_%d'%i,(0,0,0),(.09,.065,.025),shell_mats[0],.012,hero); chips.append(o)

def key(o,t,loc=None,rot=None,scale=None):
    frame=round(t*24)
    if loc is not None: o.location=loc; o.keyframe_insert(data_path='location',frame=frame)
    if rot is not None: o.rotation_euler=rot; o.keyframe_insert(data_path='rotation_euler',frame=frame)
    if scale is not None:
        o.scale=(scale,)*3 if isinstance(scale,(float,int)) else scale
        o.keyframe_insert(data_path='scale',frame=frame)

# 0–1.6 turn & mix; 1.6–3.1 dispense; 3.1–4.1 wobble;
# 4.1–5.7 crack and peek; 5.7–8 settle and speak.
key(knob,0,rot=(0,0,0)); key(knob,.15,rot=(0,0,0)); key(knob,1.6,rot=(0,-math.pi*2,0)); key(knob,8,rot=(0,-math.pi*2,0))
for i in range(14): key(machine,i*.12,rot=(0,math.sin(i*2.2)*.012,0))
key(machine,1.7,rot=(0,0,0)); key(machine,8,rot=(0,0,0))
for i,e in enumerate(eggs):
    loc=e.location.copy(); rot=e.rotation_euler.copy()
    key(e,0,loc=loc,rot=rot)
    for j in range(1,8):
        key(e,j*.2,loc=(loc.x+math.sin(j*2+i)*.055,loc.y,loc.z+abs(math.sin(j+i))*.075),rot=(rot.x+math.sin(j+i)*.22,rot.y+.18*math.cos(j),rot.z))
    key(e,1.7,loc=loc,rot=rot); key(e,8,loc=loc,rot=rot)
key(mascot,0,scale=1.15); key(mascot,1.3,scale=1.15); key(mascot,1.65,scale=.001); key(mascot,8,scale=.001)
key(hero,0,scale=.001,loc=(.73,.08,1.04),rot=(0,0,0)); key(hero,1.6,scale=.001)
key(hero,1.7,scale=1,loc=(.73,-.05,1.07))
key(hero,2.05,loc=(.73,-.55,1.09),rot=(.7,0,0))
key(hero,2.4,loc=(.73,-1.20,1.23),rot=(1.6,0,0))
key(hero,2.7,loc=(.73,-1.38,1.02),rot=(0,0,0))
key(hero,2.88,loc=(.73,-1.38,1.12),rot=(-.12,0,0))
key(hero,3.1,loc=(.73,-1.38,1.02),rot=(0,0,0))
for i,t in enumerate([3.3,3.45,3.62,3.82,4,4.12]): key(hero,t,rot=(0,(-1)**i*.075,0))
key(hero,4.2,rot=(0,0,0)); key(hero,8,loc=(.73,-1.38,1.02),rot=(0,0,0),scale=1)
key(cap,0,loc=(0,0,0),rot=(0,0,0)); key(cap,4.1,loc=(0,0,0),rot=(0,0,0))
key(cap,4.35,loc=(0,0,.12),rot=(0,-.08,.04)); key(cap,4.55,loc=(0,0,.065),rot=(0,.06,0))
key(cap,5,loc=(.09,.10,.44),rot=(-.4,-.25,.1)); key(cap,5.4,loc=(.12,.14,.40),rot=(-.55,-.32,.08)); key(cap,8,loc=(.12,.14,.40),rot=(-.55,-.32,.08))
key(bird,0,loc=(0,0,-.2),scale=.001); key(bird,4.15,loc=(0,0,-.2),scale=.001)
key(bird,4.3,loc=(0,0,-.11),scale=.72); key(bird,4.6,loc=(0,0,.035),scale=.88)
key(bird,4.85,loc=(0,0,.035),scale=.9); key(bird,5.15,loc=(0,0,.23),scale=1)
key(bird,5.45,loc=(0,0,.18),scale=1); key(bird,8,loc=(0,0,.18),scale=1)
key(body,0,rot=(0,0,0)); key(body,5.6,rot=(0,0,0)); key(body,6.2,rot=(0,-.1,.09)); key(body,6.8,rot=(0,.06,-.07)); key(body,7.4,rot=(0,0,0)); key(body,8,rot=(0,0,0))
for side,w in zip([-1,1],wings):
    key(w,0,rot=(0,0,0)); key(w,4.4,rot=(0,0,0)); key(w,4.7,rot=(0,side*-.65,0)); key(w,5.2,rot=(0,side*-.75,0)); key(w,5.55,rot=(0,side*-.28,0)); key(w,6.1,rot=(0,side*-.55,0)); key(w,6.5,rot=(0,side*-.25,0)); key(w,8,rot=(0,side*-.25,0))
for i,c in enumerate(chips):
    s=-1 if i%2==0 else 1
    key(c,0,scale=.001); key(c,4.2,scale=.001); key(c,4.35,loc=(s*.18,-.13,.17),scale=1)
    key(c,4.65,loc=(s*(.33+i*.035),-.15-i*.07,.3),rot=(i,.5,1))
    key(c,5.05,loc=(s*(.38+i*.03),-.19-i*.08,-.375),rot=(.1,i,.5)); key(c,8,loc=(s*(.38+i*.03),-.19-i*.08,-.375),scale=1)

# Merge static direct children by material to keep the real-time draw count reasonable.
def merge_static(parent):
    groups={}
    for o in list(parent.children):
        if o.type=='MESH' and not o.animation_data and not o.children and not o.name.startswith(('Bulb_','Glass_')):
            if len(o.data.materials)==1: groups.setdefault(o.data.materials[0].name,[]).append(o)
    for name,obs in groups.items():
        if len(obs)<2: continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in obs: o.select_set(True)
        bpy.context.view_layer.objects.active=obs[0]; bpy.ops.object.join(); obs[0].name=parent.name+' / '+name
merge_static(machine)

# Studio rig for editable Blender source and optional stills. Not exported in GLB.
scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.38,.5,.58,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.5
floor=box('Studio floor',(0,0,-.11),(200,200,.12),material('Studio powder blue','BAD5DE',.85),.01)
def area(name,loc,power,size,color):
    bpy.ops.object.light_add(type='AREA',location=loc); o=bpy.context.object; o.name=name
    o.data.energy=power; o.data.shape='DISK'; o.data.size=size; o.data.color=color
    o.rotation_euler=(Vector((0,0,2.5))-o.location).to_track_quat('-Z','Y').to_euler()
area('Large warm key',(-4,-6,9),1200,7,(1,.86,.68))
area('Soft blue fill',(5,-2,5),850,6,(.76,.89,1))
area('Top rim',(1,4,8),1400,5,(1,.93,.81))
bpy.ops.object.camera_add(location=(7,-15,8))
camera=bpy.context.object; camera.rotation_euler=(Vector((0,-.15,2.8))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO'; camera.data.ortho_scale=7.25; scene.camera=camera
scene.render.engine='CYCLES'; scene.cycles.samples=32
scene.render.resolution_x=900; scene.render.resolution_y=1100; scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
scene.frame_set(0)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'chirpy-machine-v1.blend'))
# Select only the model hierarchy for a portable GLB with baked transforms.
bpy.ops.object.select_all(action='DESELECT')
def select_tree(o):
    o.select_set(True)
    for c in o.children: select_tree(c)
select_tree(root)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/models/chirpy-machine-v1.glb'),export_format='GLB',use_selection=True,export_apply=True,export_animations=True,export_animation_mode='SCENE',export_anim_scene_split_object=False,export_frame_range=True,export_force_sampling=True,export_frame_step=1,export_lights=False,export_cameras=False)
report={'fps':24,'duration':8,'frames':[0,192],'objects':len(list(root.children_recursive)),'vertices':sum(len(o.data.vertices) for o in root.children_recursive if o.type=='MESH'),'phases':[{'name':'twist','start':0,'end':1.6},{'name':'dispense','start':1.6,'end':3.1},{'name':'wobble','start':3.1,'end':4.1},{'name':'hatch','start':4.1,'end':5.7},{'name':'greet','start':5.7,'end':8}]}
(OUT/'model-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
if '--render' in sys.argv:
    for name,frame in [('main-scene-render',0),('hatching-render',160)]:
        scene.frame_set(frame); scene.render.filepath=str(OUT/(name+'.png')); bpy.ops.render.render(write_still=True)
print('CHIRPY_MODEL_READY',json.dumps(report))
