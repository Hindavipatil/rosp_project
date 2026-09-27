import os
import re

dir_path = r'c:\MINI PROJECT LOKSETU\client\admin\src'

for root, dirs, files in os.walk(dir_path):
    for f in files:
        if f.endswith('.css') or f.endswith('.js') or f.endswith('.jsx'):
            file_path = os.path.join(root, f)
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # replace text colors
            new_content = re.sub(r'color:\s*rgba\(255,\s*255,\s*255,\s*0\.\d+\)', 'color: var(--text-secondary)', content)
            new_content = re.sub(r'color:\s*rgba\(0,\s*0,\s*0,\s*0\.\d+\)', 'color: var(--text-secondary)', new_content)
            
            # replace backgrounds
            new_content = re.sub(r'background:\s*rgba\(255,\s*255,\s*255,\s*0\.\d+\)', 'background: var(--bg-card)', new_content)
            new_content = re.sub(r'background:\s*rgba\(0,\s*0,\s*0,\s*0\.\d+\)', 'background: var(--bg-card)', new_content)
            
            # replace background-color
            new_content = re.sub(r'background-color:\s*rgba\(255,\s*255,\s*255,\s*0\.\d+\)', 'background-color: var(--bg-card)', new_content)
            
            # replace borders
            new_content = re.sub(r'border([^:]*):\s*(.*?|\s*)rgba\(255,\s*255,\s*255,\s*0\.\d+\)', r'border\1: \2var(--border-soft)', new_content)
            new_content = re.sub(r'border([^:]*):\s*(.*?|\s*)rgba\(0,\s*0,\s*0,\s*0\.\d+\)', r'border\1: \2var(--border-soft)', new_content)

            # fix specific AdminHome issues
            new_content = new_content.replace('.action-card svg { color: var(--color-accent);', '.action-card svg { color: var(--color-primary);')
            
            # fix action card background hover
            new_content = new_content.replace('.action-card:hover {\n  background: rgba(255, 255, 255, 0.055);', '.action-card:hover {\n  background: var(--bg-soft);')

            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print(f"Updated: {file_path}")
