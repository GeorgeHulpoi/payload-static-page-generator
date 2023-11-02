import express from 'express';
import type { Server } from 'http';
import payload, { type Payload } from 'payload';

const app = express();

export const start = async (): Promise<{
	server: Server;
	payload: Payload;
}> => {
	await payload.init({
		local: true,
		secret: 'here-is-a-secret',
		express: app,
	});

	return {
		server: app.listen(3000),
		payload,
	};
};

// when build.js is launched directly
if (module.id === require.main?.id) {
	start();
}
