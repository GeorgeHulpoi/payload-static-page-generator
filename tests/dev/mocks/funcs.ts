import { StaticPage } from '../../../src';

export const generateFn = jest.fn((args: any) => {});
export const deleteFn = jest.fn((page: StaticPage) => {});
export const preHandler = jest.fn((req, res, next) => {
	next();
});
export const postHandler = jest.fn((req, res, next) => {
	res.sendStatus(200);
});
