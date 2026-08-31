# Batch-build four stage-B characters on the shared B0 26-bone skeleton.
# blender -b --python make_characters.py
# Outputs: runtime/models/*.glb + manifest.json, blender/*.blend, previews/*
import bpy, math, json, os, sys, mathutils

ROOT  = r"C:\Users\Storm\Documents\Codex\2026-07-18\ni\outputs\goddess-fall-web\art-source\k3-v2"
TEXDIR= os.path.join(ROOT, "art-source", "textures")
OUTM  = os.path.join(ROOT, "runtime", "models")
PREV  = os.path.join(ROOT, "previews")
BLEND = os.path.join(ROOT, "blender")
for d in (OUTM, PREV, BLEND): os.makedirs(d, exist_ok=True)
FPS = 30
PALETTE = json.load(open(os.path.join(TEXDIR, "palette.json"), encoding="utf-8"))

def log(*a): print("[CHAR]", *a); sys.stdout.flush()
R = math.radians

# ---------------- shared skeleton (26 bones, B0-verified) ----------------
BONES = {
 "Root":       ((0,0,0.02),(0,0,0.12), None),
 "Hips":       ((0,0,0.95),(0,0,1.05), "Root"),
 "Spine":      ((0,0,1.05),(0,0,1.22), "Hips"),
 "Spine1":     ((0,0,1.22),(0,0,1.38), "Spine"),
 "Neck":       ((0,0,1.38),(0,0,1.50), "Spine1"),
 "Head":       ((0,0,1.50),(0,0,1.68), "Neck"),
 "Shoulder_L": ((0.06,0,1.42),(0.20,0,1.44), "Spine1"),
 "UpperArm_L": ((0.20,0,1.44),(0.42,0,1.30), "Shoulder_L"),
 "Forearm_L":  ((0.42,0,1.30),(0.58,0,1.08), "UpperArm_L"),
 "Hand_L":     ((0.58,0,1.08),(0.64,0,0.98), "Forearm_L"),
 "Shoulder_R": ((-0.06,0,1.42),(-0.20,0,1.44), "Spine1"),
 "UpperArm_R": ((-0.20,0,1.44),(-0.42,0,1.30), "Shoulder_R"),
 "Forearm_R":  ((-0.42,0,1.30),(-0.58,0,1.08), "UpperArm_R"),
 "Hand_R":     ((-0.58,0,1.08),(-0.64,0,0.98), "Forearm_R"),
 "Thigh_L":    ((0.11,0,0.95),(0.13,0,0.55), "Hips"),
 "Shin_L":     ((0.13,0,0.55),(0.14,0,0.12), "Thigh_L"),
 "Foot_L":     ((0.14,0,0.12),(0.14,-0.16,0.04), "Shin_L"),
 "Toe_L":      ((0.14,-0.16,0.04),(0.14,-0.26,0.02), "Foot_L"),
 "Thigh_R":    ((-0.11,0,0.95),(-0.13,0,0.55), "Hips"),
 "Shin_R":     ((-0.13,0,0.55),(-0.14,0,0.12), "Thigh_R"),
 "Foot_R":     ((-0.14,0,0.12),(-0.14,-0.16,0.04), "Shin_R"),
 "Toe_R":      ((-0.14,-0.16,0.04),(-0.14,-0.26,0.02), "Foot_R"),
 "Cloak_1":    ((0,0.10,1.35),(0,0.16,0.95), "Spine1"),
 "Cloak_2":    ((0,0.16,0.95),(0,0.20,0.45), "Cloak_1"),
 "Weapon":     ((-0.64,0,0.98),(-0.64,0,0.72), "Hand_R"),
 "Prop":       ((0.16,0,0.98),(0.22,0,0.88), "Hips"),
}

# ---------------- shape helpers ----------------
def apply_tf(obj):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True); bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

def shp_box(loc, scale, bevel=0.0, rot=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=tuple(R(a) for a in rot))
    o = bpy.context.active_object; o.scale = scale
    apply_tf(o)
    if bevel > 0:
        m = o.modifiers.new("bev","BEVEL"); m.width = bevel; m.segments = 1
        bpy.ops.object.modifier_apply(modifier="bev")
    return o

def shp_cyl(loc, r, depth, verts=8, rot=(0,0,0), bevel=0.0):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth,
        location=loc, rotation=tuple(R(a) for a in rot))
    o = bpy.context.active_object
    apply_tf(o)
    if bevel > 0:
        m = o.modifiers.new("bev","BEVEL"); m.width = bevel; m.segments = 1
        bpy.ops.object.modifier_apply(modifier="bev")
    return o

def shp_cone(loc, r1, r2, depth, verts=8, open_=False, rot=(0,0,0)):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=depth,
        end_fill_type=("NOTHING" if open_ else "NGON"),
        location=loc, rotation=tuple(R(a) for a in rot))
    o = bpy.context.active_object
    apply_tf(o)
    return o

def shp_ico(loc, r, subdiv=1, scale=(1,1,1), rot=(0,0,0)):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=subdiv, radius=r,
        location=loc, rotation=tuple(R(a) for a in rot))
    o = bpy.context.active_object; o.scale = scale
    apply_tf(o)
    return o

def shp_torus(loc, R_, r, rot=(0,0,0), major=12, minor=6):
    bpy.ops.mesh.primitive_torus_add(major_radius=R_, minor_radius=r,
        major_segments=major, minor_segments=minor,
        location=loc, rotation=tuple(R(a) for a in rot))
    o = bpy.context.active_object
    apply_tf(o)
    return o

SHAPES = {"box": shp_box, "cyl": shp_cyl, "cone": shp_cone, "ico": shp_ico, "torus": shp_torus}

# ---------------- UV painting ----------------
def assign_uv(obj, cellspec, mode):
    me = obj.data
    uvl = me.uv_layers.active or me.uv_layers.new(name="UVMap")
    cx, cy = cellspec["cell"]
    pad = 3/512
    x0 = cx/8 + pad
    y0 = 1 - (cy+1)/8 + pad          # PIL top-left rows -> Blender bottom-left V
    w  = 1/8 - 2*pad
    if mode == "flat":
        u, v = x0 + w/2, y0 + w/2
        for poly in me.polygons:
            for li in poly.loop_indices:
                uvl.data[li].uv = (u, v)
        return
    # proj: dominant-axis box projection into the cell rect
    xs = [v.co.x for v in me.vertices]; ys = [v.co.y for v in me.vertices]; zs = [v.co.z for v in me.vertices]
    rng = {"x": (min(xs), max(xs)), "y": (min(ys), max(ys)), "z": (min(zs), max(zs))}
    for poly in me.polygons:
        n = poly.normal
        ax = max(range(3), key=lambda i: abs(n[i]))
        a_name, b_name = {0: ("y","z"), 1: ("x","z"), 2: ("x","y")}[ax]
        (a0,a1),(b0,b1) = rng[a_name], rng[b_name]
        for li in poly.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            a = getattr(co, a_name); b = getattr(co, b_name)
            u = x0 + (0.15 + 0.7 * ((a - a0) / max(1e-6, a1 - a0))) * w
            v = y0 + (0.15 + 0.7 * ((b - b0) / max(1e-6, b1 - b0))) * w
            uvl.data[li].uv = (u, v)

