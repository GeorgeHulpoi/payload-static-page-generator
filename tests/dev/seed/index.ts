import { Payload } from 'payload';

import seedPages from './pages';
import seedLayout from './layout';
import seedProjects from './projects';
import { Media } from '../collections/Media';

export async function seed(payload: Payload): Promise<void> {
	await payload.create({
		collection: Media.slug,
		data: {
			id: 'pic',
			url: 'https://',
			alt: 'blah',
		},
	});

	await seedPages(payload);
	await seedLayout(payload);
	await seedProjects(payload);
}
