# The Memory Nook

A small 3D home for memories. Keep a photo and a note, shape a keepsake, find it a place, and revisit its story.

Run locally with Python 3: `python serve.py`, then open the address printed in the terminal. No installation or build is required. App source is in `dist/` (including vendored Three.js and its license).

Demo: twelve distinct credited photographs form eight books and four cushions. Example stories are fictional. Each photo has one displayed object; reassigning it moves its association. The garden includes movable props and a memory pond. Switch to 花园与池塘, select 让一个片刻游起来, and choose a memory. Tap water to beckon its fish; tap the fish to revisit the source. Geometry templates and local photo color sampling are implemented; online AI generation is not.

Your photos, notes and layout stay in this browser. Export/import a complete backup in the app to transfer your personal home to another device. Source code does not contain your saved memories.

## GitHub Pages

In Settings → Pages, choose GitHub Actions as the source. Push this source to `main`. The included workflow checks data rules and static assets, then deploys `dist/`. Get the public URL from the successful deployment. Each subsequent push updates the demo. This does not synchronize private browser data.

Checks: `node --test tests/*.test.mjs` and `node scripts/check-assets.mjs` (Node 24). Browser and phone interactions still need separate acceptance testing.

Photography attribution and reuse information: `docs/photo-credits.json`. Three.js license: `dist/vendor/THREE-LICENSE.txt`.
