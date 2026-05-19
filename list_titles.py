import re

path = r'C:\Users\INFOKOM\Desktop\private-PFE-repos\SEQUENCE_DIAGRAMS_WORD_FORMAT_OPTIMIZED.md'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

matches = re.finditer(r'## (\d+).*', content)
for m in matches:
    print(m.group(0))

print("---")
matches = re.finditer(r'## 🤖.*', content)
for m in matches:
    print(m.group(0))
