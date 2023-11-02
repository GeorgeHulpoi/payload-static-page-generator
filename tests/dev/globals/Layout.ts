import { GlobalConfig } from 'payload/types';
import { Pages } from '../collections/Pages';

const Layout: GlobalConfig = {
	slug: 'layout',
	fields: [
		{
			name: 'menus',
			type: 'relationship',
			hasMany: true,
			relationTo: Pages.slug,
		},
	],
};

export default Layout;
