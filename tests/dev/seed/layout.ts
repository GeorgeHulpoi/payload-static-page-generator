import { Payload } from 'payload';

import Layout from '../globals/Layout';

export default async function seedLayout(payload: Payload): Promise<void> {
	await payload.updateGlobal({
		slug: Layout.slug,
		data: {
			menus: ['home'],
		},
	});
}
