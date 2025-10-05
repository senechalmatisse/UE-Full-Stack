import type { MessagesConfig } from '../config/messages.config';
import type { ILabelProvider } from './label-provider.interface';

/**
 * @displayName DefaultLabelProvider
 * @implements {ILabelProvider}
 * @public
 *
 * Default implementation of {@link ILabelProvider} that retrieves
 * entity labels from the provided {@link MessagesConfig}.
 */
export class DefaultLabelProvider implements ILabelProvider {
	private messages: MessagesConfig;

	/**
	 * Creates a new {@link DefaultLabelProvider}.
	 *
	 * @param messages - The application messages configuration.
	 */
	constructor(messages: MessagesConfig) {
		this.messages = messages;
	}

	/** @inheritdoc */
	getDefaultArtistLabel(): string {
		return this.messages.defaults.artistLabel;
	}

	/** @inheritdoc */
	getDefaultEventLabel(): string {
		return this.messages.defaults.eventLabel;
	}
}