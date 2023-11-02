import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { slateEditor } from '@payloadcms/richtext-slate';
import { Payload } from 'payload';
import { buildConfig } from 'payload/config';

import {
	DependencyGraphPlugin,
	DependencyGraphResource,
	DependencyGraphResourceSet,
	type UpdateEvent,
} from 'payload-dependency-graph';

import { StaticPage, StaticPageGeneratorPlugin } from '../../src';
import collections from './collections';
import globals from './globals';
import { seed } from './seed';
import { Pages } from './collections/Pages';
import Layout from './globals/Layout';

export const generateFn = jest.fn((page: StaticPage, regenerate: boolean) => {});
export const deleteFn = jest.fn((page: StaticPage) => {});

const regenerateAllPages = () => {
	StaticPage.list.forEach((sp) => {
		StaticPage.generate(sp, true);
	});
};

const canRegenerate = ({ event, staticPage, dependencyGraph }) => {
	if (event.type === 'update') {
		const target = {
			global: event.global,
			collection: event.collection,
			id: event.doc.id,
		};

		if (staticPage.hasDependency(target as unknown as DependencyGraphResource)) {
			return true;
		}

		for (const staticPageDep of staticPage.getDependencies()) {
			if (
				dependencyGraph.isDependency(
					staticPageDep,
					target as unknown as DependencyGraphResource,
				)
			) {
				return true;
			}
		}
	}
	return false;
};

const canDelete = ({ event, staticPage }) => {
	if (event.type === 'delete' && event.collection === Pages.slug) {
		const path = event.doc.path === 'home' ? '/' : `/${event.doc.path}`;

		return staticPage.path === path;
	} else return false;
};

export default buildConfig({
	serverURL: 'http://localhost:3000',
	admin: {
		disable: true,
	},
	collections,
	globals,
	graphQL: {
		disable: true,
	},
	onInit: async (payload) => {
		await seed(payload);
	},
	db: mongooseAdapter({
		url: process.env.MONGODB_URI!,
	}),
	editor: slateEditor({}),
	plugins: [
		DependencyGraphPlugin(),
		StaticPageGeneratorPlugin({
			onInit: async (payload: Payload) => {
				let result = await payload.find({
					collection: Pages.slug,
					pagination: false,
					depth: 0,
					limit: 0,
				});

				for (let doc of result.docs) {
					const path = doc.path === 'home' ? '/' : `/${doc.path}`;
					const staticPage = new StaticPage(
						path,
						new DependencyGraphResourceSet().add({
							collection: Pages.slug,
							id: doc.id,
						}),
						canRegenerate,
						canDelete,
					);

					StaticPage.generate(staticPage, false);
				}
			},
			onDependencyGraphEvent: async ({ event, dependencyGraph }) => {
				if (event.type === 'create' && event.collection === Pages.slug) {
					const path = event.doc.path === 'home' ? '/' : `/${event.doc.path}`;

					const staticPage = new StaticPage(
						path,
						new DependencyGraphResourceSet().add({
							collection: Pages.slug,
							id: event.doc.id,
						}),
						canRegenerate,
						canDelete,
					);

					await StaticPage.generate(staticPage, false);
					return false;
				}

				if (event.global === Layout.slug && event.type === 'update') {
					regenerateAllPages();
					return false;
				}

				if (event.type === 'update' && event.collection === Pages.slug) {
					// Is dependency to layout?

					const target = {
						collection: Pages.slug,
						id: event.doc.id,
					};

					const source = {
						global: Layout.slug,
					};

					const isDependency = await dependencyGraph.isDependency(source, target);

					if (isDependency) {
						const e = event as UpdateEvent;
						if (e.previousDoc.title !== e.doc.title) {
							regenerateAllPages();
							return false;
						}
					}
				}

				return true;
			},
			generate: generateFn,
			delete: deleteFn,
		}),
	],
});
