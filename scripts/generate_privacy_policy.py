#!/usr/bin/env python3
"""Render the canonical Markdown privacy policy as a GitHub Pages HTML document."""

from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "legal" / "PRIVACY_POLICY.md"
TARGET = ROOT / "docs" / "privacy.html"

css = """
:root { color-scheme: light; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 860px; margin: 0 auto; padding: 24px; }
h1 { font-size: 2em; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
h2 { font-size: 1.4em; margin-top: 32px; color: #111827; }
h3 { font-size: 1.1em; }
table { border-collapse: collapse; width: 100%; margin: 16px 0; display: block; overflow-x: auto; }
th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; font-size: 0.95em; }
th { background: #f3f4f6; }
a { color: #1d4ed8; }
.meta { color: #6b7280; font-size: 0.95em; margin-bottom: 24px; }
@media (max-width: 640px) { body { padding: 16px; } th, td { padding: 7px 9px; } }
""".strip()

source_text = SOURCE.read_text(encoding="utf-8")
body = markdown.markdown(source_text, extensions=["tables", "sane_lists"])
html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="index,follow">
<title>Privacy Policy - The Ice Cream Man</title>
<style>{css}</style>
</head>
<body>
{body}
</body>
</html>
'''

TARGET.parent.mkdir(parents=True, exist_ok=True)
TARGET.write_text(html, encoding="utf-8")
print(f"Generated {TARGET.relative_to(ROOT)} from {SOURCE.relative_to(ROOT)}")
