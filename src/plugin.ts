import type { Config, Plugin } from 'payload/config';

import { DependencyGraphService } from 'payload-dependency-graph';
import { StaticPage } from './static-page';
import type { PluginConfig } from './types';

export const StaticPageGeneratorPlugin: (pluginConfig: PluginConfig) => Plugin =
	(pluginConfig: PluginConfig) =>
	(incomingConfig: Config): Config => {
		const { onInit, ...restOfConfig } = incomingConfig;

		StaticPage.generate = pluginConfig.generate;
		StaticPage.delete = pluginConfig.delete;

		return {
			onInit: async (payload) => {
				if (onInit) {
					await onInit(payload);
				}

				await pluginConfig.onInit(payload);

				const dependencyGraph = DependencyGraphService.dependencyGraph!;

				// eslint-disable-next-line consistent-return
				DependencyGraphService.subscribe(async (event) => {
					const cond = await pluginConfig.onDependencyGraphEvent({
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
			...restOfConfig,
		};
	};
