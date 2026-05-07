import re

with open('RAPPORT_CHAPITRE3.md', 'r', encoding='utf-8') as f:
    content = f.read()

def replacer(match):
    header = match.group(0)
    title = match.group(1).strip()
    placeholder = "\n\n![Capture d'écran : " + title + "](chemin/vers/image.png)\n*Figure : " + title + "*\n"
    return header + placeholder

# Match headers like #### 1.1 Interface...
new_content = re.sub(r'#### \d+\.\d+ ([^\n]+)', replacer, content)

with open('RAPPORT_CHAPITRE3.md', 'w', encoding='utf-8') as f:
    f.write(new_content)
