/* eslint-disable max-classes-per-file */
import { DependencyGraphResourceSet, type DependencyGraphResource } from 'payload-dependency-graph';

import type {
	ActionFunction,
	DeleteFunction,
	GenerateFunction,
	OnDependencyGraphEventArgs,
} from './types';

/**
 * The Static Page Builder
 */
export class StaticPageBuilder {
	path?: string;
	dependencies: DependencyGraphResourceSet = new DependencyGraphResourceSet();
	canRegenerate?: ActionFunction;
	canDelete?: ActionFunction;

	constructor(builder?: StaticPageBuilder) {
		if (builder) {
			this.path = builder.path?.valueOf();
			this.dependencies = new DependencyGraphResourceSet(builder.dependencies);
			this.canRegenerate = builder.canRegenerate;
			this.canDelete = builder.canDelete;
		}
	}

	setPath(path: string): this {
		this.path = path;
		return this;
	}

	setDependencies(dependencies: DependencyGraphResourceSet): this {
		this.dependencies = new DependencyGraphResourceSet(dependencies);
		return this;
	}

	addDependency(dependency: DependencyGraphResource): this {
		this.dependencies.add(dependency);
		return this;
	}

	setCanRegenerate(callback: ActionFunction): this {
		this.canRegenerate = callback;
		return this;
	}

	setCanDelete(callback: ActionFunction): this {
		this.canDelete = callback;
		return this;
	}

	build(): StaticPage {
		if (this.path === undefined || this.path === null) {
			throw new Error("You can't build a StaticPage without using a path.");
		}

		if (!this.canRegenerate) {
			throw new Error(
				"You can't build a StaticPage without providing canRegenerate function.",
			);
		}

		if (!this.canDelete) {
			throw new Error("You can't build a StaticPage without providing canDelete function.");
		}

		return new StaticPage(this.path!, this.dependencies, this.canRegenerate, this.canDelete);
	}
}

/**
 * Representation of a Static Page, but it doesn't contain much data at all, only the path and its dependencies.
 */
export class StaticPage {
	/**
	 * {@link GenerateFunction | Generate Function}
	 */
	static generate: GenerateFunction;

	/**
	 * {@link DeleteFunction | Delete Function}
	 */
	static delete: DeleteFunction;

	/**
	 * List of all Static Pages
	 */
	static list: Map<string, StaticPage> = new Map();

	/**
	 * The Static Page Builder
	 */
	static Builder = StaticPageBuilder;

	/**
	 * The path of Static Page. It should start with `/` and don't have `index.html`.
	 */
	readonly path: string;

	/**
	 * The direct dependencies of Static Page. (immutable)
	 */
	private readonly deps: DependencyGraphResourceSet;

	/**
	 * A function that returns true if a certain condition is met to regenerate the Static Page instance.
	 */
	private readonly canRegenerate: ActionFunction;

	/**
	 * A function that returns true if a certain condition is met to delete the Static Page instance.
	 */
	private readonly canDelete: ActionFunction;

	constructor(
		path: string,
		deps: DependencyGraphResourceSet,
		canRegenerate: ActionFunction,
		canDelete: ActionFunction,
	) {
		this.path = path;
		this.deps = deps;
		this.canRegenerate = canRegenerate;
		this.canDelete = canDelete;

		StaticPage.list.set(path, this);
	}

	/**
	 * Regenerate all pages
	 */
	static regenerateAll(): Promise<void> {
		const regenerate$: Array<void | Promise<void>> = [];
		StaticPage.list.forEach((staticPage) => {
			regenerate$.push(StaticPage.generate(staticPage, true));
		});
		return Promise.all(regenerate$).then();
	}

	/**
	 * Function called when Dependency Graph emits event.
	 *
	 * @param args - {@link OnDependencyGraphEventArgs}
	 * @returns `Promise<void>`
	 */
	async onDependencyGraphEvent({
		event,
		dependencyGraph,
		payload,
	}: OnDependencyGraphEventArgs): Promise<void> {
		const canDeleteResult = await this.canDelete({
			event,
			dependencyGraph,
			payload,
			staticPage: this,
		});

		if (canDeleteResult) {
			await StaticPage.delete(this);
			StaticPage.list.delete(this.path);
			return;
		}

		const canRegenerateResult = await this.canRegenerate({
			event,
			dependencyGraph,
			payload,
			staticPage: this,
		});

		if (canRegenerateResult) {
			await StaticPage.generate(this, true);
		}
	}

	/**
	 * Get a clone of Static Pages direct dependencies
	 */
	getDependencies(): DependencyGraphResource[] {
		return Array.from(this.deps);
	}

	/**
	 * The Static Page has dependency?
	 */
	hasDependency(dep: DependencyGraphResource): boolean {
		return this.deps.has(dep);
	}
}
