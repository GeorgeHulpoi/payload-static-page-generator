import type { CollectionConfig } from 'payload/types';

export const Media: CollectionConfig = {
	slug: 'media',
	fields: [
		{
			name: 'id',
			type: 'text',
			unique: true,
			index: true,
			required: true,
		},
		{
			name: 'url',
			type: 'text',
			required: true,
			unique: true,
		},
		{
			name: 'alt',
			type: 'text',
		},
	],
};
