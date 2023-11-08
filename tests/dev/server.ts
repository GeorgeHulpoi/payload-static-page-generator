import express from 'express';
import type { Server } from 'http';
import payload, { type Payload } from 'payload';

const app = express();

export const start = async (
	local: boolean,
): Promise<{
	server: Server;
	payload: Payload;
	app: express.Express;
}> => {
	await payload.init({
		local,
		secret: 'here-is-a-secret',
		express: app,
	});

	return {
		app,
		server: app.listen(3000),
		payload,
	};
};
