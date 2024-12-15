import mongooes from "mongoose"

const connectDB = async ()=>{
  mongooes.connection.on('connected', ()=> console.log("db connected"))
  await mongooes.connect(`mongodb+srv://ryider:ryider123@cluster0.zhb5r.mongodb.net/ryider`)
}

export default connectDB