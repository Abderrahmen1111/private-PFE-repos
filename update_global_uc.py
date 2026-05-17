NEW_DIAGRAM = """```mermaid
flowchart LR
    C(["Client"])
    P(["Commercant PRO"])
    A(["Administrateur"])

    subgraph Plateforme_RO2YA ["Plateforme RO2YA"]
        direction TB

        subgraph AUTH ["Authentification"]
            UC1(["S'inscrire"])
            UC_OTP(["Verifier OTP"])
            UC2(["Se connecter"])
            UC_JWT(["Acceder page protegee"])
            UC1 -.->|"include"| UC_OTP
            UC2 -.->|"include"| UC_JWT
        end

        subgraph BOUTIQUE ["Boutiques"]
            UC3(["Creer une boutique"])
            UC_UPLOAD(["Uploader les photos"])
            UC4(["Modifier le profil"])
            UC5(["Consulter profil public"])
            UC20(["Valider une boutique"])
            UC_REJECT(["Rejeter la boutique"])
            UC3 -.->|"include"| UC_UPLOAD
            UC20 -.->|"extend"| UC_REJECT
        end

        subgraph COMMANDES ["Catalogue et Commandes"]
            UC6(["Ajouter un produit"])
            UC7(["Parcourir le catalogue"])
            UC8(["Passer une commande"])
            UC9(["Traiter la commande"])
            UC10(["Livrer via QR Code"])
            UC_ANNULER(["Annuler la commande"])
            UC8 -.->|"include"| UC9
            UC9 -.->|"include"| UC10
            UC8 -.->|"extend"| UC_ANNULER
        end

        subgraph RESERVATION ["Reservations"]
            UC_CRENEAUX(["Consulter les creneaux"])
            UC11(["Reserver un service"])
            UC12(["Gerer les disponibilites"])
            UC_CRENEAUX -.->|"include"| UC11
        end

        subgraph IA ["IA et Recherche"]
            UC13(["Recherche semantique"])
            UC14(["Recherche par photo"])
            UC15(["Assistant IA"])
            UC16(["Recommandation promos"])
            UC_FRAUDE(["Detecter fraude"])
            UC_BLOC(["Bloquer transaction"])
            UC14 -.->|"extend"| UC13
            UC_FRAUDE -.->|"include"| UC_BLOC
        end

        subgraph SOCIAL ["Contenu et Social"]
            UC17(["Publier Reel ou Story"])
            UC_CDN(["Uploader sur Cloudinary"])
            UC18(["Laisser un avis"])
            UC_SENT(["Analyser sentiment IA"])
            UC19(["Chat temps reel"])
            UC17 -.->|"include"| UC_CDN
            UC18 -.->|"extend"| UC_SENT
        end

        subgraph ADMIN ["Administration"]
            UC21(["Moderer le contenu"])
            UC22(["Gerer les utilisateurs"])
            UC23(["Surveiller les fraudes"])
        end
    end

    C --> UC1 & UC2 & UC5 & UC7 & UC8 & UC_CRENEAUX & UC13 & UC14 & UC15 & UC18 & UC19
    P --> UC1 & UC2 & UC3 & UC4 & UC6 & UC9 & UC12 & UC16 & UC17 & UC19
    A --> UC2 & UC20 & UC21 & UC22 & UC_FRAUDE
```

*Figure : Diagramme de cas d'utilisation global de RO2YA*"""

import re

# ─── CHAPITRE3_CONCEPTION.md ─────────────────────────────────────────────────
path1 = r'C:\Users\INFOKOM\Desktop\private-PFE-repos\CHAPITRE3_CONCEPTION.md'
with open(path1, 'r', encoding='utf-8') as f:
    c1 = f.read()

# Find and replace the global diagram block (between the figure intro and section 3.4.3)
pattern1 = r'(```mermaid\nflowchart LR\n    C\(\[\".*?Administrateur.*?\"\]\).*?```\n\n\*Figure : Diagramme de cas d.utilisation global.*?\*)'
m1 = re.search(pattern1, c1, re.DOTALL)
if m1:
    c1 = c1[:m1.start()] + NEW_DIAGRAM + c1[m1.end():]
    print(f'CHAPITRE3_CONCEPTION.md: diagram replaced at pos {m1.start()}')
else:
    print('CHAPITRE3_CONCEPTION.md: pattern not found, trying alternate...')
    # Try simpler: find first flowchart LR with Plateforme_RO2YA and replace up to the closing figure caption
    start = c1.find('```mermaid\nflowchart LR\n    C(["')
    if start == -1:
        start = c1.find("```mermaid\r\nflowchart LR\r\n")
    end = c1.find('*Figure : Diagramme de cas d', start)
    end = c1.find('\n', end) + 1
    if start != -1 and end != -1:
        c1 = c1[:start] + NEW_DIAGRAM + '\n' + c1[end:]
        print(f'CHAPITRE3_CONCEPTION.md: replaced via alt method, start={start}')
    else:
        print(f'CHAPITRE3_CONCEPTION.md: FAILED to find diagram block')

with open(path1, 'w', encoding='utf-8') as f:
    f.write(c1)

# ─── USE_CASE_DIAGRAMS.md ─────────────────────────────────────────────────────
path2 = r'C:\Users\INFOKOM\Desktop\private-PFE-repos\USE_CASE_DIAGRAMS.md'
with open(path2, 'r', encoding='utf-8') as f:
    c2 = f.read()

# Replace first diagram block (global diagram is first in USE_CASE_DIAGRAMS.md)
start2 = c2.find('```mermaid')
end2 = c2.find('*Figure : Diagramme de cas d', start2)
end2 = c2.find('\n', end2) + 1
if start2 != -1 and end2 != -1:
    c2 = c2[:start2] + NEW_DIAGRAM + '\n' + c2[end2:]
    print(f'USE_CASE_DIAGRAMS.md: global diagram replaced')
else:
    print('USE_CASE_DIAGRAMS.md: FAILED to find diagram block')

with open(path2, 'w', encoding='utf-8') as f:
    f.write(c2)

print('Done.')
