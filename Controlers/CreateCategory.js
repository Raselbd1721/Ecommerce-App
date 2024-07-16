
const mongoose=require("mongoose")

const cloudinary=require("../Service/Cloudinary.js")
const CloudId=require("../Service/CloudId.js")
const createError = require('http-errors')
const EcomCategory=require("../Model/CategorySchema.js")
const CategoryData=require("../Service/CategoryData.js")

//SEED CATEGORY 
const seedCategory=async(req,res,next)=>{
  try{
   
  await EcomCategory.deleteMany({})
   await cloudinary.api.delete_resources_by_prefix("Ecom/Category/")
  let yui=[]
   
  CategoryData.map(val=>yui.push({...val}))
//console.log(yui)
/*for(let i=0; i < yui.length; i++){
  const result=await cloudinary.uploader.upload(yui[i].image,{folder:"Ecom/Category"})
    //yui[data]=CategoryData[data]
    yui[i].image=result.secure_url
}
*/

   for(const data in CategoryData){
      const result=await cloudinary.uploader.upload(CategoryData[data].image,{folder:"Ecom/Category"})
    //yui[data]=CategoryData[data]
  yui[data].image=result.secure_url
    }
const AllCategory= await EcomCategory.insertMany(yui)
yui.length=0

   return res.status(201).json({
     message:"category upload successfully",
     data:AllCategory})
  }catch(error){
    next(error)
  }
}
//POST SINGLE CATEGORY 
const postCategory=async(req,res,next)=>{
  try{
    
    const {name}=req.body
    
    const exist=await EcomCategory.findOne({name:name})
    if(exist){
      throw createError(404,`this (${name}) category already exist`)
    }
    
    const image=req.file?.path
    if(!image){
throw new Error("image is required ")
    }
 const oneProduct= {name}
    const result=await cloudinary.uploader.upload(image,{folder:"Ecom/Category"})
    oneProduct.image=result.secure_url
      const newProduct= await EcomCategory.create(oneProduct)
    return res.status(201).json(newProduct)
  }catch(error){
    next(error)
  }
}

const getAllCategory=async(req,res,next)=>{
  try{
    const search =req.query.search || ""
    let limits =Number(req.query.limit)
    let page =Number(req.query.page) || 1
   const regExpration= RegExp('.*'+ search + '.*',"i")
   
   const cokiE=req.loginData
   if(cokiE.role==="user"){limits=9}
   
    const filter={
      $or:[
        {name:{$regex:regExpration}},
        ]
    }
    if(search){
       const total=await EcomCategory.find(filter).countDocuments()
       if(total>0){
       let limiter=Math.ceil(total/limits)
       if(page>limiter)
       page=limiter
       }
    
    }
    const allCategory=await EcomCategory.find(filter).limit(limits).skip((page-1)*limits)
    
    const count=await EcomCategory.find(filter).countDocuments()
    
    return res.status(201).json({
      allCategory,
      totalPage:Math.ceil(count/limits)
    })
    
  }catch(error){
    next(error)
  }
}

const deleteCategory=async(req,res,next)=>{
  try{
    const id=req.params.id
    const exist=await EcomCategory.findById(id)
    if(!exist){
      throw createError(404,"this Category not found")
    }
    const publicId=await CloudId(exist.image)
   const {result}= await cloudinary.uploader.destroy(`Ecom/Category/${publicId}`)
   if(result !== "ok"){
     throw new Error(`image could not delete from cloudinary ${publicId}`)
   }
    await EcomCategory.findByIdAndDelete(id)
    return res.status(201).json({message:"Category Delete Successfully",success:true})
  }catch(error){
    if(error instanceof mongoose.Error.CastError){
return res.status(500).json({message:"Invalid Id"})
    }
    next(error)
  }
}

const updateCategory=async(req,res,next)=>{
  try{
    const {name}=req.body
    const id=req.params.id
    const exist=await EcomCategory.findById(id)
    if(!exist){
      throw createError(404,"this user not found")
    }
    
    const cName=name.replace(/^.{1}/g, name[0].toUpperCase());

    const existName=await EcomCategory.findOne({name:cName})
    if(existName){
      vid= existName._id.toString().replace(/ObjectId\("(.*)"\)/, "$1")
    
    if(vid!==id){
      throw createError(404,`this (${name}) category already exists ${vid}`)
    }
   }
    
    const image=req.file?.path
    if(!image){
throw new Error("image is required ")
    }
    
    
 const oneProduct= {name}
    const resl=await cloudinary.uploader.upload(image,{folder:"Ecom/Category"})
    oneProduct.image=resl.secure_url
      const newProduct= await EcomCategory.findByIdAndUpdate(id,oneProduct,{new:true})
      
      const publicId=await CloudId(exist.image)
   const {result}= await cloudinary.uploader.destroy(`Ecom/Category/${publicId}`)
   if(result !== "ok"){
     throw new Error(`image could not delete from cloudinary ${publicId}`)
   }
   
    return res.status(201).json({newProduct:newProduct,message:"category Update Successfully"})
  }catch(error){
    if(error instanceof mongoose.Error.CastError){
return res.status(500).json({message:"Invalid Id"})
    }
    next(error)
  }
}

const FindCategory=async(req,res,next)=>{
  try{
    const id=req.params.id
    const exist=await EcomCategory.findById(id)
    if(!exist){
      throw createError(404,"this Category not found")
    }
   const singleCategory= await EcomCategory.findById(id)
    return res.status(201).json({message:"Category find Successfully",success:true,singleCategory})
  }catch(error){
    if(error instanceof mongoose.Error.CastError){
return res.status(500).json({message:"Invalid Id"})
    }
    next(error)
  }
}

module.exports={seedCategory,postCategory,getAllCategory,deleteCategory,updateCategory,FindCategory}