
const Products=require("../Model/ProductSchema.js")
const mongoose=require("mongoose")
const {Upload}=require("../Service/Upload.js")
const crypto = require('crypto');
const EcomUsers=require("../Model/UserRegSch.js")
const multer = require('multer')
const ProductData=require("../Service/ProductData.js")
const cloudinary=require("../Service/Cloudinary.js")
const CloudId=require("../Service/CloudId.js")
const createError = require('http-errors')


const seedProduct=async(req,res,next)=>{
  try{
    await Products.deleteMany({})
   await cloudinary.api.delete_resources_by_prefix("Ecom/products")
   let yui=[]
   
  ProductData.map((val)=>{
    return yui.push({...val})
  })
   
   
    for(const data in yui){
      const result=await cloudinary.uploader.upload(yui[data].image,{folder:"Ecom/products"})
    yui[data].image=result.secure_url
    }
    //return res.json(AllProduct)
  const AllProduct= await Products.insertMany(yui)
  yui.length=0
   return res.status(201).json(AllProduct)
  }catch(error){
    next(error)
  }
}

const postProduct=async(req,res,next)=>{
  try{
    
    
    const {name,desc,category,price}=req.body
    
    const exist=await Products.findOne({name:name})
    if(exist){
      throw createError(404,`this (${name}) product already exist`)
    }
    
    const image=req.file?.path
    if(!image){
throw new Error("image is required ")
    }
 const oneProduct= { name,desc,category,price}
    const result=await cloudinary.uploader.upload(image,{folder:"Ecom/products"})
    oneProduct.image=result.secure_url
      const newProduct= await Products.create(oneProduct)
    return res.status(201).json({newProduct,message:"Product created Successfully"})
  }catch(error){
    next(error)
  }
}


const updateProduct=async(req,res,next)=>{
  try{
    const {name,desc,category,price}=req.body
    const id=req.params.id
    const exist=await Products.findById(id)
    if(!exist){
      throw createError(404,"this user not found")
    }
    const cName=name.toLowerCase()
    
    const existName=await Products.findOne({name:cName})
    if(existName){
      vid= existName._id.toString().replace(/ObjectId\("(.*)"\)/, "$1")
    
    if(vid!==id){
      throw createError(404,`this (${name}) product already exist${vid}`)
    }
   }
    
    const image=req.file?.path
    if(!image){
throw new Error("image is required ")
    }
    
    
 const oneProduct= { name,desc,category,price}
    const resl=await cloudinary.uploader.upload(image,{folder:"Ecom/products"})
    oneProduct.image=resl.secure_url
      const newProduct= await Products.findByIdAndUpdate(id,oneProduct,{new:true})
      
      const publicId=await CloudId(exist.image)
   const {result}= await cloudinary.uploader.destroy(`Ecom/products/${publicId}`)
   if(result !== "ok"){
     throw new Error(`image could not delete from cloudinary ${publicId}`)
   }
   
    return res.status(201).json(newProduct)
  }catch(error){
    if(error instanceof mongoose.Error.CastError){
return res.status(500).json({message:"Invalid Id"})
    }
    next(error)
  }
}

const getAllProduct=async(req,res,next)=>{
  try{
    const search =req.query.search || ""
    let limits =Number(req.query.limit) || 5
    let page =Number(req.query.page) || 1
   const regExpration= RegExp('.*'+ search + '.*',"i")
   const cokiE=req.loginData
   //const user=await EcomUsers.findById(cokiE.id)
   if(cokiE.role==="user"){limits=9}
   
    const filter={
      $or:[
        {name:{$regex:regExpration}},
        {price:{$regex:regExpration}},
        {category:{$regex:regExpration}},
        ]
    }
    if(search){
       const total=await Products.find(filter).countDocuments()
       if(total>0){
       let limiter=Math.ceil(total/limits)
       if(page>limiter)
       page=limiter
       }
    
    }
    
    const allProducts=await Products.find(filter).limit(limits).skip((page-1)*limits)
    
    const count=await Products.find(filter).countDocuments()
    
    const actualTotal=await Products.find().countDocuments()
    
    return res.status(201).json({
      allProducts,
      totalPage:Math.ceil(count/limits),
      totalProducts:count,
      actualTotal,
    })
  }catch(error){
    next(error)
  }
}
const deleteProduct=async(req,res,next)=>{
  try{
    const id=req.params.id
    const exist=await Products.findById(id)
    if(!exist){
      throw createError(404,"this user not found")
    }
    const publicId=await CloudId(exist.image)
   const {result}= await cloudinary.uploader.destroy(`Ecom/products/${publicId}`)
   if(result !== "ok"){
     throw new Error(`image could not delete from cloudinary ${publicId}`)
   }
    await Products.findByIdAndDelete(id)
    return res.status(201).json({message:"Product Delete Successfully",success:true})
  }catch(error){
    if(error instanceof mongoose.Error.CastError){
return res.status(500).json({message:"Invalid Id"})
    }
    next(error)
  }
}

const FindProduct=async(req,res,next)=>{
  try{
    const id=req.params.id
    const exist=await Products.findById(id)
    if(!exist){
      throw createError(404,"this Product not found")
    }
   const singleProduct= await Products.findById(id)
    return res.status(201).json({message:"Product find Successfully",success:true,singleProduct})
  }catch(error){
    if(error instanceof mongoose.Error.CastError){
return res.status(500).json({message:"Invalid Id"})
    }
    next(error)
  }
}

module.exports={seedProduct,postProduct,getAllProduct,deleteProduct,updateProduct,FindProduct}