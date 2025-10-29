document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById("applicationModal");
    const openBtn = document.getElementById("openModalBtn");
    const closeBtn = document.querySelector(".close-btn");
    const form = document.getElementById("recruitment-form");
    const hiddenField = document.getElementById("specialty-division-field");
    const formMessage = document.getElementById("form-message");
    const body = document.body;

    // --- 1. Gestion de la Modale (Ouverture/Fermeture) ---
    
    // Ouvrir la modale
    openBtn.onclick = function() {
        modal.style.display = "block";
        body.style.overflow = "hidden"; // Empêche le défilement du body
    }

    // Fermer avec le bouton X
    closeBtn.onclick = function() {
        modal.style.display = "none";
        body.style.overflow = "auto";
    }

    // Fermer si on clique en dehors de la modale
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            body.style.overflow = "auto";
        }
    }

    // --- 2. Logique Conditionnelle (Partie 2) ---

    // Fonction pour gérer l'affichage du champ "Si oui, Laquelle ?"
    window.toggleHiddenField = function(show) {
        const input = hiddenField.querySelector('input');
        
        if (show) {
            hiddenField.style.display = 'block';
            input.setAttribute('required', 'required');
        } else {
            hiddenField.style.display = 'none';
            input.removeAttribute('required');
        }
    }
    
    // S'assurer que le champ conditionnel est masqué au chargement
    if (hiddenField) {
        hiddenField.style.display = 'none';
    }


    // --- 3. Soumission du Formulaire (Simulée vers Google Sheets via iframe) ---
    
    // Intercepter la soumission du formulaire
    form.addEventListener('submit', function(e) {
        // Optionnel : S'assurer que le champ conditionnel masqué est vidé avant l'envoi
        if (hiddenField.style.display === 'none') {
            hiddenField.querySelector('input').value = '';
        }
        
        // La soumission se fait vers l'iframe "hidden_iframe" (attribut target="hidden_iframe")
        
        // Afficher le message de succès immédiatement après l'envoi
        formMessage.style.display = 'block'; 
        form.reset(); // Vider le formulaire (pour donner l'impression que c'est fini)
        
        // Fermer la modale après un court délai
        setTimeout(() => {
            modal.style.display = "none";
            body.style.overflow = "auto";
            formMessage.style.display = 'none'; // Cacher le message pour la prochaine fois
        }, 3000); 
    });

    // --- LOGIQUE DE RÉCUPÉRATION DES IMAGES GOOGLE DRIVE ---

    // REMPLACEZ 'VOTRE_URL_APPS_SCRIPT' PAR L'URL DÉPLOYÉE
    const GOOGLE_DRIVE_API_URL = 'https://script.google.com/macros/s/AKfycbxVqszvJBfTJv6YdxStEic2rYeThAbkDk5Q9aV-Gd1iEuvfxJQvt1tPytS7pk2bLJ-Yww/exec'; 

    const galleryContainer = document.getElementById('media-gallery');

    if (galleryContainer) {
        // Supprime le message de chargement initial
        galleryContainer.innerHTML = ''; 
        
        // Fonction pour générer le HTML d'un item de galerie
        function createGalleryItem(imageUrl) {
            const mediaItem = document.createElement('div');
            mediaItem.classList.add('media-item');
            
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = 'Photo de la Protective Services Division';
            
            mediaItem.appendChild(img);
            galleryContainer.appendChild(mediaItem);
        }

        // Fonction principale de récupération des données
        async function fetchDriveImages() {
            try {
                const response = await fetch(GOOGLE_DRIVE_API_URL);
                
                if (!response.ok) {
                    throw new Error(`La requête API a échoué avec le statut : ${response.status}`);
                }
                
                // CHANGEMENT CRUCIAL : Lire la réponse comme du texte brut pour la nettoyer
                const text = await response.text();
                
                // Étape de nettoyage : Tenter de trouver le début et la fin du tableau JSON
                // Cela élimine tout texte parasite (comme l'entête 'Access-Control-Allow-Origin: *')
                const start = text.indexOf('[');
                const end = text.lastIndexOf(']');
                
                let cleanedJson = text;
                if (start !== -1 && end !== -1 && end > start) {
                    cleanedJson = text.substring(start, end + 1);
                }
                
                // Maintenant, on parse le JSON nettoyé
                const data = JSON.parse(cleanedJson); 
                
                // data devrait être un tableau d'URLs
                if (data && Array.isArray(data)) {
                    data.forEach(url => {
                        createGalleryItem(url);
                    });

                    if (data.length === 0) {
                        galleryContainer.innerHTML = '<p>Aucune photo n\'est disponible pour le moment.</p>';
                    }
                } else {
                     throw new Error('Le format de données JSON reçu est invalide ou vide après nettoyage.');
                }
                
            } catch (error) {
                console.error("ÉCHEC FATAL DE CHARGEMENT DE LA GALERIE :", error);
                
                document.getElementById('loading-error').style.display = 'block';
                galleryContainer.innerHTML = `<p>Nous n\'avons pas pu charger la galerie. Vérifiez l\'URL de l\'API et assurez-vous qu\'elle est publique. (Détails: ${error.message ? error.message : 'Erreur réseau'})</p>`;
            }
        }

        // Exécuter la fonction au chargement de la page
        fetchDriveImages();
    }

});

