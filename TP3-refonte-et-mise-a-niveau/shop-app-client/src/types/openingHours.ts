/**
 * Définition structurelle de l'entité horaire.
 * <p>
 * Ce type modélise une plage d'ouverture unique associée à une boutique. Il constitue une brique
 * fondamentale de la gestion temporelle du point de vente, permettant de définir précisément
 * les créneaux d'activité pour chaque jour de la semaine.
 * </p>
 * <p>
 * D'un point de vue technique, la représentation temporelle s'appuie sur des chaînes de caractères
 * pour les heures (format standard 'HH:mm:ss') et sur un index numérique pour le jour (généralement de 1 à 7).
 * Cette structure de données plate facilite la sérialisation JSON lors des échanges avec l'API,
 * tout en permettant un tri chronologique efficace côté client.
 * </p>
 */
type OpeningHours = {
    id: number;
    day: number;
    openAt: string;
    closeAt: string;
};

export default OpeningHours;