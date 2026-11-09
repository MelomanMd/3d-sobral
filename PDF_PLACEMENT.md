# Placement PDF: model reference, not calibrated production dimensions

The previous exporter converted offsets with `offset * 0.5` and guessed logo dimensions with `scale * 8.5/5 cm`. These values were unrelated to surface geometry. Those estimates have been removed.

## Current report

- `productionReport.js` snapshots the current configuration and waits for fonts, clean texture generation and decal generation.
- Actual live decal geometry/textures are reused for multi-mesh garments and the segmented worker/helmet. UV-textured shirts reuse the exact `TextureEngine.drawLogo/drawText` methods.
- Four independent orthographic cameras capture front/back/left/right. They never change the interactive camera. The exporter no longer captures views concurrently using one mutable camera.
- For each artwork and view, an isolated alpha-mask render measures the visible ink. Depth-only model geometry occludes the far side. Transparent margins and text-canvas padding are excluded; no size is inferred from a generic logo aspect ratio.
- Each large diagram shows the projected model bounding rectangle, its upper-left origin, numbered ink bounds and center crosshairs. The table gives center X/Y and visible axis-aligned width/height as percentages of the projected model width/height. Positions therefore refer to a particular view, not UV offsets or seam distances.
- Measurement resolution is one render pixel (1200 px per view by default). Semi-transparent alpha below 0.05 is excluded. Occluded portions are not measured in that view.
- Items not visible in any of the four views are explicitly marked as not approved, rather than receiving invented dimensions.
- Wireframe, component visibility, renderer state and selection textures are restored after capture, including error paths. Changing the configuration during capture aborts instead of mixing different designs.
- Concurrent asynchronous decal rebuilds are generation-guarded to prevent old image loads from adding duplicate/stale decals.
- The PDF includes only supported color controls. RAL/Pantone remain labeled as approximations. Quantities are supplied by the user, not fabricated defaults.

## Important boundary

There are no verified physical garment dimensions or production datum points in the catalog. PDF image page sizes (A4/mm) do **not** imply that the rendered object is at physical 1:1 scale. The report is explicitly labeled as an uncalibrated model placement reference, not a millimeter-based manufacturing release. Physical print dimensions and seam offsets require real measurements/calibration for the selected article and size.

## Validation

`node tests/pdf-placement.mjs` runs a temporary local Vite server and browser checks for:

- UV shirt, updated scanned sweatshirt, segmented worker and original helmet;
- front logo and back text, rotation, offsets and transparent artwork margins;
- measurement formulas and unchanged interactive camera/renderer;
- concurrent decal updates without duplicates;
- refusal to export an incompletely loaded model;
- measured ink bounds matching actual rendered-image differences;
- missing-placement warnings and no false physical calibration;
- generated multi-page PDF with four large diagrams.

Test files are saved to `/tmp/sobral-placement-test.pdf` and `/tmp/sobral-placement-detail.pdf` for visual review. PDF image streams are losslessly compressed and reused between overview and detail pages.
