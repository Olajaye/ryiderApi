import express from 'express'
import { Register, Login, Logout, sendVerifyOtp, verifyEmail, isAuthenticated, sendResetOtp, resetPassword, } from '../Controller/AuthController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

authRouter.post('/register', Register)
authRouter.post('/login', Login)
authRouter.post('/logout', Logout)
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp )
authRouter.post('/verify-otp', userAuth, verifyEmail )
authRouter.get('/user-authenticated', userAuth, isAuthenticated )
authRouter.post('/send-reset-otp',  sendResetOtp)
authRouter.post('/reset-password',  resetPassword)

export default authRouter