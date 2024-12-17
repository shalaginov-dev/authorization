import express, { Request, Response, NextFunction } from 'express'
import { authRouter } from './auth/auth.controller'
import { userRouter } from './user/user.controller'
import { TokenService } from './auth/jwtService'
import { isAuth } from './middlewares/isAuth'
import { prisma } from './prisma'
import helmet from 'helmet'
import 'dotenv/config'

const app = express()

const tokenService = new TokenService()
const PORT = process.env.PORT || 4200

async function main() {
	tokenService.RevokeAllTokens()
	app.use(helmet())
	app.use(express.json())

	app.use('/api/auth', authRouter)
	app.use('/api', isAuth, userRouter)

	app.all('*', (req, res) => {
		res.status(404).json({ message: 'Not found' })
	})

	app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
		console.error(err.stack)
		res.status(500).send('Something went wrong...')
	})

	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`)
	})
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async e => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
