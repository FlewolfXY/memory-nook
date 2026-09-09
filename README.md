# The Memory Nook

A small 3D home for memories. Keep a photo and a note, shape a keepsake, find it a place, and revisit its story.

Run locally with Python 3: `python serve.py`, then open the address printed in the terminal. No installation or build is required. App source is in `dist/` (including vendored Three.js and its license).

Demo: a fictional resident, 阿禾, has just moved in. A moving box, canvas tote, repaired rabbit, worn books, cushions, mug and borrowed plant carry connected everyday stories. Three generated phone snapshots depict moving day, a shared meal and reading at the new window. Each image has one displayed object. Examples are clearly labeled, and edited personal records are preserved during migration. A flat pastel garden path leads outside; click the hinged door to return. The pond retains two source-linked fish. Geometry templates and photo color sampling are local; online AI generation is not connected.


Your photos, notes and layout stay in this browser. Export/import a complete backup in the app to transfer your personal home to another device. Source code does not contain your saved memories.

## GitHub Pages

In Settings → Pages, choose GitHub Actions as the source. Push this source to `main`. The included workflow checks data rules and static assets, then deploys `dist/`. Get the public URL from the successful deployment. Each subsequent push updates the demo. This does not synchronize private browser data.

Checks: `node --test tests/*.test.mjs` and `node scripts/check-assets.mjs` (Node 24). Browser and phone interactions still need separate acceptance testing.

Photography attribution and reuse information: `docs/photo-credits.json`. Three.js license: `dist/vendor/THREE-LICENSE.txt`.
