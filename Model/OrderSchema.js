

const{Schema,model}=require("mongoose")

const OrderSchema=new Schema({
  order:{
    type:Object,
  },
  subTotal:{
    type:String,
  },
  userDetails:{
    type:Object,
  },
  invoice:{
    type:String,
 default: function() {
      let val=this._id.toString().slice(-15)
    return val;
    },
  },
  
},{timestamps:true})
const EcomOrder=model("Ecom-Order",OrderSchema)
module.exports=EcomOrder