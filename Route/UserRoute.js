import express from 'express'
import userAuth from '../middleware/userAuth.js';
import { GetUserData } from '../Controller/userController.js';

const userRouter = express.Router();

userRouter.get('/data', userAuth, GetUserData)

export default userRouter