# Local model import — 2026-11-09

Source: `~/Downloads/all files/*_klein.glb`. Original GLBs remain in `public/models`; updated catalog entries use new filenames to avoid stale browser caches and allow rollback.

| Catalog item | Source | Old triangles | New triangles |
| --- | --- | ---: | ---: |
| 1750 | hose_1750_grau_klein.glb | 347,628 | 300,004 |
| 3340 | sweatshirt_pro_dgrau_klein.glb | 86,542 | 700,000 |
| 3362 | sweatjacke_reissverschluss_schwarz_klein.glb | 99,960 | 300,128 |
| 4890 | jacke_4890_klein.glb | 144,680 | 299,999 |
| WHE00113 | Original sobral-whe00113.glb restored | 297,072 | 297,072 |
| 1751 (new) | hose_1751_schwarz_klein.glb | — | 214,795 |
| HAKRO Polo (new) | hakro_polo_blau_klein.glb | — | 300,415 |
| Worker original | sobral-worker.glb (unchanged) | 760,748 | 760,748 |

Counts are triangles, not pre-triangulation Blender polygons. Original worker SHA256: `02ca9f580ae04363084dffc1660cb875f5604744741a70f51168b342faf01938`.

The original worker has four source meshes (five at runtime after the existing boots split). The single-mesh comparison import was removed at the user's request, including its GLB and catalog entry. Saved catalog data cannot resurrect the removed product; a stale active product selection falls back to an existing item.

## Constraints

Imported models have baked textures and one editable body material (`Material_0`, or `helm` for the helmet). Explicit `colorMaterials` bindings connect that material to the primary picker. Its base-color texture is converted once to a neutral luminance detail map so the original blue/black does not multiply the selected hue; normal and roughness maps are retained. Separate labels keep their original textures. There is no independently editable collar, sleeve or strap in these scans.

`src/core/materialColors.js` is the shared source of truth for material-to-color bindings. UI controls are filtered against actual loaded materials. The legacy texture-generated shirt exposes only the selected pattern's used zones (`PATTERNS.colorZones`): raglan/hex have primary, accent and collar; solid has primary and collar; Vexa/racing/gradient additionally use secondary. Switching patterns resets an unavailable active picker to a valid zone. Multi-mesh products do not show nonfunctional procedural patterns. The original worker retains its four separate controls and untouched face/skin texture. The KASK helmet was reverted to the original segmented `sobral-whe00113.glb` after the scan's appearance and loss of independent parts were rejected. It has three working color controls (shell; accent hardware/embossing; straps/headband/dark hardware), retains its component visibility toggles, and bypasses scan texture normalization.

Garment print-zone positions and old reference preview images have not been recalibrated; these require separate visual validation.

The unused imported helmet scan requires Draco; decoder files remain locally available in `public/draco` for compressed model support. The active original helmet does not use the scan.

## Loading feedback and duplicate-load fix

`ModelLoadingIndicator` covers the viewport during download and preparation. It reports real bytes/percent when Content-Length is available, switches to an indeterminate preparation stage, and hides only after the first rendered frame. Network/processing errors offer Retry. Stale callbacks cannot overwrite the latest selection's status; unused parsed models are disposed.

Dropdown selection previously called the switch handler twice: via catalog listeners and an explicit callback. The explicit callback was removed, and stale asynchronous product switches are ignored. Geometry and texture resolution are not reduced. Imported garment files remain approximately 9–27 MB, so first-load download/parsing cost still exists.

`node tests/model-loading.mjs` checks a delayed first load, progress/preparation, exactly one load per dropdown selection, rapid switching, and simulated download failure followed by successful retry.

## Build and test

```sh
bash '/Volumes/WORK/var/www/sobral-magento/scripts/build-customizer.sh'
cp -R dist/. '/Volumes/WORK/var/www/sobral-magento/pub/customizer/'
node tests/model-import.mjs
```

Browser test loads all 12 catalog products at `http://localhost:8080/customizer/`, changes every available picker to red and blue, checks bound material colors, validates actual UI attributes, confirms neutral texture detail maps on scans and the original worker's unchanged face/skin, and checks that the removed comparison product cannot reappear from local storage. For all six procedural patterns it renders a baseline texture and changes each of the four possible color fields independently: visible fields must change pixels and hidden fields must not. It verifies switching away from an active unsupported color zone resets the picker, then selects the last dropdown item and checks that reopening retains scroll and keeps the active item visible. Requires local Google Chrome and the project's Puppeteer dependency.
