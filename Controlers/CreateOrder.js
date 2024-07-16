


const mongoose=require("mongoose")
const createError = require('http-errors')
const EcomUsers=require("../Model/UserRegSch.js")
const EcomOrder=require("../Model/OrderSchema.js")

const CreateOrder=async(req,res,next)=>{
  try{
    const {order,subTotal,userDetails}=req.body
    const data={order,subTotal,userDetails}
    const postOrder=await EcomOrder.create(data)
    
    return res.status(201).json({
      message:"Order place successfully",
      orderData:postOrder,
    })
  }catch(error){
    next(error)
  }
}

const getAllOrder=async(req,res,next)=>{
  try{
    const search =req.query.search || ""
    const limits =Number(req.query.limit) || 5
    let page =Number(req.query.page) || 1
   const regExpration= RegExp('.*'+ search + '.*',"i")
   
   const byId=req.loginData.id
   const user=await EcomUsers.findById(byId)
   console.log("userdd",user)
   if(!user){
      throw createError(404,"kindly log in again")
    }
   if(!user.isActive){
     res.clearCookie("loginCookie")
      throw createError(404,"This user Baned kindly contact with Admin")
    }

    const idString =user._id.toString();
console.log("str",idString)
    
    
   let filter={}
   if(user.role==="admin"){
     filter={
      $or:[
        {subTotal:{$regex:regExpration}},
        {invoice:{$regex:regExpration}},
        {"userDetails.email":{$regex:regExpration}},
        ]
    }
   }else{
     
     filter={
       "userDetails.id":idString,
       "userDetails.email":user.email,
      $or:[
        {subTotal:{$regex:regExpration}},
        {invoice:{$regex:regExpration}},
        ]
    }
   }
   if(search){
       const total=await EcomOrder.find(filter).countDocuments()
       if(total>0){
       let limiter=Math.ceil(total/limits)
       if(page>limiter)
       page=limiter
       }
    
    }
   
   
    const allOrder=await EcomOrder.find(filter).limit(limits).skip((page-1)*limits)
    
    const count=await EcomOrder.find(filter).countDocuments()
    return res.status(201).json({
      allOrder,
      totalPage:Math.ceil(count/limits)
    })
  }catch(error){
    next(error)
  }
}

const deleteOrder=async(req,res,next)=>{
  try{
    const id=req.params.id
    const exist=await EcomOrder.findById(id)
    if(!exist){
      throw createError(404,"this Order not found")
    }
    await EcomOrder.findByIdAndDelete(id)
    return res.status(201).json({message:"Order Delete Successfully",success:true})
  }catch(error){
    if(error instanceof mongoose.Error.CastError){
return res.status(500).json({message:"Invalid Id"})
    }
    next(error)
  }
}

const FindOrder=async(req,res,next)=>{
  try{
    const id=req.params.id
    const exist=await EcomOrder.findById(id)
    if(!exist){
      throw createError(404,"this Order not found")
    }
   const singleOrder= await EcomOrder.findById(id)
    return res.status(201).json({message:"Order find Successfully",success:true,singleOrder})
  }catch(error){
    if(error instanceof mongoose.Error.CastError){
return res.status(500).json({message:"Invalid Id"})
    }
    next(error)
  }
}

const updateOrder=async(req,res,next)=>{
  try{
    const {order,subTotal,userDetails}=req.body
    const id=req.params.id
    const exist=await EcomOrder.findById(id)
    if(!exist){
      throw createError(404,"this Order not found")
    }
    const newData={order,subTotal,userDetails}
 const newOrder= await EcomOrder.findByIdAndUpdate(id,newData,{new:true})
 
  //const newProduct= await EcomCategory.findByIdAndUpdate(id,oneProduct,{new:true})
  
    return res.status(201).json(newOrder)
  }catch(error){
    if(error instanceof mongoose.Error.CastError){
return res.status(500).json({message:"Invalid Id"})
    }
    next(error)
  }
}

module.exports={CreateOrder,deleteOrder,getAllOrder,updateOrder,FindOrder}