# ---------------- rig / anim helpers ----------------
def build_armature(scn):
    arm_data = bpy.data.armatures.new("Armature")
    arm = bpy.data.objects.new("Armature", arm_data)
    scn.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="EDIT")
    for name,(h,t,p) in BONES.items():
        b = arm_data.edit_bones.new(name); b.head, b.tail = h, t
        if p: b.parent = arm_data.edit_bones[p]
    bpy.ops.object.mode_set(mode="OBJECT")
    return arm, arm_data

def reset_pose(arm):
    for pb in arm.pose.bones:
        pb.rotation_mode = "XYZ"; pb.rotation_euler = (0,0,0); pb.location = (0,0,0)

def keyframe(arm, bname, frame, rot=None, loc=None):
    pb = arm.pose.bones[bname]
    pb.rotation_mode = "XYZ"
    if rot is not None:
        pb.rotation_euler = tuple(R(a) for a in rot)
        pb.keyframe_insert("rotation_euler", frame=frame)
    if loc is not None:
        pb.location = loc
        pb.keyframe_insert("location", frame=frame)

def make_action(arm, name, keyframer):
    act = bpy.data.actions.new(name)
    arm.animation_data.action = act
    reset_pose(arm)
    keyframer(arm)
    tr = arm.animation_data.nla_tracks.new(); tr.name = name
    tr.strips.new(name, 1, act)
    arm.animation_data.action = None
    reset_pose(arm)
    return act

# ---------------- animation sets ----------------
def kf_idle(breathe=1.0, sway=1.0):
    def f(arm):
        for fr, ph in [(1,0.0),(19,1.0),(37,2.0),(55,3.0),(73,4.0)]:
            s = math.sin(ph*math.pi/2.0)
            keyframe(arm,"Spine",fr,rot=(1.5*s*breathe,0,0))
            keyframe(arm,"Head",fr,rot=(-2.0*s*breathe,2.5*s*sway,0))
            keyframe(arm,"UpperArm_L",fr,rot=(0,0,-3.0-1.5*s))
            keyframe(arm,"UpperArm_R",fr,rot=(0,0, 3.0+1.5*s))
            keyframe(arm,"Cloak_1",fr,rot=(1.2*s,0,0))
            keyframe(arm,"Hips",fr,loc=(0,0,0.008*s))
    return f

def kf_move(leg=1.0, armAmp=1.0):
    def f(arm):
        keys = [
            (1,  -24*leg, 24*leg,  6, 30, 16*armAmp, -16*armAmp, 0.000),
            (7,    4*leg, -4*leg, 22,  8,  2*armAmp,  -2*armAmp, 0.030),
            (13,  24*leg,-24*leg, 30,  6,-16*armAmp,  16*armAmp, 0.000),
            (19,   -4*leg,  4*leg,  8, 22, -2*armAmp,   2*armAmp, 0.030),
            (25, -24*leg, 24*leg,  6, 30, 16*armAmp, -16*armAmp, 0.000),
        ]
        for fr, tl, tr, sl, sr, al, ar_, bob in keys:
            keyframe(arm,"Thigh_L",fr,rot=(tl,0,0)); keyframe(arm,"Thigh_R",fr,rot=(tr,0,0))
            keyframe(arm,"Shin_L",fr,rot=(sl,0,0));  keyframe(arm,"Shin_R",fr,rot=(sr,0,0))
            keyframe(arm,"UpperArm_L",fr,rot=(al,0,-4)); keyframe(arm,"UpperArm_R",fr,rot=(ar_,0,4))
            keyframe(arm,"Spine",fr,rot=(5,0,0))
            keyframe(arm,"Hips",fr,loc=(0,0,bob))
    return f

def kf_attack_slash(amp=1.3):   # unflagged: single-hand sword chop, hit ~f15 of 25
    def f(arm):
        keys = [
            (1,  (10,0,-8),  (0,0,0),    (0,0,0)),
            (9,  (-70*amp,0,-40),( -15,0,-12),(10,0,8)),
            (15, (85*amp,0,28),  (16,0,14),  (-12,0,-10)),
            (20, (45,0,12),  (7,0,6),    (-5,0,-4)),
            (26, (10,0,-8),  (0,0,0),    (0,0,0)),
        ]
        for fr, ua, fa, sp in keys:
            keyframe(arm,"UpperArm_R",fr,rot=ua); keyframe(arm,"Forearm_R",fr,rot=fa)
            keyframe(arm,"Spine",fr,rot=sp); keyframe(arm,"Spine1",fr,rot=(sp[0]*0.6,sp[1],sp[2]*0.6))
            keyframe(arm,"Head",fr,rot=(sp[0]*-0.5,0,0))
    return f

def kf_attack_smash():          # cultist: two-hand overhead smash, hit ~f14 of 23
    def f(arm):
        keys = [
            (1,  (0,0,-6),  (0,0,6),   (0,0,0),    (4,0,0)),
            (8,  (-95,0,-30),(-95,0,30),(-20,0,-20),(-10,0,0)),
            (14, (80,0,10), (80,0,-10),(18,0,18),  (16,0,0)),
            (19, (40,0,0),  (40,0,0),  (8,0,8),    (8,0,0)),
            (24, (0,0,-6),  (0,0,6),   (0,0,0),    (4,0,0)),
        ]
        for fr, ual, uar, fal, sp in keys:
            keyframe(arm,"UpperArm_L",fr,rot=ual); keyframe(arm,"UpperArm_R",fr,rot=uar)
            keyframe(arm,"Forearm_L",fr,rot=fal);  keyframe(arm,"Forearm_R",fr,rot=(fal[0],0,-fal[2]))
            keyframe(arm,"Spine",fr,rot=sp); keyframe(arm,"Spine1",fr,rot=(sp[0]*0.7,0,0))
            keyframe(arm,"Head",fr,rot=(-sp[0]*0.4,0,0))
    return f

def kf_attack_shoot():          # reina: raise crossbow, recoil at f14 of 23
    def f(arm):
        keys = [
            (1,  (10,0,-8),  (10,0,8),   (0,0,0),    (0,0,0)),
            (8,  (62,0,-14), (62,0,14),  (-28,0,-6), (-28,0,6)),   # aim forward
            (14, (52,0,-14), (52,0,14),  (-40,0,-8), (-40,0,8)),   # recoil
            (15, (52,0,-14), (52,0,14),  (-40,0,-8), (-40,0,8)),
            (20, (30,0,-10), (30,0,10),  (-12,0,-4), (-12,0,4)),
            (24, (10,0,-8),  (10,0,8),   (0,0,0),    (0,0,0)),
        ]
        for fr, ual, uar, fal, far_ in keys:
            keyframe(arm,"UpperArm_L",fr,rot=ual); keyframe(arm,"UpperArm_R",fr,rot=uar)
            keyframe(arm,"Forearm_L",fr,rot=fal);  keyframe(arm,"Forearm_R",fr,rot=far_)
            keyframe(arm,"Head",fr,rot=(6,0,0));   keyframe(arm,"Spine",fr,rot=(3,0,0))
    return f

