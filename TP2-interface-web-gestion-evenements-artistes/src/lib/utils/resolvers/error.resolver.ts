import { getAppConfig } from "$lib/config";

// Abstraction pour la résolution des erreurs
export interface ErrorResolver {
	resolve(errorCode: number): string;
}

// Implémentation par défaut basée sur la config globale
export class ConfigErrorResolver implements ErrorResolver {
	resolve(errorCode: number): string {
		const config = getAppConfig();
		return config.errors.messages[config.errors.map[errorCode]] 
			?? config.errors.messages.generic;
	}
}