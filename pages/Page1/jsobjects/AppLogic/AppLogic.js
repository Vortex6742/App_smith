export default {
	// Fonction qui récupère les plans VFX uniquement pour le(s) studio(s) de l'utilisateur
	getUserVFXShots: () => {
		// On réutilise la fonction qui trouve les studios de l'utilisateur
		const userStudios = Auth.myStudios();

		// Si l'utilisateur n'a pas de studio assigné, on retourne une liste vide
		if (!userStudios || userStudios.length === 0) {
			return [];
		}

		const allShots = getVFX.data || [];

		// On retourne le tableau des plans filtrés pour ces studios
		return allShots.filter(shot => userStudios.includes(shot.Studio));
	}, // <--- VOICI LA VIRGULE CORRIGÉE ET ESSENTIELLE
	
	selectedFilmId: 1,
	
	onAppLoad: async () => {
		// Cette fonction va lancer nos 3 requêtes de démarrage.
		await Promise.all([
			getUsers.run(),
			getFilms.run(),
			getVFX.run()
		]);
	}
}