import { Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'
import { prisma } from '../prisma'
import 'dotenv/config'

export const isAuth = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	// Достаем токен из headers в запросе от клиента
	const token = req.headers.authorization?.split(' ')[1]
	if (token == null)
		return res.status(401).json({ error: 'Bad request without token' })

	//Ищем токен в блеклисте
	const findToken = await prisma.revokedToken.findMany({ where: { token } })
	if (!!findToken.length) {
		console.log('Token already revoked')
		return res.status(403).json({ error: 'Token is not valid' })
	}

	//Декод токена
	jwt.verify(
		token,
		process.env.JWT_SECRET as string,
		async (err: any, user: any) => {
			if (err) {
				console.log(`auth error in jwt verify: ${err}`)
				return res.status(403).json({ error: 'Token is not valid' })
			}
			//Поиск пользователя в бд по данным из декода
			const verifyUser = await prisma.user.findUnique({
				where: { email: user.data.email },
			})
			if (verifyUser) {
				req.user = verifyUser
				next()
			} else return res.status(403).json({ error: 'Token is not valid' })
		}
	)
}
