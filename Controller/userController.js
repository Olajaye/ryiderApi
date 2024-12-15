import userModel from "../models/UserModels.js";

export const GetUserData = async (req, res)=>{
  try {
    const {userId} = req.body;

    const user = await userModel.findById(userId)
    if(!user){
      res.json({success: false, message: 'User Not Found'})
    }

    res.json({
      success: true, 
      user: {
        name: user.name,
        isVerified: user.isVerified,
        role: user.role,
      }

    })
  } catch (error) {
    res.json({success: false, message: error.message})
  }
}