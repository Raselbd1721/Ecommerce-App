


const {Schema,model}=require("mongoose")
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

 

const userSchema= new Schema({
  email:{
    type:String,
    required:[true,"email name is required"],
   unique:[true,"this email already exist "],
    minlength:[2,"this characters should be gater than 2"],
   maxlength:[31,"this characters should be lower than 31"],
  },
  password:{
    type:String,
    required:[true,"password is required"],
    minlength:[3,"this characters should be gater than 3"],
    set:(val=>bcrypt.hashSync(val, salt)),
  },
  role:{
    type:String,
    required:[true,"role is required"],
  },
  isActive:{
    type:Boolean,
    default:true,
  },
},{ timestamps:true})
const EcomUsers=model("ecom-users",userSchema)
module.exports=EcomUsers