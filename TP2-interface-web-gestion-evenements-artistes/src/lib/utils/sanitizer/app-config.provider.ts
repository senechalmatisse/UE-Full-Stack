import { getAppConfig } from '$lib/config';
import type { IConfigProvider } from './interfaces';

/** Fournit les labels par défaut depuis la configuration globale */
export class AppConfigProvider implements IConfigProvider {
    getDefaultArtistLabel(): string {
        return getAppConfig().messages.defaults.artistLabel;
    }

    getDefaultEventLabel(): string {
        return getAppConfig().messages.defaults.eventLabel;
    }
}