def kf_attack_faith():          # seraphina: lantern prayer raise, glow peak ~f16 of 27
    def f(arm):
        keys = [
            (1,  (8,0,-6),   (8,0,6),    (0,0,0),   (0,0,0)),
            (10, (45,0,-20), (45,0,20),  (-30,0,0), (-30,0,0)),
            (16, (80,0,-26), (80,0,26),  (-45,0,0), (-45,0,0)),   # lantern high
            (18, (80,0,-26), (80,0,26),  (-45,0,0), (-45,0,0)),
            (23, (35,0,-12), (35,0,12),  (-18,0,0), (-18,0,0)),
            (27, (8,0,-6),   (8,0,6),    (0,0,0),   (0,0,0)),
        ]
        for fr, ual, uar, fal, far_ in keys:
            keyframe(arm,"UpperArm_L",fr,rot=ual); keyframe(arm,"UpperArm_R",fr,rot=uar)
            keyframe(arm,"Forearm_L",fr,rot=fal);  keyframe(arm,"Forearm_R",fr,rot=far_)
            keyframe(arm,"Head",fr,rot=(-8,0,0) if fr>=10 and fr<=18 else (0,0,0))
            keyframe(arm,"Spine",fr,rot=(-5 if 10<=fr<=18 else 0,0,0))
    return f

def kf_hit():                   # cultist flinch, 12f / 0.4s
    def f(arm):
        keys = [(1,(0,0,0)),(4,(16,0,0)),(8,(8,0,0)),(13,(0,0,0))]
        for fr, sp in keys:
            keyframe(arm,"Spine",fr,rot=sp); keyframe(arm,"Spine1",fr,rot=(sp[0]*0.7,0,0))
            keyframe(arm,"Head",fr,rot=(-sp[0]*0.8,0,0))
            keyframe(arm,"UpperArm_L",fr,rot=(sp[0]*0.6,0,-6)); keyframe(arm,"UpperArm_R",fr,rot=(sp[0]*0.6,0,6))
    return f

def kf_death():                 # cultist falls backward, 34f / 1.13s, holds final pose
    def f(arm):
        keys = [
            (1,   (0,0,0),  (0,0,0), 0.00, (0,0,0),  (0,0,0)),
            (9,   (12,0,0), (6,0,0), -0.02,(0,0,0),  (0,0,0)),
            (17,  (-35,0,0),(20,0,0),-0.25,(60,0,0), (75,0,0)),
            (26,  (-78,0,0),(25,0,0),-0.42,(80,0,0), (90,0,0)),
            (35,  (-80,0,0),(25,0,0),-0.44,(80,0,0), (90,0,0)),
        ]
        for fr, rt, sp, drop, th, sh in keys:
            keyframe(arm,"Root",fr,rot=rt)
            keyframe(arm,"Spine",fr,rot=sp)
            keyframe(arm,"Hips",fr,loc=(0,0,drop))
            keyframe(arm,"Thigh_L",fr,rot=th); keyframe(arm,"Thigh_R",fr,rot=(th[0]*0.8,0,6))
            keyframe(arm,"Shin_L",fr,rot=sh);  keyframe(arm,"Shin_R",fr,rot=(sh[0]*0.85,0,0))
            keyframe(arm,"UpperArm_L",fr,rot=(rt[0]*-0.4,0,-20)); keyframe(arm,"UpperArm_R",fr,rot=(rt[0]*-0.4,0,20))
            keyframe(arm,"Head",fr,rot=(rt[0]*-0.3,0,0))
    return f

log("library loaded")

# ================= character part definitions =================
# part tuple: (shape, kwargs, bone, colorName, uvMode)

CHARS = {}

CHARS["cultist-melee"] = {
 "maps_to": ["e3"],
 "animations": {"idle": kf_idle(1.2, 1.4), "move": kf_move(1.1, 1.2),
                "attack_health": kf_attack_smash(), "hit_health": kf_hit(), "death_health": kf_death()},
 "pose_previews": [("attack_health", 14, "pose-attack"), ("death_health", 35, "pose-death")],
 "body": [
  ("cone", dict(loc=(0,0.02,1.60), r1=0.17, r2=0.02, depth=0.36, verts=8, rot=(22,0,0)), "Head", "charcoal", "proj"),   # 尖顶头罩前倾
  ("cone", dict(loc=(0,0.01,1.46), r1=0.26, r2=0.16, depth=0.22, verts=8, open_=True), "Neck", "charcoal", "proj"),     # 罩领
  ("box",  dict(loc=(0,-0.095,1.55), scale=(0.085,0.02,0.095), bevel=0.01), "Head", "void", "flat"),                    # 面部黑洞
  ("box",  dict(loc=(0.26,0,1.50), scale=(0.11,0.10,0.05), bevel=0.015, rot=(0,0,-24)), "Shoulder_L", "armorDk", "proj"), # 上翘肩甲
  ("box",  dict(loc=(-0.26,0,1.50), scale=(0.11,0.10,0.05), bevel=0.015, rot=(0,0,24)), "Shoulder_R", "armorDk", "proj"),
  ("box",  dict(loc=(0.33,0,1.56), scale=(0.05,0.06,0.045), bevel=0.01, rot=(0,0,-38)), "Shoulder_L", "cultRedDk", "flat"),
  ("box",  dict(loc=(-0.33,0,1.56), scale=(0.05,0.06,0.045), bevel=0.01, rot=(0,0,38)), "Shoulder_R", "cultRedDk", "flat"),
  ("box",  dict(loc=(0,0,1.28), scale=(0.20,0.13,0.16), bevel=0.03), "Spine", "cultRed", "proj"),                       # 袍身
  ("cone", dict(loc=(0,0,0.72), r1=0.33, r2=0.22, depth=0.62, verts=8, open_=True), "Hips", "cultRedDk", "proj"),       # 袍摆
  ("cone", dict(loc=(0,0,0.70), r1=0.35, r2=0.24, depth=0.60, verts=8, open_=True, rot=(0,0,22.5)), "Hips", "cultRedDk", "proj"),  # 错位锯齿摆
  ("cyl",  dict(loc=(0,-0.01,1.10), r=0.20, depth=0.06, verts=8), "Hips", "charcoal", "flat"),                          # 腰带
  ("box",  dict(loc=(0.08,-0.19,1.06), scale=(0.03,0.02,0.06), bevel=0.008), "Hips", "bone", "flat"),                   # 骨白符饰
  ("box",  dict(loc=(0.33,0,1.34), scale=(0.065,0.065,0.13), bevel=0.02, rot=(0,0,-14)), "UpperArm_L", "cultRed", "proj"),
  ("box",  dict(loc=(-0.33,0,1.34), scale=(0.065,0.065,0.13), bevel=0.02, rot=(0,0,14)), "UpperArm_R", "cultRed", "proj"),
  ("box",  dict(loc=(0.51,0,1.16), scale=(0.055,0.055,0.12), bevel=0.015, rot=(0,0,-10)), "Forearm_L", "charcoal", "proj"),
  ("box",  dict(loc=(-0.51,0,1.16), scale=(0.055,0.055,0.12), bevel=0.015, rot=(0,0,10)), "Forearm_R", "charcoal", "proj"),
  ("box",  dict(loc=(0.61,0,1.02), scale=(0.05,0.045,0.06), bevel=0.015), "Hand_L", "charcoal", "flat"),
  ("box",  dict(loc=(-0.61,0,1.02), scale=(0.05,0.045,0.06), bevel=0.015), "Hand_R", "charcoal", "flat"),
  ("box",  dict(loc=(0.135,0,0.34), scale=(0.07,0.07,0.20), bevel=0.015), "Shin_L", "charcoal", "proj"),
  ("box",  dict(loc=(-0.135,0,0.34), scale=(0.07,0.07,0.20), bevel=0.015), "Shin_R", "charcoal", "proj"),
  ("box",  dict(loc=(0.14,-0.05,0.05), scale=(0.075,0.13,0.05), bevel=0.015), "Foot_L", "leather", "flat"),
  ("box",  dict(loc=(-0.14,-0.05,0.05), scale=(0.075,0.13,0.05), bevel=0.015), "Foot_R", "leather", "flat"),
 ],
 "weapon": [  # 宽刃弯刀：刀身大剪影 + 上挑刀尖
  ("box",  dict(loc=(-0.64,-0.01,0.78), scale=(0.035,0.012,0.26), bevel=0.006, rot=(0,-6,0)), "Weapon", "steel", "proj"),
  ("box",  dict(loc=(-0.64,-0.03,0.55), scale=(0.045,0.012,0.10), bevel=0.005, rot=(-28,0,0)), "Weapon", "steel", "proj"),
  ("box",  dict(loc=(-0.64,0,1.00), scale=(0.08,0.02,0.02), bevel=0.005), "Weapon", "armorDk", "flat"),
  ("cyl",  dict(loc=(-0.64,0,1.08), r=0.02, depth=0.13, verts=6), "Weapon", "leather", "flat"),
 ],
 "extra_anchors": [("FxWeapon","Weapon",(-0.64,-0.05,0.52))],
}

