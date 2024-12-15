import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from 'cookie-parser';
import connectDB from "./Config/mongodb.js";
import authRouter from "./Route/AuthRoute.js";
import userRouter from "./Route/UserRoute.js";

const app = express();
const port= process.env.PORT || 4000

connectDB()

const allowerdOrigins = ["http://localhost:3001", "http://localhost:3000", "https://ryider.vercel.app"]

app.use(express.json())
app.use(cookieParser());
app.use(cors({origin: allowerdOrigins, credentials:true}))

//Api Endpoint
app.get ('/', (req, res)=> res.send("API Working"))


app.use('/api/auth', authRouter)

app.use('/api/user', userRouter)


app.listen(port, ()=> console.log(`server started on PORT: ${port}`))