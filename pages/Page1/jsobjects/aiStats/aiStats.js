export default {
    // Fonction d'initialisation appelée au démarrage pour lancer la classification une fois les données prêtes
    initializeClassifier: async () => {

        // Vérifier si la classification a déjà été lancée pour éviter des exécutions multiples
        if (appsmith.store.classificationInitiated) {
            console.log("Classification déjà lancée. Ignorée à l'initialisation.");
            return;
        }

        showAlert('Initialisation du classificateur... Chargement des données.', 'info');

        // Attendre que getVFX soit chargée. Si elle est en cours de chargement, on attend.
        // Si elle n'a pas encore été exécutée, on la lance.
        if (getVFX.isLoading) {
            await getVFX.run(); // Attendre qu'elle finisse de charger
        } else if (!getVFX.data) { // Si elle n'a pas de données (n'a pas été exécutée)
            await getVFX.run(); // Exécuter la requête
        }

        // Mettre un drapeau dans le store local pour indiquer que la classification a été lancée
        await storeValue('classificationInitiated', true);

        // Appeler la fonction principale de classification
        await this.classifyAllImagesIfNeeded();
    },

    // Cette fonction gère la classification de toutes les images
    // Elle vérifie si une image a déjà été labellisée et si son URL a changé.
    classifyAllImagesIfNeeded: async () => {
        // Pas de showAlert au début ici pour éviter les répétitions si appelée par initializeClassifier
        console.log('Exécution de classifyAllImagesIfNeeded.');

        const allImages = getVFX.data;

        if (!allImages || allImages.length === 0) {
            showAlert('Aucune donnée d\'image à traiter. Veuillez vous assurer que la table est chargée.', 'warning');
            return;
        }

        const imagesToClassify = allImages.filter(image => {
            const hasLabels = image.AI_Labels && image.AI_Labels.trim() !== '';
            const urlChanged = image.Vignette && image.Last_Classified_URL && image.Vignette !== image.Last_Classified_URL;

            // Labellise si :
            // 1. AI_Labels est vide OU est "No Labels Found" ou "URL Vide" ou "Erreur"
            // OU
            // 2. L'URL actuelle de la Vignette est différente de Last_Classified_URL
            return !hasLabels ||
                   image.AI_Labels === "No Labels Found" ||
                   image.AI_Labels === "URL Vide" ||
                   image.AI_Labels.startsWith("Erreur:") ||
                   urlChanged;
        });

        if (imagesToClassify.length === 0) {
            showAlert('Toutes les images sont déjà à jour (labellisées et URLs non modifiées).', 'success');
            return;
        }

        showAlert(`Début de la classification de ${imagesToClassify.length} images... Cela peut prendre un certain temps.`, 'info');

        let classifiedCount = 0;
        let errorCount = 0;

        for (const image of imagesToClassify) {
            console.log(`Classification en cours pour ID_VFX: ${image.ID_VFX}, URL: ${image.Vignette}`);

            try {
                // S'assurer que l'URL n'est pas vide avant d'appeler l'IA
                if (!image.Vignette || image.Vignette.trim() === '') {
                    console.warn(`URL de vignette vide pour ID_VFX: ${image.ID_VFX}. Saut de la classification.`);
                    await updateLabelsQuery.run({
                        rowIndex: image.rowIndex,
                        labels: "URL Vide",
                        imageUrl: "",
                        lastClassifiedUrl: ""
                    });
                    errorCount++; // Compter comme une "erreur" de traitement
                    continue; // Passe à l'image suivante
                }

                const aiResult = await classifyImageAI.run({ imageUrl: image.Vignette });

                let labelsString = "No Labels Found"; // Valeur par défaut si aucun label n'est trouvé
                if (aiResult && aiResult.labels && aiResult.labels.length > 0) {
                    labelsString = aiResult.labels.join(', ');
                }

                // Mettre à jour la ligne dans Google Sheets avec les nouveaux labels et l'URL classifiée
                await updateLabelsQuery.run({
                    rowIndex: image.rowIndex,
                    labels: labelsString,
                    imageUrl: image.Vignette, // Maintient l'URL actuelle dans la colonne Vignette
                    lastClassifiedUrl: image.Vignette // Met à jour l'URL de dernière classification
                });
                console.log(`Image ${image.ID_VFX} labellisée avec : ${labelsString}`);
                classifiedCount++;

            } catch (error) {
                showAlert(`Erreur lors de la classification de l'image ID_VFX: ${image.ID_VFX}: ${error.message.substring(0, 100)}...`, 'error');
                // Ligne corrigée ici pour le "petit 2" :
                console.error(`Erreur classification image ${image.ID_VFX} (${image.Vignette}):`, error);
                // En cas d'erreur, on marque les labels comme "Erreur" et l'URL de dernière classification comme vide
                await updateLabelsQuery.run({
                    rowIndex: image.rowIndex,
                    labels: `Erreur: ${error.message.substring(0, 50)}...`,
                    imageUrl: image.Vignette,
                    lastClassifiedUrl: ""
                });
                errorCount++;
            }
            // Ajouter un petit délai pour ne pas surcharger les APIs (API AI et Google Sheets)
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        showAlert(`Classification des images terminée ! ${classifiedCount} traitées, ${errorCount} erreurs.`, 'success');
        // Re-exécuter la requête getVFX pour rafraîchir la table après la mise à jour
        await getVFX.run();
        // Réinitialiser le drapeau pour permettre une nouvelle classification au prochain chargement si besoin (par ex. pour le bouton)
        await storeValue('classificationInitiated', false);
    },


	
	
// Dans votre objet aIStats, remplacez tout par ce code :
classifySelectedImage: async () => {
  // On récupère la table et la ligne sélectionnée
  const table = TableVFX;
  const selectedRow = table.selectedRow;

  // On vérifie qu'une ligne est bien sélectionnée
  if (!selectedRow) {
    showAlert('Veuillez sélectionner une ligne.', 'warning');
    return;
  }

  try {
    showAlert('Classification en cours...', 'info');

    // On exécute la requête IA
    const aiResult = await classifyImageAI.run({
      imageUrl: selectedRow.Vignette
    });

    let labelsToSave = "Aucun label trouvé";
    if (aiResult.response && aiResult.response.length > 0) {
      labelsToSave = aiResult.response.join(', ');
    }

    // On exécute la requête de mise à jour avec la variable CORRECTE
    await updateLabelsQuery.run({
      // =================================================================
      // == LA CORRECTION EST ICI : On demande à la TABLE son index sélectionné ==
      // =================================================================
      rowIndex: table.selectedRowIndex,
      labelsToSave: labelsToSave
    });

    // Si on arrive ici, tout a fonctionné
    showAlert('Classification réussie !', 'success');
    await getVFX.run();

  } catch (error) {
    // Si une des étapes ci-dessus échoue, on affiche une erreur
    showAlert('La classification a échoué. Vérifiez les permissions.', 'error');
    console.error("Erreur du workflow:", error);
  }
},	
	
	
    // par exemple, si un utilisateur édite manuellement une URL de vignette dans la table.
    classifySingleImageOnUrlChange: async (currentRow) => {

        if (!currentRow || !currentRow.Vignette || currentRow.Vignette.trim() === '') {
            showAlert('Impossible de classifier: URL de vignette manquante.', 'warning');
            return;
        }
        // Vérifie si l'URL a réellement changé par rapport à la dernière classification
        if (currentRow.Vignette === currentRow.Last_Classified_URL && currentRow.AI_Labels && currentRow.AI_Labels.trim() !== '' && !currentRow.AI_Labels.startsWith("Erreur:")) {
            showAlert('L\'image n\'a pas été modifiée et est déjà labellisée.', 'info');
            return;
        }

        try {
            showAlert(`Classification de l'image ${currentRow.ID_VFX} (URL: ${currentRow.Vignette})...`, 'info');
            const aiResult = await classifyImageAI.run({ imageUrl: currentRow.Vignette });

            let labelsString = "No Labels Found";
            if (aiResult && aiResult.labels && aiResult.labels.length > 0) {
                labelsString = aiResult.labels.join(', ');
            }

            await updateLabelsQuery.run({
                rowIndex: currentRow.rowIndex,
                labels: labelsString,
                imageUrl: currentRow.Vignette,
                lastClassifiedUrl: currentRow.Vignette // Met à jour l'URL de dernière classification
            });
            showAlert(`Image ${currentRow.ID_VFX} labellisée : ${labelsString}`, 'success');
            await getVFX.run(); // Rafraîchir la table
        } catch (error) {
            showAlert(`Erreur lors de la classification de l'image ${currentRow.ID_VFX}: ${error.message.substring(0, 100)}...`, 'error');
            console.error("Erreur classification unique:", error);
            await updateLabelsQuery.run({
                rowIndex: currentRow.rowIndex,
                labels: `Erreur: ${error.message.substring(0, 50)}...`,
                imageUrl: currentRow.Vignette,
                lastClassifiedUrl: ""
            });
            await getVFX.run(); // Rafraîchir même en cas d'erreur
        }
    }
}