import { Router } from 'express'
import { AuthService } from './auth.service'
import { TokenService } from './jwtService'
import { isAuth } from '../middlewares/isAuth'

const router = Router()

const authService = new AuthService()
const tokenService = new TokenService()

router.post('/register', async (req, res) => {
	const { email, name, password, key } = req.body
	const signUp = await authService.signUp({ email, name, password, key })

	if (signUp && signUp.hasOwnProperty('error')) {
		res.status(403).json({ error: signUp.error })
	} else {
		res.status(200).json({ ...signUp })
	}
})

router.post('/login', async (req, res) => {
	const { email, password } = req.body
	const login = await authService.login({ email, password })

	if (login && login.hasOwnProperty('error')) {
		res.status(401).json({ error: login.error })
	} else {
		res.status(200).json({ ...login })
	}
})

router.post('/logout', isAuth, async (req, res) => {
	const token = req.headers.authorization?.split(' ')[1]
	const logout = await authService.logout(token as string)

	if (logout && logout.hasOwnProperty('error')) {
		res.status(401).json({ error: logout.error })
	} else {
		res.status(200).json({ ...logout })
	}
})

export const authRouter = router