CHARS["unflagged"] = {
 "maps_to": ["u1"],
 "animations": {"idle": kf_idle(0.8, 0.9), "move": kf_move(1.0, 0.9), "attack_health": kf_attack_slash(1.3)},
 "pose_previews": [("attack_health", 15, "pose-attack")],
 "body": [
  ("box",  dict(loc=(0,0.145,0.98), scale=(0.26,0.025,0.47), bevel=0.02, rot=(-4,0,0)), "Cloak_2", "cloak", "proj"),     # 斗篷背幅
  ("box",  dict(loc=(0.20,0.10,1.00), scale=(0.10,0.025,0.44), bevel=0.02, rot=(-4,-14,6)), "Cloak_1", "cloak", "proj"), # 侧幅 L
  ("box",  dict(loc=(-0.20,0.10,1.00), scale=(0.10,0.025,0.44), bevel=0.02, rot=(-4,14,-6)), "Cloak_1", "cloak", "proj"),
  ("cone", dict(loc=(0,0.02,1.40), r1=0.30, r2=0.19, depth=0.22, verts=8, open_=True), "Spine1", "cloak", "proj"),       # 肩披
  ("box",  dict(loc=(0,0,1.24), scale=(0.19,0.12,0.17), bevel=0.03), "Spine", "leather", "proj"),                        # 皮甲
  ("box",  dict(loc=(0.02,-0.125,1.26), scale=(0.025,0.012,0.20), bevel=0.004, rot=(0,0,28)), "Spine", "leatherDk", "flat"),  # 交叉绑带
  ("box",  dict(loc=(-0.02,-0.125,1.26), scale=(0.025,0.012,0.20), bevel=0.004, rot=(0,0,-28)), "Spine", "leatherDk", "flat"),
  ("cyl",  dict(loc=(0,-0.145,1.40), r=0.038, depth=0.015, verts=10, rot=(90,0,0)), "Spine1", "steel", "flat"),          # 圆形银扣
  ("cyl",  dict(loc=(0,-0.01,1.08), r=0.19, depth=0.05, verts=8), "Hips", "leatherDk", "flat"),                          # 腰带
  ("box",  dict(loc=(0.24,0,0.96), scale=(0.055,0.075,0.10), bevel=0.012), "Hips", "leather", "proj"),                   # 卷宗匣
  ("box",  dict(loc=(0.24,-0.01,1.06), scale=(0.038,0.05,0.02), bevel=0.004), "Hips", "paper", "flat"),                  # 露出纸卷
  ("ico",  dict(loc=(0,-0.01,1.60), r=0.115, subdiv=2, scale=(0.92,0.95,1.05)), "Head", "skin", "proj"),                 # 头
  ("box",  dict(loc=(0,0.035,1.68), scale=(0.105,0.10,0.075), bevel=0.03, rot=(-8,0,0)), "Head", "hair", "proj"),        # 发块
  ("box",  dict(loc=(0,-0.12,1.575), scale=(0.018,0.02,0.03), bevel=0.006), "Head", "skin", "flat"),                     # 鼻
  ("box",  dict(loc=(0.32,0,1.35), scale=(0.06,0.06,0.12), bevel=0.02, rot=(0,0,-12)), "UpperArm_L", "cloth", "proj"),
  ("box",  dict(loc=(-0.32,0,1.35), scale=(0.06,0.06,0.12), bevel=0.02, rot=(0,0,12)), "UpperArm_R", "cloth", "proj"),
  ("box",  dict(loc=(0.50,0,1.17), scale=(0.052,0.052,0.115), bevel=0.015, rot=(0,0,-8)), "Forearm_L", "leather", "proj"),
  ("box",  dict(loc=(-0.50,0,1.17), scale=(0.052,0.052,0.115), bevel=0.015, rot=(0,0,8)), "Forearm_R", "leather", "proj"),
  ("box",  dict(loc=(0.60,0,1.03), scale=(0.05,0.045,0.06), bevel=0.015), "Hand_L", "skin", "flat"),
  ("box",  dict(loc=(-0.60,0,1.03), scale=(0.05,0.045,0.06), bevel=0.015), "Hand_R", "skin", "flat"),
  ("box",  dict(loc=(0.12,0,0.76), scale=(0.075,0.075,0.19), bevel=0.015), "Thigh_L", "cloth", "proj"),
  ("box",  dict(loc=(-0.12,0,0.76), scale=(0.075,0.075,0.19), bevel=0.015), "Thigh_R", "cloth", "proj"),
  ("box",  dict(loc=(0.135,0,0.34), scale=(0.068,0.068,0.20), bevel=0.015), "Shin_L", "cloth", "proj"),
  ("box",  dict(loc=(-0.135,0,0.34), scale=(0.068,0.068,0.20), bevel=0.015), "Shin_R", "cloth", "proj"),
  ("box",  dict(loc=(0.14,-0.05,0.055), scale=(0.08,0.135,0.055), bevel=0.015), "Foot_L", "boot", "flat"),
  ("box",  dict(loc=(-0.14,-0.05,0.055), scale=(0.08,0.135,0.055), bevel=0.015), "Foot_R", "boot", "flat"),
 ],
 "weapon": [  # 单手剑，低垂后指
  ("box",  dict(loc=(-0.64,0.02,0.80), scale=(0.022,0.010,0.27), bevel=0.004, rot=(0,-4,0)), "Weapon", "steel", "proj"),
  ("cone", dict(loc=(-0.655,0.028,0.52), r1=0.022, r2=0.002, depth=0.08, verts=4, rot=(180,0,0)), "Weapon", "steel", "flat"),
  ("box",  dict(loc=(-0.64,0,1.04), scale=(0.075,0.018,0.018), bevel=0.004), "Weapon", "steel", "flat"),
  ("cyl",  dict(loc=(-0.64,0,1.10), r=0.018, depth=0.11, verts=6), "Weapon", "leatherDk", "flat"),
  ("ico",  dict(loc=(-0.64,0,1.165), r=0.022, subdiv=1), "Weapon", "steel", "flat"),
 ],
 "extra_anchors": [("FxWeapon","Weapon",(-0.655,0.03,0.50))],
}

