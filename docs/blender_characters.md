

## Setup

Import character `.fbx` and mixamo exported `.fbx`

1. Go to Object Mode
2. Select the `mixamo armature`
3. Select the `character mesh`

Armature must be the active object (yellow highlight).

Outliner order matters.

Press `CTRL - P` and `Armature Deform` with **Automatic Weights**

## Multiple Animations

---

# THE SIMPLE PIPELINE

## Step 1 — Choose ONE base animation from Mixamo

Pick any (Idle is good).

Download:

**Format:** FBX
**Skin:** **With Skin**

This gives you:

* Mesh
* Skeleton
* Animation
* Correct bone names

This becomes your **MASTER RIG FILE**.

---

## Step 2 — Import that into Blender

You now have:

* Mesh already skinned
* Proper Mixamo skeleton
* One working animation

DO NOT DELETE THIS ARMATURE EVER.

This is now your character.

---

## Step 3 — Get more animations (correct way)

For every other animation:

Download from Mixamo:

**Without Skin**

These files contain:

* Same bone names
* Only animation data

---

## Step 4 — Import animation FBX

Import.

You will see:

```
Armature.001  ← temporary
```

This rig is IDENTICAL to your master rig.

Name the Animation under Armature

---

## Step 5 — Copy animation in ONE CLICK

Select **Armature** (your main rig)

Go to:

**Object** Object Properties (Orange Square) → **Animation** → Action dropdown

Choose the animation from Armature.001.

It works instantly because bone names match.

No retargeting. No vertex groups. No rebinding.

---

## Step 6 — Delete the temporary rig

Delete Armature.001.

Animation stays stored as an Action.

---

## Step 7 — Push to NLA

Push Down → repeat for each animation.

When you click Push Down, Blender takes the current animation (Action) and:

• Stores it as a strip in the NLA Editor
• Frees the Action Editor so you can load another animation
• Keeps the animation saved in the file

### Think of it like:

Saving a clip to the animation library shelf.

### Blender has two animation states:

- Action Editor: The animation currently active
- NLA Editor: Stored animations (clips)

**GLB exporter reads NLA strips as separate animation clips.**

### If you do NOT push down:

Only the currently active animation exports.

---

## Step 8 — Export GLB

GLTF exporter reads NLA strips as separate clips.

Three.js can now do:

```
mixer.clipAction('Idle')
mixer.clipAction('Walk')
mixer.clipAction('Talking')
```

---

# Why you struggled

You tried to:

* Mix Synty game rigs
* Rebind meshes
* Transfer actions between different skeletons

That is advanced retargeting. Not needed.

---

# The rule that fixes everything

**Only ONE Mixamo rig should ever skin the mesh.**

All other Mixamo files are just animation data donors.

---

If you want, I can give you the Three.js animation switching code next.
