import * as argon2 from 'argon2'
import { prisma } from '../prisma'
import { TokenService } from './jwtService'
import 'dotenv/config'

const tokenService = new TokenService()

interface SignUp {
	email: string
	password: string
	name: string
	key: string
}

interface Login {
	email: string
	password: string
}

export class AuthService {
	public async signUp({ email, name, password, key }: SignUp): Promise<any> {
		if (key === process.env.SECRET_KEY) {
			const user = await prisma.user.findUnique({ where: { email } })

			if (user) return { error: 'User already exist' }
			else {
				const passwordHashed = await argon2.hash(password)
				const userRecord = await prisma.user.create({
					data: {
						email,
						name,
						password: passwordHashed,
						role: 0,
					},
					select: {
						email: true,
						name: true,
					},
				})
				return {
					message: 'User was create',
					userRecord,
					token: tokenService.generateToken({
						name: userRecord.name,
						email: userRecord.email,
					}),
				}
			}
		} else return { error: 'Incorrect KEY' }
	}

	public async login({ email, password }: Login): Promise<any> {
		const user = await prisma.user.findUnique({ where: { email } })

		if (!user) return { error: 'User not found' }
		else {
			const correctPassword = await argon2.verify(
				user.password,
				password.trim()
			)

			if (!correctPassword) return { error: 'Incorrect password' }

			return {
				user: {
					email: user.email,
					name: user.name,
				},
				token: tokenService.generateToken({
					name: user.name,
					email: user.email,
				}),
			}
		}
	}

	public async logout(token: string): Promise<any> {
		const findToken = await prisma.revokedToken.findMany({ where: { token } })

		if (!!findToken.length) return { error: 'Token already revoked' }
		else {
			const revokedToken = await prisma.revokedToken.create({
				data: {
					token,
				},
			})
			return { message: 'Logged out successfully' }
		}
	}
}
