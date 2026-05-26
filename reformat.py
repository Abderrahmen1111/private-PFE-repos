import re

file_path = r'C:\Users\INFOKOM\Desktop\private-PFE-repos\INTERFACES_PUBLIQUES_PAR_ACTEUR.md'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> L\'écran d\'accueil mobile.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> L'écran d'accueil natif affiche le feed principal (Reels, promotions, boutiques à proximité). L'interface détecte automatiquement le rôle (Client/Vendeur) et adapte la vue. La navigation est facilitée par une barre de menu flottante offrant un accès rapide aux principales fonctionnalités de l'application."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> L\'inscription sur l\'app mobile.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> L'inscription propose un écran unifié avec boutons de connexion sociale. Le formulaire classique bénéficie de validations en temps réel. La sécurité et l'authentification sont entièrement gérées via Supabase Auth pour une expérience fluide."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> La connexion mobile partage le même écran.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> La connexion s'effectue sur l'écran unifié. Elle est sécurisée par Supabase (session persistante) et propose un accès rapide via les réseaux sociaux. Un AuthGuard gère la redirection automatique vers l'accueil après authentification."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> L\'écran Discover.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> L'onglet Discover offre une expérience immersive de type TikTok avec un feed vertical fullscreen. Les utilisateurs peuvent interagir (liker, commenter, partager) de manière fluide. L'interface s'adapte au thème sombre pour une consultation optimale."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> L\'écran Recherche.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> La recherche avancée intègre l'IA sémantique, la recherche par image et la géolocalisation. Les résultats (supportant la Darija) sont organisés par onglets filtrables, avec un affichage précis de la distance et de l'adresse."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> L\'écran Profil.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> Le profil propose une interface sous forme de cartes (Activités, Amis, Favoris, Suivis) et une édition simple. Il permet de retrouver l'historique des commandes, d'accéder au chat, et d'afficher le QR Code de livraison."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> Les favoris sont intégrés directement dans l\'écran Profil.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> Les favoris sont directement intégrés dans l'écran Profil. Chaque boutique ou élément sauvegardé apparaît sous forme de carte résumée, permettant un accès direct à sa page détaillée en un seul clic."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> Les commandes sont listées dans la section.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> L'historique des commandes se trouve dans la section \"Activités\" avec des badges de statut colorés. Pour les commandes validées, un bouton affiche un QR Code dynamique en plein écran, scannable par le vendeur lors de la livraison."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> La messagerie mobile se compose de la liste.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> La messagerie propose une liste des conversations et des écrans de chat individuels synchronisés en temps réel via Supabase. L'interface offre des bulles stylisées, l'auto-scroll, le statut en ligne, et une option de blocage."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> Le catalogue est accessible depuis la homepage.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> La page boutique centralise toutes les informations du commerçant (statistiques, stories, actions rapides). Les articles sont organisés par onglets (Produits, Services, Reels) et présentés dans une grille interactive."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> La page détail produit adopte un design.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> La fiche produit offre un design élégant avec image plein écran, caractéristiques structurées et profil vendeur détaillé. Une barre d'action flottante permet d'ajouter aux favoris ou de contacter le vendeur via WhatsApp."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> Le panier mobile.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> Le panier propose une interface premium affichant les détails des articles et les quantités. Le checkout s'ouvre dans un modal pré-rempli, générant automatiquement des commandes groupées par boutique après validation."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> Le support est accessible directement depuis.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> L'assistance est accessible depuis le dashboard pour créer et suivre ses tickets. Un écran de chat en temps réel permet d'échanger directement avec les administrateurs pour résoudre rapidement tout problème."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> La création de boutique s\'amorce depuis.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> La création de boutique se lance depuis le profil client. Le formulaire interactif permet de télécharger logo et bannière, de configurer les informations, et d'utiliser une carte GPS pour un positionnement précis."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> Le Dashboard vendeur remplace l\'accueil.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> Le Dashboard remplace l'accueil pour les vendeurs, offrant une vue claire sur les revenus et des raccourcis clés. Un menu complet donne accès à tous les modules, assisté en permanence par un chatbot IA flottant."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> L\'écran de gestion affiche le catalogue de produits.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> Le catalogue des produits est affiché sous forme de liste éditable. Les vendeurs peuvent ajouter manuellement de nouveaux articles ou utiliser l'Assistant IA intégré pour générer instantanément les fiches produits."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> Le processus de création par IA se déroule.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> Accessible via l'onglet \"AI Bot\", le chatbot génère une fiche produit complète à partir d'une simple description ou photo. Un bouton \"Publier\" permet ensuite la mise en ligne instantanée du produit."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> L\'écran des promotions regroupe les offres.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> Les offres promotionnelles sont listées dans un tableau détaillé de suivi. Les vendeurs peuvent configurer leurs promotions manuellement ou demander au chatbot IA de les créer via une requête textuelle."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> Le dashboard Intelligence centralise.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> Cet espace regroupe les recommandations IA : tendances, conseils en upsell et opportunités de vente. Le chatbot conseiller est disponible pour aider les marchands à interpréter les données et optimiser leurs résultats."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> L\'écran de gestion liste l\'ensemble des.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> L'écran liste toutes les commandes et réservations, filtrables par statut. Le vendeur peut accepter ou refuser chaque demande (avec motif) et ouvrir directement une discussion avec le client depuis la fiche."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> Le suivi des transactions s\'organise.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> L'historique des validations est centralisé pour un suivi optimal. L'interface intègre un scanner de QR code permettant au vendeur de flasher le code du client à la livraison, garantissant une validation instantanée."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> Les vidéos courtes de la boutique.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> La galerie vidéo permet aux créateurs de gérer leurs vidéos courtes et d'analyser leurs performances. Ces contenus peuvent être importés ou filmés directement avant d'être diffusés sur la plateforme."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> Les stories se gèrent depuis.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> Gérées depuis le même espace que les Reels, les stories s'affichent sous forme de bulles sur la page de la boutique. Elles restent visibles 24 heures, avec un compte à rebours soulignant leur nature éphémère."),

    (r'> \*\*📱 Version Mobile \(App Ro2ya\)\*\*\s*> L\'écran de réglages présente.*?(?=\n\n|\n---)',
     "> **📱 Version Mobile (App Ro2ya)**  \n> L'écran de réglages rassemble toutes les préférences (sécurité, langue, profil boutique) de manière intuitive. Un espace structuré regroupe l'ensemble des notifications pour faciliter la gestion du compte.")
]

import re
count = 0
for pattern, repl in replacements:
    content, num_subs = re.subn(pattern, repl, content, flags=re.DOTALL)
    count += num_subs

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Replaced {count} sections successfully.')
