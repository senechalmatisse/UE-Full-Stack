import type { IEntityCreationConfig, IFormField } from './types';

/**
 * Builder pattern pour créer des configurations de formulaire
 * Principe OCP : extension facile sans modification
 */
export class EntityCreationConfigBuilder<T> {
    private config: Partial<IEntityCreationConfig<T>> = {
        fields: []
    };

    setEntityName(singular: string, plural: string): this {
        this.config.entityName = singular;
        this.config.entityNamePlural = plural;
        return this;
    }

    setListRoute(route: string): this {
        this.config.listRoute = route;
        return this;
    }

    setCreateService(service: (payload: Omit<T, 'id'>) => Promise<T | null>): this {
        this.config.createService = service;
        return this;
    }

    addField(field: IFormField<T>): this {
        this.config.fields!.push(field);
        return this;
    }

    addTextField(
        name: keyof T,
        label: string,
        options?: Partial<IFormField<T>>
    ): this {
        return this.addField({
            name,
            label,
            type: 'text',
            required: true,
            ...options
        });
    }

    addDateField(
        name: keyof T,
        label: string,
        options?: Partial<IFormField<T>>
    ): this {
        return this.addField({
            name,
            label,
            type: 'date',
            required: true,
            ...options
        });
    }

    build(): IEntityCreationConfig<T> {
        if (!this.config.entityName || !this.config.createService) {
            throw new Error('Configuration incomplète');
        }
        return this.config as IEntityCreationConfig<T>;
    }
}