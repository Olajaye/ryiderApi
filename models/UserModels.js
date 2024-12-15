import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true, unique:true},
  password: {type: String, required: true},
  role: {type: String, required: true},
  country:{type: String, default: ""},
  phone:{type: Number, default: 0},
  referral:{type: String, default: ""},
  verifyOtp: {type: String, default: '' },
  verifyOtpExpireAt: {type: Number, default: 0},
  isVerified: {type: Boolean, default: false },
  resetOtp: {type: String, default: ""},
  resetOtpExpireAt: {type: Number, default: 0},
})

const userModel = mongoose.models.user || mongoose.model("user", UserSchema)

export default userModel