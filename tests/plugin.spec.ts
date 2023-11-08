import type { Server } from 'http';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';

import { start } from './dev/server';
import { StaticPage } from '../src/static-page';
import { type Payload } from 'payload';
import { Pages } from './dev/collections/Pages';
import { Media } from './dev/collections/Media';
import { deleteFn, generateFn } from './dev/mocks/funcs';

describe('StaticPageGenerator', () => {
	let mongod: MongoMemoryServer;
	let server: Server;
	let payload: Payload;

	beforeAll(async () => {
		mongod = await MongoMemoryServer.create();

		process.env.PAYLOAD_CONFIG_PATH = path.join(__dirname, 'dev', 'payload.config.ts');
		process.env.MONGODB_URI = mongod.getUri();

		const result = await start(true);
		server = result.server;
		payload = result.payload;
	});

	afterAll(async () => {
		await mongod.stop();
		server.close();
	});

	it('StaticPage.list should be populated', () => {
		expect(StaticPage.list.size).toEqual(3);
		expect(StaticPage.list.has('')).toBeTruthy();
		expect(StaticPage.list.has('about-us')).toBeTruthy();
		expect(StaticPage.list.has('contact')).toBeTruthy();
	});

	it('generateFn should be called 3 times', () => {
		expect(generateFn).toHaveBeenCalledTimes(3);

		expect(generateFn).toHaveBeenCalledWith(
			expect.objectContaining({
				page: StaticPage.list.get(''),
				regenerate: false,
				inBulk: true,
			}),
		);
		expect(generateFn).toHaveBeenCalledWith(
			expect.objectContaining({
				page: StaticPage.list.get('about-us'),
				regenerate: false,
				inBulk: true,
			}),
		);
		expect(generateFn).toHaveBeenCalledWith(
			expect.objectContaining({
				page: StaticPage.list.get('contact'),
				regenerate: false,
				inBulk: true,
			}),
		);
	});

	it('StaticPage.regenerateAll should regenerate all pages', async () => {
		generateFn.mockReset();

		StaticPage.regenerateAll();

		expect(generateFn).toHaveBeenCalledTimes(3);

		expect(generateFn).toHaveBeenCalledWith(
			expect.objectContaining({
				page: StaticPage.list.get(''),
				regenerate: true,
				inBulk: true,
			}),
		);
		expect(generateFn).toHaveBeenCalledWith(
			expect.objectContaining({
				page: StaticPage.list.get('about-us'),
				regenerate: true,
				inBulk: true,
			}),
		);
		expect(generateFn).toHaveBeenCalledWith(
			expect.objectContaining({
				page: StaticPage.list.get('contact'),
				regenerate: true,
				inBulk: true,
			}),
		);
	});

	it('update on resource should call generate function with regeneration', async () => {
		generateFn.mockReset();

		await payload.update({
			collection: Pages.slug,
			id: 'home',
			data: {
				content: 'blah',
			},
		});

		expect(generateFn).toHaveBeenCalledTimes(1);
		expect(generateFn).toHaveBeenCalledWith(
			expect.objectContaining({
				page: StaticPage.list.get(''),
				regenerate: true,
				inBulk: false,
			}),
		);
	});

	it('should regenerate all pages when update is related to layout', async () => {
		generateFn.mockReset();

		await payload.update({
			collection: Pages.slug,
			id: 'home',
			data: {
				title: 'Home 2',
			},
		});

		expect(generateFn).toHaveBeenCalledTimes(3);

		expect(generateFn).toHaveBeenCalledWith(
			expect.objectContaining({
				page: StaticPage.list.get(''),
				regenerate: true,
				inBulk: true,
			}),
		);
		expect(generateFn).toHaveBeenCalledWith(
			expect.objectContaining({
				page: StaticPage.list.get('about-us'),
				regenerate: true,
				inBulk: true,
			}),
		);
		expect(generateFn).toHaveBeenCalledWith(
			expect.objectContaining({
				page: StaticPage.list.get('contact'),
				regenerate: true,
				inBulk: true,
			}),
		);
	});

	it('update on dependency should call generate function with regeneration', async () => {
		generateFn.mockReset();

		await payload.update({
			collection: Media.slug,
			id: 'pic',
			data: {
				alt: 'huh huh huh',
			},
		});

		expect(generateFn).toHaveBeenCalledTimes(1);
		expect(generateFn).toHaveBeenCalledWith(
			expect.objectContaining({
				page: StaticPage.list.get('about-us'),
				regenerate: true,
				inBulk: false,
			}),
		);
	});

	it('deletion on resource should call deleteFn', async () => {
		deleteFn.mockReset();
		const staticPage = StaticPage.list.get('contact');

		await payload.delete({
			collection: Pages.slug,
			id: 'contact',
		});

		expect(deleteFn).toHaveBeenCalledTimes(1);
		expect(deleteFn).toHaveBeenCalledWith(staticPage);

		expect(StaticPage.list.size).toEqual(2);
		expect(StaticPage.list.has('')).toBeTruthy();
		expect(StaticPage.list.has('about-us')).toBeTruthy();
	});

	it('creation should create a Static Page', async () => {
		generateFn.mockReset();

		await payload.create({
			collection: Pages.slug,
			data: {
				id: 'test_page',
				title: 'Test Page',
				path: 'test/page',
				content:
					'Donec rutrum, ipsum eu porttitor dignissim, augue felis porttitor turpis.',
			},
		});

		expect(generateFn).toHaveBeenCalledTimes(1);
		expect(generateFn).toHaveBeenCalledWith(
			expect.objectContaining({
				page: StaticPage.list.get('test/page'),
				regenerate: false,
				inBulk: false,
			}),
		);
		expect(StaticPage.list.has('test/page')).toBeTruthy();
	});
});
