import { Payload } from 'payload';

import { Projects } from '../collections/Projects';

export default async function seedProjects(payload: Payload): Promise<void> {
	await payload.create({
		collection: Projects.slug,
		data: {
			id: 'google',
			title: 'Google',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas in aliquet magna.',
			link: 'https://google.com',
		},
	});

	await payload.create({
		collection: Projects.slug,
		data: {
			id: 'facebook',
			title: 'Facebook',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas in aliquet magna.',
			link: 'https://facebook.com',
		},
	});

	await payload.create({
		collection: Projects.slug,
		data: {
			id: 'linkedin',
			title: 'LinkedIn',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas in aliquet magna.',
			link: 'https://linkedin.com',
		},
	});
}
