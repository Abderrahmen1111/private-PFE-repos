import re
import os

# Paths
chapitre3_path = r'C:\Users\INFOKOM\Desktop\private-PFE-repos\CHAPITRE3_CONCEPTION.md'
optimized_diagrams_path = r'C:\Users\INFOKOM\Desktop\private-PFE-repos\SEQUENCE_DIAGRAMS_WORD_FORMAT_OPTIMIZED.md'
output_path = r'C:\Users\INFOKOM\Desktop\private-PFE-repos\CHAPITRE3_FINAL_OPTIMISE.md'

# 1. Read Chapter 3 base text (Sections 3.1 to 3.4)
with open(chapitre3_path, 'r', encoding='utf-8') as f:
    c3_content = f.read()

base_text_match = re.search(r'(.*?)(## 3\.5 Conception)', c3_content, flags=re.DOTALL)
if base_text_match:
    base_text = base_text_match.group(1).strip()
else:
    print("Could not find base text.")
    exit(1)

# 2. Extract Optimized Diagrams using block splitting
with open(optimized_diagrams_path, 'r', encoding='utf-8') as f:
    opt_content = f.read()

diagrams = {}
blocks = opt_content.split('```mermaid\nsequenceDiagram')
for i, block in enumerate(blocks[1:]):
    # the title is in blocks[i] (the text before this mermaid block)
    title_matches = re.findall(r'## [^\n]+', blocks[i])
    title = title_matches[-1] if title_matches else f"Workflow {i}"
    
    # Clean the title (remove emoji and numbers for a cleaner look)
    clean_title = re.sub(r'^## \d+.*? ', '', title)
    
    # the mermaid code is from the start of block until ```
    mermaid_code = 'sequenceDiagram' + block.split('```')[0]
    
    diagrams[i] = {
        'title': clean_title,
        'mermaid': mermaid_code.strip()
    }

def generate_table(mermaid_code):
    lines = mermaid_code.split('\n')
    table_lines = [
        "| Étape | Acteur / Système Source | Action / Message | Cible |",
        "|---|---|---|---|"
    ]
    step = 1
    for line in lines:
        line = line.strip()
        if not line or line.startswith('participant') or line.startswith('actor') or line.startswith('Note') or line.startswith('box') or line.startswith('end'):
            continue
        
        arrow_match = re.search(r'^(.*?)(--?>>?)(.*?):\s*(.*)$', line)
        if arrow_match:
            source = arrow_match.group(1).strip()
            target = arrow_match.group(3).strip()
            action = arrow_match.group(4).strip()
            action = re.sub(r'<[^>]+>', ' ', action).replace('|', '-')
            
            table_lines.append(f"| {step} | **{source}** | {action} | **{target}** |")
            step += 1
        elif line.startswith('alt') or line.startswith('else') or line.startswith('opt') or line.startswith('par') or line.startswith('and') or line.startswith('loop'):
            condition = line.replace('alt ', 'Condition : ').replace('else ', 'Sinon : ').replace('opt ', 'Option : ').replace('par ', 'Parallèle : ').replace('and ', 'Et : ').replace('loop ', 'Boucle : ')
            condition = condition.replace('|', '-')
            table_lines.append(f"| - | *Système* | *{condition}* | - |")
            
    return '\n'.join(table_lines)

# 3. Build Section 3.5
sprints_def = [
    ("RELEASE 1 : Fondation & Authentification", [
        ("Sprint 1 : Authentification & Profils", [0, 1, 2]),
        ("Sprint 2 : Intégration Commerçant & Back-Office Admin", [3, 4, 5])
    ]),
    ("RELEASE 2 : E-Commerce & Catalogue", [
        ("Sprint 3 : Gestion du Shop (Produits & Services)", [6, 7, 10, 11]),
        ("Sprint 4 : Commandes & Validation", [8, 9])
    ]),
    ("RELEASE 3 : Expérience Sociale & Contenu", [
        ("Sprint 5 : Interaction Sociale & Découverte", [15, 16]),
        ("Sprint 6 : Avis & Messagerie Client", [17, 18])
    ]),
    ("RELEASE 4 : Intelligence Artificielle & Recherche Avancée", [
        ("Sprint 7 : Moteurs de Recherche Intelligente", [12, 13, 14]),
        ("Sprint 8 : Assistant Conversationnel et Analytics IA", [21, 22, 23, 19])
    ]),
    ("RELEASE 5 : Administration & Support SaaS", [
        ("Sprint 9 : Modération & Tableaux de bord", [20, 24]),
        ("Sprint 10 : Support Client & Notifications", [25, 26])
    ])
]

section_3_5 = "\n\n## 3.5 Conception Technique Détaillée (Workflows et Diagrammes de Séquence)\n\n"
section_3_5 += "Cette section détaille la conception technique de chaque fonctionnalité, organisée par Release et par Sprint. Pour chaque workflow, un **tableau descriptif complet** des étapes est fourni, suivi du **diagramme de séquence optimisé** illustrant l'architecture exacte de la plateforme (interactions entre l'App Web/Mobile, Supabase, Django Admin, et les API Tierces d'Intelligence Artificielle).\n\n"

for release_title, sprints in sprints_def:
    section_3_5 += f"### {release_title}\n\n"
    for sprint_title, diagram_ids in sprints:
        section_3_5 += f"#### {sprint_title}\n\n"
        for did in diagram_ids:
            if did in diagrams:
                diag = diagrams[did]
                title = diag['title']
                mermaid = diag['mermaid']
                table = generate_table(mermaid)
                
                section_3_5 += f"**Workflow : {title}**\n\n"
                section_3_5 += "**1. Description des étapes :**\n\n"
                section_3_5 += table + "\n\n"
                section_3_5 += "**2. Diagramme de séquence :**\n\n"
                section_3_5 += "```mermaid\n" + mermaid + "\n```\n\n---\n\n"

final_content = base_text + section_3_5

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(final_content)

print(f"CHAPITRE3_FINAL_OPTIMISE.md generated successfully with {len(diagrams)} diagrams embedded and tabulated!")