CHARS["seraphina"] = {
 "maps_to": ["u2"],
 "animations": {"idle": kf_idle(0.6, 0.6), "move": kf_move(0.7, 0.6), "attack_faith": kf_attack_faith()},
 "pose_previews": [("attack_faith", 16, "pose-attack")],
 "emissive": True,
 "body": [
  ("cone", dict(loc=(0,0.02,1.66), r1=0.16, r2=0.03, depth=0.30, verts=8, rot=(-8,0,0)), "Head", "robe", "proj"),        # 兜帽
  ("cone", dict(loc=(0,0.03,1.44), r1=0.29, r2=0.17, depth=0.30, verts=8, open_=True), "Spine1", "robe", "proj"),        # 罩袍肩
  ("cone", dict(loc=(0,0.01,0.92), r1=0.36, r2=0.20, depth=1.06, verts=10, open_=True), "Hips", "robe", "proj"),         # 长袍主体
  ("box",  dict(loc=(0,-0.175,1.02), scale=(0.075,0.02,0.50), bevel=0.01, rot=(3,0,0)), "Hips", "ivory", "proj"),        # 象牙前襟竖条
  ("cone", dict(loc=(0,0.01,0.44), r1=0.365, r2=0.345, depth=0.10, verts=10, open_=True), "Hips", "ivory", "proj"),      # 下摆象牙镶边
  ("cyl",  dict(loc=(0,-0.155,1.38), r=0.035, depth=0.012, verts=10, rot=(90,0,0)), "Spine1", "gold", "flat"),           # 太阳纹章盘
  ("box",  dict(loc=(0,-0.165,1.38), scale=(0.012,0.008,0.055), bevel=0.002), "Spine1", "gold", "flat"),                 # 放射纹 竖
  ("box",  dict(loc=(0,-0.165,1.38), scale=(0.055,0.008,0.012), bevel=0.002), "Spine1", "gold", "flat"),                 # 放射纹 横
  ("cyl",  dict(loc=(0,-0.02,1.12), r=0.19, depth=0.06, verts=8), "Hips", "sash", "flat"),                               # 腰间束带
  ("ico",  dict(loc=(0,-0.01,1.58), r=0.105, subdiv=2, scale=(0.9,0.92,1.02)), "Head", "skin", "proj"),                  # 头
  ("box",  dict(loc=(0,-0.085,1.63), scale=(0.07,0.04,0.06), bevel=0.02), "Head", "hair", "flat"),                       # 前额发
  ("cone", dict(loc=(0.36,0,1.30), r1=0.10, r2=0.065, depth=0.30, verts=7, open_=True, rot=(0,0,14)), "UpperArm_L", "robe", "proj"),  # 喇叭袖 L
  ("cone", dict(loc=(-0.36,0,1.30), r1=0.10, r2=0.065, depth=0.30, verts=7, open_=True, rot=(0,0,-14)), "UpperArm_R", "robe", "proj"),
  ("cone", dict(loc=(0.52,0,1.12), r1=0.09, r2=0.06, depth=0.22, verts=7, open_=True, rot=(0,0,10)), "Forearm_L", "robeDk", "proj"),
  ("cone", dict(loc=(-0.52,0,1.12), r1=0.09, r2=0.06, depth=0.22, verts=7, open_=True, rot=(0,0,-10)), "Forearm_R", "robeDk", "proj"),
  ("cyl",  dict(loc=(0.585,0,1.02), r=0.052, depth=0.05, verts=7), "Hand_L", "ivory", "flat"),                           # 袖口象牙
  ("cyl",  dict(loc=(-0.585,0,1.02), r=0.052, depth=0.05, verts=7), "Hand_R", "ivory", "flat"),
  ("box",  dict(loc=(0.60,-0.01,0.99), scale=(0.045,0.04,0.05), bevel=0.012), "Hand_L", "skin", "flat"),
  ("box",  dict(loc=(-0.60,-0.01,0.99), scale=(0.045,0.04,0.05), bevel=0.012), "Hand_R", "skin", "flat"),
  ("box",  dict(loc=(0.13,0,0.30), scale=(0.07,0.07,0.22), bevel=0.015), "Shin_L", "robeDk", "proj"),
  ("box",  dict(loc=(-0.13,0,0.30), scale=(0.07,0.07,0.22), bevel=0.015), "Shin_R", "robeDk", "proj"),
  ("box",  dict(loc=(0.14,-0.05,0.05), scale=(0.075,0.125,0.05), bevel=0.015), "Foot_L", "sash", "flat"),
  ("box",  dict(loc=(-0.14,-0.05,0.05), scale=(0.075,0.125,0.05), bevel=0.015), "Foot_R", "sash", "flat"),
 ],
 "weapon": [  # 提灯：灯笼 + 发光内芯 + 提手环
  ("box",  dict(loc=(-0.64,-0.02,0.86), scale=(0.055,0.055,0.075), bevel=0.008), "Weapon", "lantern", "proj"),
  ("box",  dict(loc=(-0.64,-0.02,0.86), scale=(0.038,0.038,0.055), bevel=0.006), "Weapon", "glow", "proj"),
  ("cyl",  dict(loc=(-0.64,-0.02,0.95), r=0.028, depth=0.015, verts=8), "Weapon", "gold", "flat"),
  ("torus",dict(loc=(-0.64,-0.02,0.99), R_=0.030, r=0.007, major=10, minor=5), "Weapon", "gold", "flat"),
  ("cyl",  dict(loc=(-0.64,-0.01,1.05), r=0.008, depth=0.10, verts=5), "Weapon", "lantern", "flat"),
 ],
 "extra_anchors": [("FxLantern","Weapon",(-0.64,-0.02,0.86)), ("FxWeapon","Weapon",(-0.64,-0.02,0.86))],
}

