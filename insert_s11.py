with open(r'C:\Users\INFOKOM\Desktop\private-PFE-repos\SEQUENCE_DIAGRAMS_WORD_FORMAT_OPTIMIZED.md', 'r', encoding='utf-8') as f:
    content = f.read()

s12_pos = content.find('# \U0001f6e1\ufe0f SECTION 12')

section11_header = (
    "# \U0001f916 SECTION 11 : ANALYSE IA (SENTIMENT & PROMOTIONS)\n\n"
    "### Diagramme de cas d'utilisation \u2014 Analyse IA\n\n"
    "```mermaid\n"
    "flowchart LR\n"
    "    P([\"Commercant PRO\"])\n\n"
    "    subgraph S11 [\"Section 11 - Analyse IA Sentiment et Promotions\"]\n"
    "        UC1([\"Analyser les avis clients\"])\n"
    "        UC2([\"Voir score de sentiment\"])\n"
    "        UC3([\"Creer promo assistee IA\"])\n"
    "        UC4([\"Valider suggestion IA\"])\n"
    "        UC5([\"Modifier suggestion IA\"])\n"
    "        UC1 -.->|inclut| UC2\n"
    "        UC3 -.->|inclut| UC4\n"
    "        UC3 -.->|etend| UC5\n"
    "    end\n\n"
    "    P --> UC1 & UC2 & UC3\n"
    "```\n\n"
    "---\n\n"
)

content = content[:s12_pos] + section11_header + content[s12_pos:]

with open(r'C:\Users\INFOKOM\Desktop\private-PFE-repos\SEQUENCE_DIAGRAMS_WORD_FORMAT_OPTIMIZED.md', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Done - {len(content.splitlines())} lignes')
print('Section 11 header + CU diagram inserted before Section 12')
