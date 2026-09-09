"""Export reviewed application and project records, excluding private data and hosting."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import sys

root = Path(__file__).resolve().parents[1]
output = Path(sys.argv[1]).resolve()
files = []
for directory in ("dist", "tests", "docs/audits"):
    files.extend(p for p in (root / directory).rglob("*") if p.is_file())
files.extend((root / "docs").glob("*.md"))
files.extend(root / p for p in (
    ".github/workflows/pages.yml",
    "scripts/check-assets.mjs",
    "scripts/audit-baseline.mjs",
    "scripts/public-snapshot.py",
    "serve.py",
    "docs/photo-credits.json",
    "README.md",
    "AGENTS.md",
    "PROJECT_BRIEF.md",
    "CURRENT_SLICE.md",
    "DECISIONS.md",
    "CHANGELOG.md",
    "PROGRESS.md",
    "ROADMAP.md",
))
output.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(output, "w", ZIP_DEFLATED) as archive:
    for file in sorted(set(files)):
        if file.is_symlink():
            raise ValueError("Symlink not allowed in public snapshot")
        archive.write(file, file.relative_to(root))
print(f"Prepared {len(set(files))} public files: {output}")
