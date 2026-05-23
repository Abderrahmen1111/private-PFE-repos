import re

with open(r'C:\Users\INFOKOM\Desktop\private-PFE-repos\SEQUENCE_DIAGRAMS_WORD_FORMAT_OPTIMIZED.md', 'r', encoding='utf-8') as f:
    content = f.read()

UC = {
    'SECTION 1': """
### Diagramme de cas d'utilisation — Authentification

```mermaid
flowchart LR
    C(["Client"])
    P(["Commercant PRO"])

    subgraph S1 ["Section 1 - Authentification"]
        UC1(["S'inscrire"])
        UC2(["Verifier OTP"])
        UC3(["Se connecter"])
        UC4(["Acceder page protegee"])
        UC1 -.->|inclut| UC2
        UC3 -.->|inclut| UC4
    end

    C --> UC1 & UC3
    P --> UC1 & UC3
```

---
""",
    'SECTION 2': """
### Diagramme de cas d'utilisation — Gestion des Boutiques

```mermaid
flowchart LR
    P(["Commercant PRO"])
    A(["Administrateur"])
    C(["Client"])

    subgraph S2 ["Section 2 - Gestion des Boutiques"]
        UC1(["Creer une boutique"])
        UC2(["Uploader photos"])
        UC3(["Valider boutique"])
        UC4(["Rejeter boutique"])
        UC5(["Modifier profil"])
        UC6(["Consulter profil public"])
        UC1 -.->|inclut| UC2
        UC3 -.->|etend| UC4
    end

    P --> UC1 & UC5
    A --> UC3 & UC4
    C --> UC6
```

---
""",
    'SECTION 3': """
### Diagramme de cas d'utilisation — Catalogue et Produits

```mermaid
flowchart LR
    C(["Client"])
    P(["Commercant PRO"])
    A(["Administrateur"])

    subgraph S3 ["Section 3 - Catalogue et Produits"]
        UC1(["Ajouter un produit"])
        UC2(["Modifier un produit"])
        UC3(["Retirer un produit"])
        UC4(["Parcourir le catalogue"])
    end

    P --> UC1 & UC2
    A --> UC3
    C --> UC4
```

---
""",
    'SECTION 4': """
### Diagramme de cas d'utilisation — Commandes

```mermaid
flowchart LR
    C(["Client"])
    P(["Commercant PRO"])

    subgraph S4 ["Section 4 - Commandes"]
        UC1(["Ajouter au panier"])
        UC2(["Passer une commande"])
        UC3(["Annuler une commande"])
        UC4(["Traiter la commande"])
        UC5(["Livrer via QR Code"])
        UC1 -.->|inclut| UC2
        UC4 -.->|inclut| UC5
    end

    C --> UC1 & UC2 & UC3
    P --> UC4 & UC5
```

---
""",
    'SECTION 5': """
### Diagramme de cas d'utilisation — Reservations

```mermaid
flowchart LR
    C(["Client"])
    P(["Commercant PRO"])

    subgraph S5 ["Section 5 - Reservations"]
        UC1(["Consulter les creneaux"])
        UC2(["Reserver un service"])
        UC3(["Annuler une reservation"])
        UC4(["Cloture une reservation"])
        UC5(["Gerer les disponibilites"])
        UC1 -.->|inclut| UC2
    end

    C --> UC1 & UC2 & UC3
    P --> UC4 & UC5
```

---
""",
    'SECTION 6': """
### Diagramme de cas d'utilisation — Recherche et Intelligence Artificielle

```mermaid
flowchart LR
    C(["Client"])
    P(["Commercant PRO"])

    subgraph S6 ["Section 6 - Recherche et IA"]
        UC1(["Recherche semantique Darija"])
        UC2(["Recherche par photo"])
        UC3(["Exploration sur la carte"])
        UC4(["Filtres de proximite"])
        UC3 -.->|inclut| UC4
    end

    C --> UC1 & UC2 & UC3
    P --> UC3
```

---
""",
    'SECTION 7': """
### Diagramme de cas d'utilisation — Contenu Video

```mermaid
flowchart LR
    P(["Commercant PRO"])
    C(["Client"])

    subgraph S7 ["Section 7 - Contenu Video Reels et Stories"]
        UC1(["Publier un Reel"])
        UC2(["Publier une Story"])
        UC3(["Liker un Reel"])
        UC4(["Sauvegarder un Reel"])
        UC1 -.->|etend| UC2
    end

    P --> UC1 & UC2
    C --> UC3 & UC4
```

---
""",
    'SECTION 8': """
### Diagramme de cas d'utilisation — Messagerie et Avis

```mermaid
flowchart LR
    C(["Client"])
    P(["Commercant PRO"])

    subgraph S8 ["Section 8 - Messagerie et Avis"]
        UC1(["Envoyer un message"])
        UC2(["Recevoir un message"])
        UC3(["Laisser un avis"])
        UC4(["Repondre a un avis"])
        UC1 -.->|inclut| UC2
    end

    C --> UC1 & UC3
    P --> UC2 & UC4
```

---
""",
    'SECTION 9': """
### Diagramme de cas d'utilisation — Detection de Fraude IA

```mermaid
flowchart LR
    P(["Commercant PRO"])
    A(["Administrateur"])

    subgraph S9 ["Section 9 - Detection de Fraude IA"]
        UC1(["Analyser une transaction"])
        UC2(["Bloquer automatiquement"])
        UC3(["Recevoir alerte fraude"])
        UC4(["Examiner alerte"])
        UC1 -.->|inclut| UC2
        UC2 -.->|inclut| UC3
        UC3 -.->|inclut| UC4
    end

    P --> UC1
    A --> UC3 & UC4
```

---
""",
    'SECTION 10': """
### Diagramme de cas d'utilisation — Analytiques et Assistant IA

```mermaid
flowchart LR
    P(["Commercant PRO"])
    C(["Client"])

    subgraph S10 ["Section 10 - Analytiques et Assistant IA"]
        UC1(["Consulter le tableau de bord"])
        UC2(["Voir les statistiques"])
        UC3(["Poser une question a l IA"])
        UC4(["Recevoir une reponse IA"])
        UC1 -.->|inclut| UC2
        UC3 -.->|inclut| UC4
    end

    P --> UC1 & UC2 & UC3
    C --> UC3
```

---
""",
    'SECTION 12': """
### Diagramme de cas d'utilisation — Administration et Support

```mermaid
flowchart LR
    A(["Administrateur"])
    C(["Client"])

    subgraph S12 ["Section 12 - Administration et Support"]
        UC1(["Moderer le contenu"])
        UC2(["Suspendre un utilisateur"])
        UC3(["Traiter un ticket"])
        UC4(["Consulter le tableau admin"])
        UC5(["Signaler un contenu"])
        UC5 -.->|inclut| UC1
    end

    A --> UC1 & UC2 & UC3 & UC4
    C --> UC5
```

---
"""
}

def insert_uc_after_section(content, section_key, uc_text):
    pattern = r'(# [^\n]*' + re.escape(section_key) + r'[^\n]*\n)'
    match = re.search(pattern, content)
    if match:
        pos = match.end()
        content = content[:pos] + uc_text + content[pos:]
        return content, True
    return content, False

for key, uc in UC.items():
    content, ok = insert_uc_after_section(content, key, uc)
    print(f'{key}: {"OK" if ok else "NOT FOUND"}')

with open(r'C:\Users\INFOKOM\Desktop\private-PFE-repos\SEQUENCE_DIAGRAMS_WORD_FORMAT_OPTIMIZED.md', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Done - {len(content.splitlines())} lignes, {len(content)} octets')
