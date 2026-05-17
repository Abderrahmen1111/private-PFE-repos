import re

file_path = r'C:\Users\INFOKOM\Desktop\private-PFE-repos\SEQUENCE_DIAGRAMS_WORD_FORMAT_OPTIMIZED.md'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

ui_names = {
    1: "Page Inscription",
    2: "Page Connexion",
    3: "Middleware Router",
    4: "Page Création Boutique",
    5: "Page Validation Boutiques",
    6: "Page Paramètres Profil",
    7: "Page Profil Public",
    8: "Page Ajout Produit",
    9: "Page Recherche",
    10: "Page Modération",
    11: "Page Panier",
    12: "Page Checkout",
    13: "Page Gestion Commandes",
    14: "Page Scan QR",
    15: "Page Détails Commande",
    16: "Page Prise de RDV",
    17: "Page Planning",
    18: "Page Réservations Pro",
    19: "Barre Recherche IA",
    20: "Page Scan Caméra",
    21: "Page Carte Interactive",
    22: "Page Création Reel",
    23: "Feed Vidéos",
    24: "Menu Partage",
    25: "Trigger Notifs", # Skip for Notif as it doesn't have UI header
    26: "Page Messagerie",
    27: "Modal Laisser Avis",
    28: "Page Gestion Avis",
    29: "Page Centre Support",
    30: "Modal Signalement",
    31: "Page Utilisateurs",
    32: "Page Paiement Stripe",
    33: "Page Souscription Plan",
    34: "Page Analytics",
    35: "Page Chatbot IA"
}

generic_ui_patterns = [
    "Frontend (App)", 
    "Frontend (Next.js)", 
    "Dashboard (Web)", 
    "SaaS Admin App", 
    "App Mobile", 
    "App/Dashboard",
    "WebSocket"
]

current_diagram = 0
in_diagram = False

for i in range(len(lines)):
    line = lines[i]
    
    # Detect diagram start
    m = re.search(r'## (\d+)️⃣', line) or re.search(r'## 🔟', line)
    if m:
        if "🔟" in line:
            current_diagram = 10
        else:
            current_diagram = int(m.group(1))
            # Handle two-digit emojis like 1️⃣1️⃣
            m2 = re.search(r'## (\d+)️⃣(\d+)️⃣', line)
            if m2:
                current_diagram = int(m2.group(1) + m2.group(2))
            
    if "```text" in line:
        in_diagram = True
        continue
    if "```" in line and not "```text" in line and in_diagram:
        in_diagram = False
        continue
        
    # We are at the first line of the ascii diagram
    if in_diagram and current_diagram in ui_names and "→" in line:
        for generic in generic_ui_patterns:
            if generic in line:
                lines[i] = line.replace(generic, ui_names[current_diagram])
                break
        
        # Specific fix for diagram 26
        if current_diagram == 26 and "WebSocket" in line:
            lines[i] = line.replace("WebSocket", ui_names[current_diagram])

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Done")
