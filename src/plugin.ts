import type { Config, Plugin } from 'payload/config';

import { DependencyGraphService } from 'payload-dependency-graph';
import { regenerateAllStaticPagesEndpoint } from './endpoint';
import { StaticPage } from './static-page';
import type { PluginConfig } from './types';

export const StaticPageGeneratorPlugin: (pluginConfig: PluginConfig) => Plugin =
	(pluginConfig: PluginConfig) =>
	(incomingConfig: Config): Config => {
		const {
			enabled = true,
			onInit: pluginOnInit,
			generate: generateFn,
			delete: deleteFn,
			onDependencyGraphEvent,
		} = pluginConfig;

		if (!enabled) {
			return incomingConfig;
		}

		const { onInit, endpoints, ...restOfConfig } = incomingConfig;

		StaticPage.generate = generateFn;
		StaticPage.delete = deleteFn;

		let newEndpoints = endpoints;

		if (pluginConfig.regenerateAllStaticPagesEndpoint !== undefined) {
			newEndpoints = [
				...(endpoints || []),
				regenerateAllStaticPagesEndpoint(pluginConfig.regenerateAllStaticPagesEndpoint),
			];
		}

		return {
			onInit: async (payload) => {
				if (onInit) {
					await onInit(payload);
				}

				await pluginOnInit(payload);

				const dependencyGraph = DependencyGraphService.dependencyGraph!;

				// eslint-disable-next-line consistent-return
				DependencyGraphService.subscribe(async (event) => {
					const cond = await onDependencyGraphEvent({
						event,
						payload,
						dependencyGraph,
					});

					if (cond) {
						const promise$: Array<Promise<any>> = [];

						StaticPage.list.forEach((page) => {
							promise$.push(
								page.onDependencyGraphEvent({
									event,
									dependencyGraph,
									payload,
								}),
							);
						});

						return Promise.all(promise$).then();
					}
				});
			},
			endpoints: newEndpoints,
			...restOfConfig,
		};
	};
