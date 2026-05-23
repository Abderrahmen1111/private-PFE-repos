import re
import sys

path = r'C:\Users\INFOKOM\Desktop\private-PFE-repos\SEQUENCE_DIAGRAMS_WORD_FORMAT_OPTIMIZED.md'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# We just find all mermaid sequenceDiagram blocks and get their preceding ## title
diagrams = []
blocks = content.split('```mermaid\nsequenceDiagram')
for i, block in enumerate(blocks[1:]):
    # the title is in blocks[i] (the text before this mermaid block)
    # let's find the last ## ... line in blocks[i]
    title_matches = re.findall(r'## [^\n]+', blocks[i])
    if title_matches:
        title = title_matches[-1]
    else:
        title = "Unknown Title"
    
    # the mermaid code is from the start of block until ```
    mermaid_code = 'sequenceDiagram' + block.split('```')[0]
    
    print(f"{i}: {title}")
