import os
import re

CSS_DIR = "c:/Users/hinda/Downloads/Loksetu-with-ML-main/Loksetu-with-ML-main/client/admin/src"

REPLACEMENTS = [
    # Background whites / light grays overriding cards
    (r"background(-color)?:\s*(#fff|#ffffff|white)\s*;", r"background\1: var(--bg-card);"),
    # Background darks overriding cards
    (r"background(-color)?:\s*(#1a1a24|#1E1E30|#0f0f1a)\s*;", r"background\1: var(--bg-card);"),
    # Text whites
    (r"color:\s*(#fff|#ffffff|white)\s*;", r"color: var(--text-primary);"),
    # Text darks
    (r"color:\s*(#000|#000000|black|#0F0F1A|#0f0f1a)\s*;", r"color: var(--text-primary);"),
    # Common border overrides
    (r"border(-color)?:\s*(rgba\([^)]+\)|#[a-fA-F0-9]{3,6})\s*;", r"border\1: var(--border-strong);"),
    # Primary colorful text overrides that break contrast, standardizing them to primary
    (r"color:\s*(#e05c3a|#c0472a)\s*;", r"color: var(--color-primary);"),
    # Soft background rbga like rgba(217, 79, 43, 0.12)
    (r"background(-color)?:\s*rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\.[0-1]\d*\s*\)\s*;", r"background\1: var(--bg-soft);"),
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for pattern, repl in REPLACEMENTS:
        # Avoid targeting standard CSS that is correct like bg-card definitions 
        # But wait, index.css and theme.css and App.css are fine. Let's just avoid root/data-theme.
        # Actually it's easier to just skip theme.css and index.css
        if filepath.endswith('theme.css') or filepath.endswith('index.css') or filepath.endswith('ThemeContext.js'):
            return
        new_content = re.sub(pattern, repl, new_content, flags=re.IGNORECASE)
        
    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(CSS_DIR):
    for file in files:
        if file.endswith(".css"):
            process_file(os.path.join(root, file))

print("Done cleaning CSS")
