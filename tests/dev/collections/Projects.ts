import type { CollectionConfig } from 'payload/types';

export const Projects: CollectionConfig = {
	slug: 'projects',
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
			name: 'description',
			type: 'textarea',
		},
		{
			name: 'link',
			type: 'text',
		},
	],
};
