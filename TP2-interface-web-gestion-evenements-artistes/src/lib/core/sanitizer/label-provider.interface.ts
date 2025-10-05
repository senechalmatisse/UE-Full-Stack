/**
 * @displayName ILabelProvider
 * @interface
 * @public
 *
 * Abstraction that provides default labels for entities.
 *
 * Enables context-based label retrieval (e.g., localization, configuration-based defaults).
 */
export interface ILabelProvider {
	/** Returns the default label to use when an artist label is missing. */
	getDefaultArtistLabel(): string;

	/** Returns the default label to use when an event label is missing. */
	getDefaultEventLabel(): string;
}