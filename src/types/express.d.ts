import * as express from 'express'

interface User {
	id: string
	name: string
}

declare global {
	namespace Express {
		interface Request {
			user?: User
		}
	}
}
