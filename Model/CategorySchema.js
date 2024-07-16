
const{Schema,model}=require("mongoose")

const CategorySchema=new Schema({
  name:{
    type:String,
    required:[true,"Category name is require"],
   unique:[true,"this Category name already exist "],
    minlength:[2,"this Category characters should be gater than 2"],
   maxlength:[31,"this Category characters should be lower than 31"],
  },
  image:{
    type:String,
    required:[true,"image is required"],
  },
  
},{timestamps:true})
const EcomCategory=model("Ecom-category",CategorySchema)
module.exports=EcomCategory