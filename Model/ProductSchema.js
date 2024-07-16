
const {Schema,model}=require("mongoose")

const productSchema= new Schema({
  name:{
    type:String,
    required:[true,"Product name is require"],
   unique:[true,"this product name already exist "],
    minlength:[2,"this characters should be gater than 2"],
   maxlength:[31,"this characters should be lower than 31"],
  },
  category:{
    type:String,
    required:[true,"category name is require"],
    minlength:[2,"this characters should be gater than 2"],
    maxlength:[31,"this characters should be lower than 31"],
  },
  image:{
    type:String,
    required:[true,"image is requir"],
  },
  desc:{
    type:String,
    required:[true,"description name is require"],
    minlength:[2,"this characters should be gater than 2"],
    maxlength:[50,"this characters should be lower than 50"],
  },
  price:{
    type:String,
    required:[true,"price is required"],
  },
  ratings:{
    type:Number,
    default:4.5
  },
 
},{ timestamps:true})
const Products=model("ecom-products",productSchema)
module.exports=Products