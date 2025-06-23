export default {
	// --- SECTION DE TEST ---
	// C'est le seul endroit à modifier pour vos tests.
	// Laissez une seule ligne active (sans les "//" devant).
	
	currentUserEmail: "tel.basile29@gmail.com", // Pour simuler l'Admin
	// currentUserEmail: "discordggapp99@gmail.com", // Simule l'Employé (comme demandé)
	// currentUserEmail: appsmith.user.email,       // Mode réel pour la production

	// === FONCTION QUI VÉRIFIE SI L'UTILISATEUR EST ADMIN ===
	isAdmin: () => {
		// On vérifie que la liste des utilisateurs est bien chargée.
		if (!getUsers.data || getUsers.data.length === 0) {
			return false; 
		}

		// On cherche l'utilisateur DÉFINI CI-DESSUS dans la liste.
		const user = getUsers.data.find(u => u.User_Email === this.currentUserEmail);

		// On renvoie "true" SEULEMENT si l'utilisateur est trouvé ET que son rôle est 'Admin'.
		return (user && user.Role === 'Admin');
	}
}