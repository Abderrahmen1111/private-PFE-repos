import re

input_path = r'C:\Users\INFOKOM\Desktop\private-PFE-repos\CHAPITRE3_CONCEPTION.md'
output_path = r'C:\Users\INFOKOM\Desktop\private-PFE-repos\CHAPITRE3_SANS_SEQUENCE.md'

with open(input_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Regex to find mermaid sequence diagram blocks
# Match from ```mermaid\nsequenceDiagram up to the next ```
pattern = r'```mermaid\nsequenceDiagram\n(.*?)```'

def generate_table_from_mermaid(match):
    mermaid_code = match.group(1)
    lines = mermaid_code.split('\n')
    
    table_lines = [
        "| Étape | Acteur / Composant Source | Action / Message | Cible |",
        "|---|---|---|---|"
    ]
    
    step = 1
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('participant') or line.startswith('actor') or line.startswith('Note'):
            continue
        
        # Match Arrow: Source->>Target: Message
        # Matches ->>, -->>, ->, -->
        arrow_match = re.search(r'^(.*?)(--?>>?)(.*?):\s*(.*)$', line)
        if arrow_match:
            source = arrow_match.group(1).strip()
            arrow = arrow_match.group(2).strip()
            target = arrow_match.group(3).strip()
            action = arrow_match.group(4).strip()
            
            # Clean up source/target names if they are Aliases
            table_lines.append(f"| {step} | **{source}** | {action} | **{target}** |")
            step += 1
        elif line.startswith('alt') or line.startswith('else') or line.startswith('opt') or line.startswith('par') or line.startswith('and'):
            # Just add a row for the condition
            condition = line.replace('alt ', 'Condition : ').replace('else ', 'Sinon : ').replace('opt ', 'Optionnel : ').replace('par ', 'Parallèle : ').replace('and ', 'Et : ')
            table_lines.append(f"| - | *Système* | *{condition}* | - |")
            
    return '\n'.join(table_lines) + '\n'

new_content = re.sub(pattern, generate_table_from_mermaid, content, flags=re.DOTALL)

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("CHAPITRE3_SANS_SEQUENCE.md generated successfully with fixed regex!")
