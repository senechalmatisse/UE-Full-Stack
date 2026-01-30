/**
 * Référentiel des constantes de localisation (Internationalisation).
 * <p>
 * Cette énumération typée définit de manière stricte l'ensemble des langues supportées par le système.
 * En centralisant les codes linguistiques (ici le Français et l'Anglais) sous forme de constantes,
 * ce module joue un rôle préventif contre les erreurs de saisie et facilite la maintenance du code.
 * </p>
 * <p>
 * Son utilisation est transversale : elle pilote aussi bien la logique de sélection de la langue
 * de l'interface utilisateur (via le contexte global) que la structure des données multilingues
 * des produits. Par conséquent, l'ajout futur d'une nouvelle langue se ferait via l'extension
 * de cette liste, garantissant une propagation immédiate du nouveau support linguistique dans toute l'application.
 * </p>
 */
enum Locale {
    FR = 'FR',
    EN = 'EN',
}

export default Locale;