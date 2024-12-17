import * as jwt from 'jsonwebtoken'
import { prisma } from '../prisma'
import cron from 'node-cron'
import 'dotenv/config'

interface GenerateToken {
	name: string
	email: string
}

export class TokenService {
	//Создание токена
	public generateToken(user: GenerateToken) {
		const data = {
			name: user.name,
			email: user.email,
		}
		const signature = process.env.JWT_SECRET as string
		const expiration = '6h'

		return jwt.sign({ data }, signature, { expiresIn: expiration })
	}
	//Удаление токена
	public async RevokeAllTokens() {
		cron.schedule('0 8 * * 1', async () => {
			const revokedToken = await prisma.revokedToken.deleteMany()
			console.log('cron task success, all tokens was revoked')
		})
	}
}
