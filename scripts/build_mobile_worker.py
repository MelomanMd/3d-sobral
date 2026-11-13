"""Build a mobile worker mannequin while keeping its editable mesh roles.

Run with:
    blender --background --python scripts/build_mobile_worker.py -- \
      public/models/sobral-worker.glb public/models/sobral-worker-mobile-hq.glb
The geometry is moderately reduced in Blender. Original 2048px textures are
retained to keep logos, face and fabric detail sharp on high-density screens.
"""

import sys
from pathlib import Path

def triangle_count(mesh):
    return sum(len(poly.vertices) - 2 for poly in mesh.polygons)


def optimize_geometry(source, destination):
    import bpy

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(source))
    ratios = {
        "Worker_fabric_primary": 0.30,
        "Worker_helmet": 0.50,
        "Worker_neutral": 0.70,
        "Worker_trousers": 0.30,
    }
    meshes = {obj.name: obj for obj in bpy.data.objects if obj.type == "MESH"}
    missing = ratios.keys() - meshes.keys()
    if missing:
        raise RuntimeError(f"Source mesh roles missing: {sorted(missing)}; found {sorted(meshes)}")

    for name, ratio in ratios.items():
        obj = meshes[name]
        before = triangle_count(obj.data)
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        modifier = obj.modifiers.new("Mobile LOD", "DECIMATE")
        modifier.ratio = ratio
        bpy.ops.object.modifier_apply(modifier=modifier.name)
        after = triangle_count(obj.data)
        print(f"{name}: {before:,} -> {after:,} triangles")

    bpy.ops.export_scene.gltf(filepath=str(destination), export_format="GLB")


if __name__ == "__main__":
    args = sys.argv[sys.argv.index("--") + 1:]
    if len(args) != 2:
        raise SystemExit("Expected source.glb destination.glb")
    source, destination = map(Path, args)
    destination.parent.mkdir(parents=True, exist_ok=True)
    optimize_geometry(source.resolve(), destination.resolve())
    print(f"Final mobile GLB: {destination.stat().st_size / 1024**2:.1f} MiB")
