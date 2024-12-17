import { Router } from 'express'
import { prisma } from '../prisma'

const router = Router()

router.get('/user', async (req, res) => {
	// const revokedToken = await prisma.revokedToken.deleteMany()
	res.status(200).json('все окей!')
})

export const userRouter = router
