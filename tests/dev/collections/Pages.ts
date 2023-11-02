import type { CollectionConfig } from 'payload/types';

import { Media } from './Media';

export const Pages: CollectionConfig = {
	slug: 'pages',
	fields: [
		{
			name: 'id',
			type: 'text',
			unique: true,
			index: true,
			required: true,
		},
		{
			name: 'title',
			type: 'text',
			required: true,
		},
		{
			name: 'path',
			type: 'text',
			unique: true,
			index: true,
			required: true,
		},
		{
			name: 'content',
			type: 'textarea',
		},
		{
			name: 'thumbnail',
			type: 'relationship',
			relationTo: Media.slug,
			hasMany: false,
			required: false,
		},
	],
};
