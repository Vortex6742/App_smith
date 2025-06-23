export default {
	// Fonction pour trouver le nom du film avec le plus de plans
	busiestProject: () => {
		const shots = getVFX.data || [];
		const films = getFilms.data || [];
		if (shots.length === 0 || films.length === 0) {
			return 'N/A';
		}

		let shotCounts = {};
		for (const shot of shots) {
			shotCounts[shot.MOVIE_ID] = (shotCounts[shot.MOVIE_ID] || 0) + 1;
		}

		let maxShots = 0;
		let busiestFilmId = -1;
		for (const filmId in shotCounts) {
			if (shotCounts[filmId] > maxShots) {
				maxShots = shotCounts[filmId];
				busiestFilmId = filmId;
			}
		}

		const busiestFilm = films.find(f => f.ID == busiestFilmId);
		return busiestFilm ? busiestFilm['Nom du film'] : 'N/A';
	}, // <--- VIRGULE IMPORTANTE POUR SÉPARER

	// Fonction pour déterminer le style du Statbox d'avancement
	getProgressStyle: () => {
		const allShots = getVFX.data || [];
		// Si il n'y a pas de données, on retourne un style neutre
		if (allShots.length === 0) {
			return {
				bgColor: '#475569', // Gris-bleu
				iconBg: '#64748B',
				textColor: '#FFFFFF'
			};
		}

		const finishedShots = allShots.filter(s => s.Status === 'Finished').length;
		const progress = (finishedShots / allShots.length * 100);

		if (progress >= 75) {
			// Style "Succès"
			return {
				bgColor: '#166534', // Vert foncé
				iconBg: '#22C55E', // Vert vif
				textColor: '#FFFFFF'
			};
		} else if (progress >= 30) {
			// Style "En cours"
			return {
				bgColor: '#B45309', // Orange foncé
				iconBg: '#F97316', // Orange vif
				textColor: '#FFFFFF'
			};
		} else {
			// Style "Danger / Bas"
			return {
				bgColor: '#991B1B', // Rouge foncé
				iconBg: '#EF4444', // Rouge vif
				textColor: '#FFFFFF'
			};
		}
	}, // <--- VIRGULE IMPORTANTE POUR SÉPARER

	// Fonction pour trouver le(s) studio(s) de l'utilisateur connecté
	myStudios: () => {
		const allUsers = getUsers.data || [];
		const currentUserEmail = appsmith.user.email;

		// On trouve l'utilisateur actuel dans notre table "Users"
		const currentUser = allUsers.find(user => user.User_Email.trim() === currentUserEmail.trim());

		// Si on a trouvé l'utilisateur et qu'il a un studio assigné...
		if (currentUser && currentUser.Assigned_Studio) {
			// On retourne son studio. On le met dans une liste pour que la logique de filtre fonctionne.
			return [currentUser.Assigned_Studio];
		}

		// Sinon, si on ne trouve rien, on retourne une liste vide.
		return [];
	}, // <--- Pas de virgule sur le DERNIER élément
	
	getFilmHealthData: () => {
		const films = getFilms.data || [];
		const shots = getVFX.data || [];
		
		if (films.length === 0) return [];
		
		// Pour chaque film, nous allons calculer ses statistiques
		return films.map(film => {
			// On filtre les plans pour ne garder que ceux de ce film
			const filmShots = shots.filter(s => s.MOVIE_ID == film.ID);
			
			const totalShots = filmShots.length;
			const finishedShots = filmShots.filter(s => s.Status === 'Finished').length;
			
			// On calcule le pourcentage (en évitant la division par zéro)
			const progress = (totalShots > 0) ? (finishedShots / totalShots * 100) : 0;
			
			// On retourne un objet propre avec toutes les infos pour notre carte
			return {
				filmId: film.ID,
				filmName: film['Nom du film'],
				totalShots: totalShots,
				finishedShots: finishedShots,
				progressPercent: progress.toFixed(0)
			}
		});
	}

}