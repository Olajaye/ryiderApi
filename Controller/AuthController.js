import userModel from "../models/UserModels.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken"
import transporter from "../Config/nodemailer.js";


const SaveCookiesFunction = (token)=>{
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 1 * 24 * 60 * 60 * 1000 
  })
}

export const Register = async (req, res)=>{
  const {name, email, password, role, country, phone, referral}= req.body

  if(!name || !email || !password || !role || !country){
    return res.json({success: false, message: 'Missing credentials '})
  }

  try {
    const existingUser = await userModel.findOne({email})

    if(existingUser){
      return res.json({success: false, message: "user already exists"})
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new userModel({
      name, 
      email, 
      password: hashedPassword, 
      role, 
      country, 
      phone, 
      referral
    })

    await user.save()

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'})

    //when deployed
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite:  "none" ,
      maxAge: 1 * 24 * 60 * 60 * 1000 
    })

    // sending welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Ryider",
      text: `Welcome to ryider website. your account has been created with EmailID: ${email}`
    }

    await transporter.sendMail(mailOptions)

    return res.json({success: true, token: token});
    
  } catch (error) {
    return res.json({success: false, message: error.message })
  }
}




export const Login = async (req, res)=>{
  const {email, password}= req.body

  if(!email || !password){
    return res.json({success: false, message: "email and password are required"})
  }

  try {
    const user = await userModel.findOne({email})

    if(!user){
      return res.json({success: false, message: 'Invalid Email'})
    }
    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
      return res.json({success: false, message: "Invaild Password"})
    }

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'})

    //when deployed 
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite:  "none" ,
      maxAge: 1 * 24 * 60 * 60 * 1000 
    })

    return res.json({success: true, token: token});
    
  } catch (error) {
    return res.json({success: false, message: error.message})
  }
}

export const Logout = async (req, res)=>{
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    } )

    return res.json({success: true, message: "Logged Out "})
    
  } catch (error) {
    res.json({success: false, message: error.message})
  }
}


// send verification otp to user's email
export const sendVerifyOtp = async (req, res)=>{
  try {
    const {userId} = req.body;

    const user = await userModel.findById(userId)

    if(user.isVerified){
      return res.json({success: false, message: "Account Already verified"})
    }

    const OTP = String(Math.floor(100000 + Math.random() * 900000))

    user.verifyOtp = OTP
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

    await user.save()

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP is ${OTP}. Verify your account using this OTP.`
    }

    await transporter.sendMail(mailOptions)

    res.json({success: true, message: "Verification OTP sent to email" })
  } catch (error) {
    res.json({success: false, message: error.message})
  }
}


export const verifyEmail = async (req, res)=>{
  const {userId, otp} = req.body

  if(!userId || !otp){
    return res.json({success: false, message: 'Missing Details'})
  }

  try {
    const user = await userModel.findById(userId)

    if(!user){
      return res.json({success: false, message: "User not found"})
    }

    if(user.verifyOtp === "" || user.verifyOtp !== otp){
      return res.json({success: false, message: "Invalid OTP"})
    }

    if(user.verifyOtpExpireAt < Date.now()){
      return res.json({success: false, message: "OTP Expired"})
    }

    user.isVerified = true

    user.verifyOtp = ""
    user.verifyOtpExpireAt = 0

    await user.save()

    return res.json({success: true, message: 'Email verified sucessfully '})
    
  } catch (error) {
    return res.json({success: false, message: error.message})
  }
}

// check if user is Authenticated
export const isAuthenticated = async (req, res)=>{
  try {
    return res.json({success: true})
  } catch (error) {
    return res.json({success: false, message: error.message})
  }
}


//send Password reset Otp
export const sendResetOtp = async (req, res)=>{
  const {email} = req.body;
  if(!email){
    res.json({sucess: false, message: "Email is required"})
  }

  try {
    const user = await userModel.findOne({email})
    if(!user){
      res.json({sucess: false, message: "User Not Found"})
    }

    const OTP = String(Math.floor(100000 + Math.random() * 900000))

    user.resetOtp = OTP
    user.resetOtpExpireAt = Date.now() + 15  * 60 * 1000

    await user.save()

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for reseting your password is ${OTP}. user this OTP to proceed with resetting your password.`
    }

    await transporter.sendMail(mailOptions)
    res.json({success: true, message: "OTP sent to your email"})

  } catch (error) {
    res.json({sucess: false, message: error.message})
  }
}

// Reset user password
export const resetPassword = async (req, res)=>{
  const {email, otp, newPassword}= req.body;

  if(!email || !otp || !newPassword){
    res.json({sucess: false, message: 'Email, OTP and New Passwprd are required'})
  }

  try {

    const user = await userModel.findOne({email})
    if(!user){
      res.json({sucess: false, message: "User Not Found"})
    }

    if(user.resetOtp === "" || user.resetOtp !== otp){
      res.json({sucess: false, message: "Invalid OTP"})
    }

    if(user.resetOtpExpireAt < Date.now()){
      return res.json({sucess: false, message: "OTP Expired"})
    }

    const hashedPassword = await  bcrypt.hash(newPassword, 10)

    user.password = hashedPassword,
    user.resetOtp = "";
    user.resetOtpExpireAt = 0
    
    await user.save()

    res.json({success: true, message: "Password has been reset sucessfully"})
  } catch (error) {
    res.json({success: false, message: error.message})
  }
}

