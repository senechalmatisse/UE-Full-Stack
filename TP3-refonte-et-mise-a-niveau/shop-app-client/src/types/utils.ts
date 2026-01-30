/**
 * Type utilitaire générique de transformation structurelle.
 * <p>
 * Ce type exploite la fonctionnalité avancée des "Mapped Types" de TypeScript pour projeter
 * un modèle de données existant vers une structure de validation. Concrètement, il itère sur
 * l'ensemble des clés du type générique <code>T</code> (via <code>keyof T</code>) pour produire
 * un nouveau type où chaque propriété conserve son nom d'origine, mais change de signature :
 * sa valeur devient une chaîne de caractères (<code>string</code>) et son existence devient optionnelle (<code>?</code>).
 * </p>
 * <p>
 * Cette abstraction est fondamentale pour la gestion robuste des formulaires au sein de l'application.
 * En effet, elle permet de typer les objets d'erreurs (<code>errors</code>) en garantissant qu'ils
 * reflètent exactement la structure de l'objet métier manipulé. Par exemple, si un champ <code>price</code>
 * est de type <code>number</code> dans le modèle, son équivalent dans l'objet d'erreur sera automatiquement
 * typé comme <code>string | undefined</code>, destiné à contenir le message d'erreur potentiel associé à ce champ.
 * </p>
 */
type ObjectPropertyString<T> = {
    [PropertyKey in keyof T]?: string;
};

export default ObjectPropertyString;