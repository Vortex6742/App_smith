export default {
	// --- SECTION DE TEST ---
	// Changez l'email ici pour simuler qui se connecte.
	// currentUserEmail: "tel.basile29@gmail.com", // Simule l'Admin/MPC
	 currentUserEmail: "discordggapp99@gmail.com", // Simule l'Employé/Weta
	// currentUserEmail: appsmith.user.email,       // Mode réel pour la production

	// === FONCTION QUI TROUVE LES STUDIOS DE L'UTILISATEUR ===
	myStudios: () => {
		const allUsers = getUsers.data || [];
		// On utilise "this.currentUserEmail" pour lire la variable de test/réelle
		const currentUser = allUsers.find(user => user.User_Email === this.currentUserEmail);
		
		if (currentUser && currentUser.Assigned_Studio) {
			// On retourne son studio dans une liste, ex: ["MPC"]
			return [currentUser.Assigned_Studio];
		}
		// Si on ne trouve rien, on retourne une liste vide
		return [];
	},

	// === FONCTION QUI VÉRIFIE SI L'UTILISATEUR EST ADMIN ===
	isAdmin: () => {
		if (!getUsers.data) return false;
		const user = getUsers.data.find(u => u.User_Email === this.currentUserEmail);
		return (user && user.Role === 'Admin');
	},

	// === FONCTION QUI VÉRIFIE L'ACCÈS À UNE PAGE ADMIN ===
	verifyAdminAccess: () => {
		if (!this.isAdmin()) {
			showAlert('Accès réservé aux administrateurs.', 'error');
			navigateTo('Page1');
		}
	}
}