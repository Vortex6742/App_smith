export default {
	// ===================================================================
	// FONCTION 1 : Pour calculer la répartition des statuts VFX
	// ===================================================================
	calculateVFX_Status: () => {
		const statuses = ["In Progress", "To Review", "Finished"];
		
		// SÉCURITÉ AJOUTÉE : On ajoute "|| []" pour éviter les erreurs si getVFX.data est vide.
		const vfxData = getVFX.data || [];

		// On compte les éléments pour chaque statut
		const calculatedData = statuses.map(status_item => {
			const count = vfxData.filter(shot => shot.Status === status_item).length;
			
			return {
				name: status_item,
				value: count
			};
		});
		
		return calculatedData;
	}, // <-- La virgule qui sépare les deux fonctions est ici.

	// ===================================================================
	// FONCTION 2 : Pour obtenir la liste des films autorisés
	// ===================================================================
getAuthorizedFilmsOptions: () => {
    // AMÉLIORATION N°1 : On ajoute .filter(Boolean) pour supprimer toutes les lignes vides ou nulles
    const allFilms = (getFilms.data || []).filter(Boolean);
    const userPermissions = (getUserPermissions.data || []).filter(Boolean);
    const currentUserEmail = appsmith.user.email;

        if (allFilms.length === 0) {
            return [];
        }

        // AMÉLIORATION N°2 : On utilise la notation crochet ['...'] partout. C'est plus sûr.
        const permissionsForCurrentUser = userPermissions.filter(perm => perm['Email'] === currentUserEmail);
        const allowedMovieIds = permissionsForCurrentUser.map(perm => parseInt(perm['Allow_Movie_ID'], 10));

        const filteredFilms = allFilms.filter(film => allowedMovieIds.includes(film['ID']));
        
        const finalOptions = filteredFilms.map(film => {
            return {
                label: film['Nom du film'],
                value: film['ID'] 
            };
        });

        // ASTUCE DE PRO : Pour voir le résultat dans la console du navigateur (F12)
        console.log("Options générées pour le Select :", finalOptions);

        return finalOptions;
    }
}