CHARS["reina"] = {
 "maps_to": ["u3"],
 "animations": {"idle": kf_idle(1.0, 1.1), "move": kf_move(1.15, 1.0), "attack_health": kf_attack_shoot()},
 "pose_previews": [("attack_health", 14, "pose-attack")],
 "body": [
  ("cone", dict(loc=(0,0.01,1.40), r1=0.33, r2=0.20, depth=0.20, verts=8, open_=True), "Spine1", "shawl", "proj"),       # 钢蓝短披肩
  ("box",  dict(loc=(0.10,-0.13,1.33), scale=(0.09,0.02,0.10), bevel=0.015, rot=(0,0,8)), "Spine1", "shawl", "proj"),    # 披肩前片 L
  ("box",  dict(loc=(-0.10,-0.13,1.33), scale=(0.09,0.02,0.10), bevel=0.015, rot=(0,0,-8)), "Spine1", "shawl", "proj"),
  ("box",  dict(loc=(0,0,1.25), scale=(0.20,0.125,0.16), bevel=0.025), "Spine", "armor", "proj"),                        # 工程胸甲
  ("box",  dict(loc=(0,-0.13,1.27), scale=(0.10,0.015,0.10), bevel=0.008, rot=(0,0,45)), "Spine", "armorDk", "flat"),    # 胸前菱形纹
  ("box",  dict(loc=(0.06,-0.135,1.16), scale=(0.02,0.012,0.14), bevel=0.004, rot=(0,0,-20)), "Spine", "leather", "flat"),
  ("cyl",  dict(loc=(0,-0.01,1.09), r=0.20, depth=0.05, verts=8), "Hips", "leather", "flat"),                            # 工具腰带
  ("cyl",  dict(loc=(0.23,0.02,0.98), r=0.035, depth=0.22, verts=8, rot=(0,0,8)), "Hips", "paper", "flat"),              # 图纸筒
  ("cyl",  dict(loc=(0.23,0.02,1.075), r=0.038, depth=0.025, verts=8, rot=(0,0,8)), "Hips", "leather", "flat"),
  ("box",  dict(loc=(-0.24,0,0.96), scale=(0.07,0.06,0.09), bevel=0.012), "Hips", "leather", "proj"),                    # 工具袋
  ("box",  dict(loc=(-0.26,-0.055,1.02), scale=(0.012,0.01,0.05), bevel=0.003, rot=(0,0,12)), "Hips", "brass", "flat"),  # 扳手挂饰
  ("ico",  dict(loc=(0,-0.01,1.59), r=0.11, subdiv=2, scale=(0.9,0.93,1.02)), "Head", "skin", "proj"),                   # 头
  ("box",  dict(loc=(0,0.03,1.66), scale=(0.10,0.09,0.07), bevel=0.025, rot=(-6,0,0)), "Head", "hair", "proj"),          # 发块
  ("torus",dict(loc=(0.05,-0.095,1.685), R_=0.032, r=0.011, rot=(75,0,0), major=10, minor=5), "Head", "brass", "flat"),  # 护目镜 L
  ("torus",dict(loc=(-0.05,-0.095,1.685), R_=0.032, r=0.011, rot=(75,0,0), major=10, minor=5), "Head", "brass", "flat"), # 护目镜 R
  ("box",  dict(loc=(0,-0.075,1.685), scale=(0.018,0.015,0.012), bevel=0.003), "Head", "brass", "flat"),                 # 镜桥
  ("ico",  dict(loc=(0.10,-0.06,1.50), r=0.042, subdiv=1), "Head", "hair", "flat"),                                      # 麻花辫节 1
  ("ico",  dict(loc=(0.115,-0.05,1.41), r=0.037, subdiv=1), "Shoulder_L", "hair", "flat"),                               # 麻花辫节 2
  ("ico",  dict(loc=(0.125,-0.04,1.33), r=0.031, subdiv=1), "Shoulder_L", "hair", "flat"),                               # 麻花辫节 3
  ("box",  dict(loc=(0.33,0,1.34), scale=(0.065,0.065,0.12), bevel=0.02, rot=(0,0,-13)), "UpperArm_L", "armorDk", "proj"),
  ("box",  dict(loc=(-0.33,0,1.34), scale=(0.065,0.065,0.12), bevel=0.02, rot=(0,0,13)), "UpperArm_R", "armorDk", "proj"),
  ("box",  dict(loc=(0.51,0,1.16), scale=(0.055,0.055,0.115), bevel=0.015, rot=(0,0,-9)), "Forearm_L", "armor", "proj"),
  ("box",  dict(loc=(-0.51,0,1.16), scale=(0.055,0.055,0.115), bevel=0.015, rot=(0,0,9)), "Forearm_R", "armor", "proj"),
  ("box",  dict(loc=(0.60,0,1.02), scale=(0.05,0.045,0.06), bevel=0.015), "Hand_L", "leather", "flat"),
  ("box",  dict(loc=(-0.60,0,1.02), scale=(0.05,0.045,0.06), bevel=0.015), "Hand_R", "leather", "flat"),
  ("box",  dict(loc=(0.12,0,0.76), scale=(0.078,0.078,0.19), bevel=0.015), "Thigh_L", "armorDk", "proj"),
  ("box",  dict(loc=(-0.12,0,0.76), scale=(0.078,0.078,0.19), bevel=0.015), "Thigh_R", "armorDk", "proj"),
  ("box",  dict(loc=(0.135,0,0.34), scale=(0.07,0.07,0.20), bevel=0.015), "Shin_L", "armorDk", "proj"),
  ("box",  dict(loc=(-0.135,0,0.34), scale=(0.07,0.07,0.20), bevel=0.015), "Shin_R", "armorDk", "proj"),
  ("box",  dict(loc=(0.14,-0.05,0.055), scale=(0.085,0.14,0.055), bevel=0.015), "Foot_L", "leather", "flat"),
  ("box",  dict(loc=(-0.14,-0.05,0.055), scale=(0.085,0.14,0.055), bevel=0.015), "Foot_R", "leather", "flat"),
 ],
 "weapon": [  # 轻弩：横向弓臂展开
  ("box",  dict(loc=(-0.64,-0.10,1.02), scale=(0.030,0.16,0.028), bevel=0.006), "Weapon", "wood", "proj"),               # 弩身（前指）
  ("box",  dict(loc=(-0.55,-0.24,1.02), scale=(0.075,0.02,0.016), bevel=0.004, rot=(0,0,0)), "Weapon", "brass", "flat"), # 弓臂 L
  ("box",  dict(loc=(-0.73,-0.24,1.02), scale=(0.075,0.02,0.016), bevel=0.004), "Weapon", "brass", "flat"),              # 弓臂 R
  ("box",  dict(loc=(-0.64,-0.24,1.045), scale=(0.085,0.012,0.006), bevel=0.002), "Weapon", "armorDk", "flat"),          # 弦
  ("box",  dict(loc=(-0.64,-0.02,1.00), scale=(0.02,0.05,0.02), bevel=0.004), "Weapon", "wood", "flat"),                 # 握把
  ("cyl",  dict(loc=(-0.64,-0.13,1.045), r=0.008, depth=0.10, verts=5, rot=(90,0,0)), "Weapon", "steel", "flat"),        # 弩箭槽
 ],
 "extra_anchors": [("FxWeapon","Weapon",(-0.64,-0.26,1.02))],
}

