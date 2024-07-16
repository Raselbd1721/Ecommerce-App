
const Dburl=process.env.DB_URL
const mongoose=require("mongoose")
const Db=(async()=>{
  try{
    await mongoose.connect(Dburl)
    console.log("Db Connect successfully")
    await mongoose.connection.on('error',(error)=>{
      console.error("database error:",error)
    })
  }catch(error){
    console.error("database error:",error.toString())
  }
})
module.exports=Db

