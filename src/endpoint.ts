import { type Endpoint, type PayloadHandler } from 'payload/config';

import type { RegenerateAllStaticPagesEndpoint } from './types';
import { StaticPage } from './static-page';

const regenerateAllStaticPagesEndpoint: (config: RegenerateAllStaticPagesEndpoint) => Endpoint = (
	config,
) => {
	const handler: PayloadHandler[] = [];

	if (config.preHandler !== undefined && config.preHandler.length > 0) {
		handler.push(...config.preHandler);
	}

	handler.push(async (req, res, next) => {
		await StaticPage.regenerateAll();
		next();
	});

	if (config.postHandler !== undefined && config.postHandler.length > 0) {
		handler.push(...config.postHandler);
	}

	return {
		path: config.path || '/api/regenerate-all-static-pages',
		method: config.method || 'get',
		root: true,
		handler,
	};
};

export default regenerateAllStaticPagesEndpoint;