# v2: retain the proven shared rig while improving the readable isometric silhouette.
for cid in ("unflagged", "seraphina", "reina"):
    attack = kf_attack_faith if cid == "seraphina" else (kf_attack_shoot if cid == "reina" else kf_attack_slash)
    CHARS[cid]["animations"].update({
        "attack_health": attack(),
        "attack_faith": attack(),
        "hit_health": kf_hit(),
        "hit_faith": kf_hit(),
        "death_health": kf_death(),
        "death_faith": kf_death(),
        "skill": attack(),
    })

CHARS["unflagged"]["body"].extend([
 ("ico", dict(loc=(0.22,0,1.43), r=0.095, subdiv=2, scale=(1.15,0.9,0.72)), "Shoulder_L", "steel", "proj"),
 ("ico", dict(loc=(-0.22,0,1.43), r=0.095, subdiv=2, scale=(1.15,0.9,0.72)), "Shoulder_R", "steel", "proj"),
 ("cyl", dict(loc=(0.43,0,1.27), r=0.062, depth=0.07, verts=10, rot=(0,0,-8), bevel=0.01), "Forearm_L", "steel", "proj"),
 ("cyl", dict(loc=(-0.43,0,1.27), r=0.062, depth=0.07, verts=10, rot=(0,0,8), bevel=0.01), "Forearm_R", "steel", "proj"),
 ("ico", dict(loc=(0.60,0,1.03), r=0.058, subdiv=2, scale=(0.9,0.72,1.0)), "Hand_L", "skin", "proj"),
 ("ico", dict(loc=(-0.60,0,1.03), r=0.058, subdiv=2, scale=(0.9,0.72,1.0)), "Hand_R", "skin", "proj"),
])
CHARS["unflagged"]["weapon"].extend([
 ("box", dict(loc=(-0.64,0.02,0.80), scale=(0.010,0.015,0.25), bevel=0.003, rot=(0,-4,0)), "Weapon", "paper", "flat"),
 ("torus",dict(loc=(-0.64,0.0,1.04), R_=0.085, r=0.009, rot=(90,0,0), major=12, minor=5), "Weapon", "steel", "flat"),
])

CHARS["seraphina"]["body"].extend([
 ("torus",dict(loc=(0.22,0,1.43), R_=0.075, r=0.014, rot=(90,0,0), major=12, minor=6), "Shoulder_L", "gold", "flat"),
 ("torus",dict(loc=(-0.22,0,1.43), R_=0.075, r=0.014, rot=(90,0,0), major=12, minor=6), "Shoulder_R", "gold", "flat"),
])

CHARS["reina"]["body"].extend([
 ("ico", dict(loc=(0.23,0,1.43), r=0.11, subdiv=2, scale=(1.2,0.95,0.62)), "Shoulder_L", "armor", "proj"),
 ("ico", dict(loc=(-0.23,0,1.43), r=0.11, subdiv=2, scale=(1.2,0.95,0.62)), "Shoulder_R", "armor", "proj"),
 ("cyl", dict(loc=(0.43,0,1.27), r=0.064, depth=0.08, verts=10, rot=(0,0,-9), bevel=0.01), "Forearm_L", "brass", "proj"),
 ("cyl", dict(loc=(-0.43,0,1.27), r=0.064, depth=0.08, verts=10, rot=(0,0,9), bevel=0.01), "Forearm_R", "brass", "proj"),
 ("ico", dict(loc=(0.60,0,1.02), r=0.058, subdiv=2, scale=(0.9,0.72,1.0)), "Hand_L", "leather", "proj"),
 ("ico", dict(loc=(-0.60,0,1.02), r=0.058, subdiv=2, scale=(0.9,0.72,1.0)), "Hand_R", "leather", "proj"),
])
CHARS["reina"]["weapon"].extend([
 ("box", dict(loc=(-0.64,-0.10,1.02), scale=(0.055,0.19,0.012), bevel=0.006), "Weapon", "brass", "flat"),
 ("ico", dict(loc=(-0.64,-0.29,1.02), r=0.035, subdiv=1, scale=(0.7,1.2,0.7)), "Weapon", "steel", "flat"),
])

CHARS["cultist-melee"]["body"].extend([
 ("torus",dict(loc=(0.26,0,1.50), R_=0.075, r=0.016, rot=(90,0,0), major=10, minor=5), "Shoulder_L", "cultRed", "flat"),
 ("torus",dict(loc=(-0.26,0,1.50), R_=0.075, r=0.016, rot=(90,0,0), major=10, minor=5), "Shoulder_R", "cultRed", "flat"),
])

log("character definitions loaded:", list(CHARS.keys()))

