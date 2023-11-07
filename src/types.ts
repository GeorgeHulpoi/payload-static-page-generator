import type { Payload } from 'payload';
import type { DependencyGraphBase, Event } from 'payload-dependency-graph';
import type { StaticPage } from './static-page';

/**
 * A function used to tell Static Page if it should regenerate or destroy itself.
 */
export type ActionFunction = (args: ActionCallbackArgs) => boolean | Promise<boolean>;

export interface ActionCallbackArgs {
	/**
	 * Source event from Dependency Graph
	 */
	event: Event;
	/**
	 * Payload instance
	 */
	payload: Payload;
	/**
	 * Dependency Graph instance
	 */
	dependencyGraph: DependencyGraphBase;
	/**
	 * Static Page instance
	 */
	staticPage: StaticPage;
}

/**
 * The function that generates the HTML Content for the page and stores it.
 */
export type GenerateFunction = (args: GenerateFunctionArgs) => void | Promise<void>;

export interface GenerateFunctionArgs {
	/**
	 * The instance of {@link StaticPage | Static Page} that you have to (re)generate.
	 */
	page: StaticPage;

	/**
	 * By default, you shouldn't generate HTML content if there is already a file with it. This parameter forces to update it.
	 */
	regenerate: boolean;

	/**
	 *  If the regeneration is part of a bulk. Useful if you're invalidating multiple items at once.
	 */
	inBulk: boolean;
}

/**
 * The function that deletes the file that stores the HTML content for the Static Page.
 *
 * @param page - The instance of {@link StaticPage | Static Page} that you have to delete.
 * @returns `void | Promise<void>`
 */
export type DeleteFunction = (page: StaticPage) => void | Promise<void>;

export interface OnDependencyGraphEventArgs {
	/**
	 * Source event from Dependency Graph
	 */
	event: Event;
	/**
	 * Payload instance
	 */
	payload: Payload;
	/**
	 * Dependency Graph instance
	 */
	dependencyGraph: DependencyGraphBase;
}

export interface PluginConfig {
	/**
	 * Controls whether the plugin is active or not.
	 */
	enabled?: boolean;
	/**
	 * When the plugin initializes, this function is called. It is preferable in this function to generate the static pages.
	 * @returns `void | Promise<void>`
	 */
	onInit: (payload: Payload) => void | Promise<void>;
	/**
	 * Callback subscription for DependencyGraphService so you don't have to subscribe by yourself.
	 *
	 * @param args - {@link OnDependencyGraphEventArgs}
	 * @returns If returns `true`, it will call `onDependencyGraphEvent` for all {@link StaticPage | Static Pages}, otherwise, it will not call. Useful when you want to manipulate the static pages from callback.
	 */
	onDependencyGraphEvent: (args: OnDependencyGraphEventArgs) => boolean | Promise<boolean>;
	/**
	 * The function that generates the HTML Content for the page and stores it.
	 */
	generate: GenerateFunction;
	/**
	 * The function that deletes the file that stores the HTML content for the Static Page.
	 */
	delete: DeleteFunction;
}
