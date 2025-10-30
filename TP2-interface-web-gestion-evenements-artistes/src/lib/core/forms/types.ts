/**
 * Interface pour la configuration d'un champ de formulaire
 */
export interface IFormField<T = any> {
    name: keyof T;
    label: string;
    type: 'text' | 'date' | 'datetime-local' | 'textarea' | 'email';
    placeholder?: string;
    required?: boolean;
    validation?: (value: any) => string | null;
}

/**
 * Interface pour la configuration de création d'entité
 */
export interface IEntityCreationConfig<T> {
    entityName: string;
    entityNamePlural: string;
    fields: IFormField<T>[];
    listRoute: string;
    createService: (payload: Omit<T, 'id'>) => Promise<T | null>;
}