# ================= build / render / export pipeline =================
def build_character(cid, cfg):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scn = bpy.context.scene
    scn.render.fps = FPS

    pal = PALETTE[cid]
    img = bpy.data.images.load(os.path.join(TEXDIR, pal["texture"]))
    mat = bpy.data.materials.new("CharMat")
    mat.use_nodes = True
    nt = mat.node_tree; bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = 0.75
    bsdf.inputs["Metallic"].default_value = 0.15
    tex = nt.nodes.new("ShaderNodeTexImage"); tex.image = img
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    if cfg.get("emissive") and pal.get("emissive"):
        eimg = bpy.data.images.load(os.path.join(TEXDIR, pal["emissive"]))
        etex = nt.nodes.new("ShaderNodeTexImage"); etex.image = eimg
        nt.links.new(etex.outputs["Color"], bsdf.inputs["Emission Color"])
        bsdf.inputs["Emission Strength"].default_value = 1.0

    arm, arm_data = build_armature(scn)
    root = bpy.data.objects.new("CharacterRoot", None)
    scn.collection.objects.link(root)
    arm.parent = root
    arm.animation_data_create()

    def build_parts(parts):
        objs = []
        for shape, kw, bone, color, uv in parts:
            o = SHAPES[shape](**kw)
            o.name = "p_%s" % shape
            o.data.materials.append(mat)
            vg = o.vertex_groups.new(name=bone)
            vg.add(list(range(len(o.data.vertices))), 1.0, "REPLACE")
            if color not in pal["cells"]:
                raise KeyError("%s: color '%s' not in palette" % (cid, color))
            assign_uv(o, pal["cells"][color], uv)
            objs.append(o)
        bpy.ops.object.select_all(action="DESELECT")
        for o in objs: o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.object.join()
        return bpy.context.active_object

    body = build_parts(cfg["body"])
    body.name = "Body"
    body.parent = root
    m = body.modifiers.new("Armature", "ARMATURE"); m.object = arm

    weapon = build_parts(cfg["weapon"])
    weapon.name = "Weapon"
    mw = weapon.matrix_world.copy()
    weapon.parent = arm; weapon.parent_type = "BONE"; weapon.parent_bone = "Weapon"
    weapon.matrix_world = mw

    def anchor(name, bone, world_loc):
        e = bpy.data.objects.new(name, None)
        scn.collection.objects.link(e)
        e.parent = arm; e.parent_type = "BONE"; e.parent_bone = bone
        e.matrix_world = mathutils.Matrix.Translation(world_loc)
        return e
    anchor("HeadAnchor","Head",(0,0,1.78))
    anchor("WeaponAnchor","Weapon",(0,0,0))
    anchor("HitAnchor","Spine1",(0,-0.20,1.30))
    anchor("FootAnchor","Root",(0,0,0))
    for name, bone, loc in cfg.get("extra_anchors", []):
        anchor(name, bone, loc)

    for aname, kf in cfg["animations"].items():
        make_action(arm, aname, kf)

    # ground disc for previews (excluded from export via delete before export)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.62, depth=0.06, location=(0,0,-0.031))
    ground = bpy.context.active_object; ground.name = "__ground"
    gmat = bpy.data.materials.new("__groundmat"); gmat.use_nodes = True
    gmat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.09,0.11,0.13,1)
    ground.data.materials.append(gmat)

    # ---- render setup ----
    world = bpy.data.worlds.new("W"); scn.world = world; world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.07,0.09,0.11,1)
    scn.render.engine = "BLENDER_WORKBENCH"
    scn.display.shading.light = "STUDIO"
    scn.display.shading.color_type = "TEXTURE"
    scn.render.resolution_x = scn.render.resolution_y = 512
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    cam.data.type = "ORTHO"; cam.data.ortho_scale = 2.3
    scn.collection.objects.link(cam); scn.camera = cam

    def point_cam(az, el, dist=6.0, target=(0,0,0.95)):
        az_, el_ = R(az), R(el)
        cam.location = (target[0]+dist*math.cos(el_)*math.sin(az_),
                        target[1]-dist*math.cos(el_)*math.cos(az_),
                        target[2]+dist*math.sin(el_))
        d = [target[i]-cam.location[i] for i in range(3)]
        cam.rotation_euler = mathutils.Vector(d).to_track_quat("-Z","Y").to_euler()

    for name,(az,el) in {"front":(0,8),"side":(90,8),"back":(180,8),"iso-ingame":(42,50)}.items():
        point_cam(az, el)
        scn.render.filepath = os.path.join(PREV, "%s-%s.png" % (cid, name))
        bpy.ops.render.render(write_still=True)
    # silhouette (workbench SINGLE flat black, no material pollution)
    ground.hide_render = True
    scn.display.shading.color_type = "SINGLE"
    scn.display.shading.single_color = (0,0,0)
    scn.display.shading.light = "FLAT"
    world.node_tree.nodes["Background"].inputs[0].default_value = (1,1,1,1)
    point_cam(42, 50)
    scn.render.filepath = os.path.join(PREV, "%s-silhouette-iso.png" % cid)
    bpy.ops.render.render(write_still=True)
    ground.hide_render = False
    # restore + 160 thumb
    scn.display.shading.color_type = "TEXTURE"
    scn.display.shading.light = "STUDIO"
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.07,0.09,0.11,1)
    scn.render.resolution_x = scn.render.resolution_y = 160
    point_cam(42, 50)
    scn.render.filepath = os.path.join(PREV, "%s-thumb-160.png" % cid)
    bpy.ops.render.render(write_still=True)
    scn.render.resolution_x = scn.render.resolution_y = 512

    # pose stills
    for aname, frame, tag in cfg.get("pose_previews", []):
        for tr in arm.animation_data.nla_tracks: tr.mute = True
        act = bpy.data.actions[aname]
        arm.animation_data.action = act
        scn.frame_set(frame)
        point_cam(35, 32)
        scn.render.filepath = os.path.join(PREV, "%s-%s.png" % (cid, tag))
        bpy.ops.render.render(write_still=True)
        arm.animation_data.action = None
        for tr in arm.animation_data.nla_tracks: tr.mute = False
    scn.frame_set(1)

    # stats
    body.data.calc_loop_triangles(); weapon.data.calc_loop_triangles()
    tris = len(body.data.loop_triangles) + len(weapon.data.loop_triangles)
    zs = [ (body.matrix_world @ v.co).z for v in body.data.vertices ]
    height = max(zs) - min(zs)

    blend_path = os.path.join(BLEND, "%s.blend" % cid)
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)

    # strip preview-only objects before export
    for o in (ground, cam):
        bpy.data.objects.remove(o, do_unlink=True)

    glb_path = os.path.join(OUTM, "%s.glb" % cid)
    bpy.ops.export_scene.gltf(
        filepath=glb_path, export_format="GLB",
        export_animations=True, export_animation_mode="ACTIONS",
        export_skins=True, export_yup=True, export_apply=True,
        export_cameras=False, export_lights=False, export_extras=True)
    size = os.path.getsize(glb_path)
    log("%s: tris=%d height=%.3f bones=%d bytes=%d" % (cid, tris, height, len(arm_data.bones), size))
    return {
        "id": cid, "file": "%s.glb" % cid, "mapsTo": cfg["maps_to"],
        "modelHeight": round(height, 3),
        "targetWorldHeight": 1.38,
        "visualScale": round(1.38 / height, 4),
        "triangles": tris, "bones": len(arm_data.bones),
        "materials": 1, "drawCalls": 2, "bytes": size,
        "animations": sorted(cfg["animations"].keys()),
        "anchors": ["HeadAnchor","WeaponAnchor","HitAnchor","FootAnchor"] + [a[0] for a in cfg.get("extra_anchors", [])],
        "textures": [pal["texture"]] + ([pal["emissive"]] if cfg.get("emissive") and pal.get("emissive") else []),
        "blend": "blender/%s.blend" % cid,
    }

manifest = {"version": 1, "generated": "2026-07-23", "units": "meters, glTF Y-up, +Z forward, feet at origin",
            "scalePolicy": "visualScale normalizes model to targetWorldHeight at load time; never baked into GLB",
            "characters": []}
for cid, cfg in CHARS.items():
    manifest["characters"].append(build_character(cid, cfg))
with open(os.path.join(OUTM, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)
log("manifest.json written; ALL DONE")
