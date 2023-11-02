import { Payload } from 'payload';

import { Pages } from '../collections/Pages';

export default async function seedPages(payload: Payload): Promise<void> {
	await payload.create({
		collection: Pages.slug,
		data: {
			id: 'home',
			title: 'Home',
			path: 'home',
			content:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas in aliquet magna.',
		},
	});

	await payload.create({
		collection: Pages.slug,
		data: {
			id: 'about_us',
			title: 'About Us',
			path: 'about-us',
			content:
				'Etiam molestie justo eu urna maximus, sed finibus ex egestas. Aliquam auctor iaculis elit sed maximus.',
			thumbnail: 'pic',
		},
	});

	await payload.create({
		collection: Pages.slug,
		data: {
			id: 'contact',
			title: 'Contact',
			path: 'contact',
			content: 'Donec rutrum, ipsum eu porttitor dignissim, augue felis porttitor turpis.',
		},
	});
}
