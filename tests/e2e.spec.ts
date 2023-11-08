import { Express } from 'express';
import type { Server } from 'http';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';

import { type Payload } from 'payload';
import { generateFn, postHandler, preHandler } from './dev/mocks/funcs';
import { start } from './dev/server';

describe('StaticPageGenerator', () => {
	let mongod: MongoMemoryServer;
	let server: Server;
	let app: Express;
	let payload: Payload;

	beforeAll(async () => {
		mongod = await MongoMemoryServer.create();

		process.env.PAYLOAD_CONFIG_PATH = path.join(__dirname, 'dev', 'payload.config.ts');
		process.env.MONGODB_URI = mongod.getUri();

		const result = await start(false);
		server = result.server;
		payload = result.payload;
		app = result.app;
	});

	afterAll(async () => {
		await mongod.stop();
		server.close();
	});

	it('regenerate all static pages endpoint should work', async () => {
		generateFn.mockReset();

		const res = await fetch('http://localhost:3000/api/regenerate-all-static-pages');

		expect(res.status).toEqual(200);
		expect(generateFn).toHaveBeenCalledTimes(3);
		expect(preHandler).toHaveBeenCalledTimes(1);
		expect(postHandler).toHaveBeenCalledTimes(1);
	});
});
