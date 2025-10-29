document.addEventListener('DOMContentLoaded', function() {
    console.log("✓ DOM chargé, script initialisé");
    
    const modal = document.getElementById("applicationModal");
    const openBtn = document.getElementById("openModalBtn");
    const closeBtn = document.querySelector(".close-btn");
    const form = document.getElementById("recruitment-form");
    const hiddenField = document.getElementById("specialty-division-field");
    const formMessage = document.getElementById("form-message");
    const body = document.body;

    // --- 1. Gestion de la Modale (Ouverture/Fermeture) ---
    
    if (openBtn) {
        openBtn.onclick = function() {
            modal.style.display = "block";
            body.style.overflow = "hidden";
        }
    }

    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = "none";
            body.style.overflow = "auto";
        }
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            body.style.overflow = "auto";
        }
    }

    // --- 2. Logique Conditionnelle (Partie 2) ---

    window.toggleHiddenField = function(show) {
        if (!hiddenField) return;
        const input = hiddenField.querySelector('input');
        
        if (show) {
            hiddenField.style.display = 'block';
            input.setAttribute('required', 'required');
        } else {
            hiddenField.style.display = 'none';
            input.removeAttribute('required');
        }
    }
    
    if (hiddenField) {
        hiddenField.style.display = 'none';
    }

    // --- 3. Soumission du Formulaire ---
    
    if (form) {
        form.addEventListener('submit', function(e) {
            if (hiddenField && hiddenField.style.display === 'none') {
                hiddenField.querySelector('input').value = '';
            }
            
            if (formMessage) {
                formMessage.style.display = 'block'; 
            }
            form.reset();
            
            setTimeout(() => {
                modal.style.display = "none";
                body.style.overflow = "auto";
                if (formMessage) {
                    formMessage.style.display = 'none';
                }
            }, 3000); 
        });
    }

    // --- LOGIQUE DE RÉCUPÉRATION DES IMAGES GOOGLE DRIVE ---

    const GOOGLE_DRIVE_API_URL = 'https://script.google.com/macros/s/AKfycbyhmD1Il2X6XgcFgIoo__JfGwKs6gxNXAXi8kFRVWv84Y0mjkOLA352Crs4f7_kpJnE/exec';

    const galleryContainer = document.getElementById('media-gallery');

    if (!galleryContainer) {
        console.warn("⚠️ Container 'media-gallery' introuvable - pas sur la page média ?");
        return;
    }

    console.log("✓ Container galerie trouvé, début du chargement...");
    
    // Supprime le message de chargement initial
    galleryContainer.innerHTML = '<p style="text-align:center;">⏳ Connexion à Google Drive...</p>'; 
    
    // Fonction pour générer le HTML d'un item de galerie
    function createGalleryItem(imageUrl) {
        const mediaItem = document.createElement('div');
        mediaItem.classList.add('media-item');
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Photo de la Protective Services Division';
        
        // Gestion des erreurs de chargement d'image
        img.onerror = function() {
            mediaItem.innerHTML = '<p style="color:red;">Image non disponible</p>';
        };
        
        img.onload = function() {
            console.log("✓ Image chargée:", imageUrl);
        };
        
        mediaItem.appendChild(img);
        galleryContainer.appendChild(mediaItem);
    }

    // Fonction principale de récupération des données
    async function fetchDriveImages() {
        try {
            // Ajout d'un timeout de 10 secondes
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(GOOGLE_DRIVE_API_URL, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`Statut HTTP ${response.status}: ${response.statusText}`);
            }
            
            const rawText = await response.text(); 
            
            // Nettoyage du JSON
            const start = rawText.indexOf('[');
            const end = rawText.lastIndexOf(']');
            
            let cleanedJson = rawText;
            if (start !== -1 && end !== -1 && end > start) {
                cleanedJson = rawText.substring(start, end + 1);
                console.log("🧹 JSON nettoyé");
            } else {
                console.log("ℹ️ Pas de nettoyage nécessaire");
            }
            
            const data = JSON.parse(cleanedJson); 
            
            if (data && Array.isArray(data)) {
                galleryContainer.innerHTML = '';
                
                if (data.length === 0) {
                    galleryContainer.innerHTML = '<p style="text-align:center;">📭 Aucune photo disponible pour le moment.</p>';
                    console.warn("⚠️ Le dossier Drive est vide ou ne contient pas d'images");
                } else {
                    data.forEach((url, index) => {
                        console.log(`➕ Ajout de l'image ${index + 1}/${data.length}`);
                        createGalleryItem(url);
                    });
                    console.log("✅ Galerie complètement chargée !");
                }
            } else {
                throw new Error('Format de données invalide (pas un tableau)');
            }
            
        } catch (error) {
            console.error("❌ ERREUR FATALE:", error);
            console.error("Type d'erreur:", error.name);
            console.error("Message:", error.message);
            
            if (error.name === 'AbortError') {
                galleryContainer.innerHTML = '<p style="text-align:center;color:red;">⏱️ <strong>Timeout</strong> : Le serveur Google Apps Script ne répond pas. Vérifiez que votre script est déployé et public.</p>';
            } else {
                document.getElementById('loading-error').style.display = 'block';
                galleryContainer.innerHTML = `<p style="text-align:center;color:red;">⚠️ Erreur de chargement : ${error.message}</p>
                <p style="text-align:center;"><small>Ouvrez la console (F12) pour plus de détails</small></p>`;
            }
        }
    }

    // Exécuter la fonction au chargement de la page
    console.log("🎬 Lancement de fetchDriveImages()");
    fetchDriveImages();

});



