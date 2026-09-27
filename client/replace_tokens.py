import os

dir_path = r'c:\MINI PROJECT LOKSETU\client\admin\src'

replace_map = {
    'var(--ink)': 'var(--bg-main)',
    'var(--ink-soft)': 'var(--bg-soft)',
    'var(--surface)': 'var(--bg-card)',
    'var(--cream)': 'var(--text-primary)',
    'var(--white)': 'var(--text-primary)',
    'var(--gold)': 'var(--color-accent)',
    'var(--gold-light)': 'var(--color-accent)',
    'var(--teal)': 'var(--color-primary)',
    'var(--teal-light)': 'var(--color-primary-hover)',
    'var(--color-text-inverse)': 'var(--text-primary)',
    'var(--color-bg)': 'var(--bg-main)',
    'var(--accent)': 'var(--color-primary-hover)',
    '--color-highlight': '--color-primary',
    '#22C55E': 'var(--color-primary)',
    '#4ADE80': 'var(--color-accent)'
}

for root, dirs, files in os.walk(dir_path):
    for f in files:
        if f.endswith('.css') or f.endswith('.js') or f.endswith('.jsx'):
            file_path = os.path.join(root, f)
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            new_content = content
            for old, new in replace_map.items():
                new_content = new_content.replace(old, new)
                
            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print(f"Updated: {file_path}")
