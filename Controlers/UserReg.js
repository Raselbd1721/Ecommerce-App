require('dotenv').config()
const EcomUsers=require("../Model/UserRegSch.js")
const SendEmail=require("../Service/SendEmail.js")
const bcrypt = require('bcryptjs');
const mongoose=require("mongoose")
const createError = require('http-errors') 
const jw=require("jsonwebtoken")
const crypto = require('crypto');


const procssRegistraion=async(req,res,next)=>{
  try{
    const {email,password,role}=req.body
    const userData={email,password,role}
    
     const exist=await EcomUsers.findOne({email})
    if(exist){
      throw createError(404,`this (${email}) already exists`)
    }
   const crp=crypto.randomInt(100000, 999999)
  userData.otp=crp
  const userToken=jwt.sign(userData,process.env.JWT_SECRET, { expiresIn: '3m' })
  console.log("sign",userToken)
  const dec=jwt.verify(userToken,process.env.JWT_SECRET)
  console.log(dec)
  res.cookie("accessToken",userToken,{
    maxAge:10*60*1000,
   httpOnly:true,
  })
  
  
  /*try{
    await SendEmail(dec)
  }catch(error){
    throw error
  }*/
   // const newUser=await EcomUsers.create(userData)
    return res.status(201).json({
      message:`Check this [${dec.email}] email account inbox for user Registration`,
      otp:dec.otp,
    })
  }catch(error){
    next(error)
  }
}

const checkOtp=async(req,res,next)=>{
  try{
    const {secretKey}=req.body
    console.log(secretKey)
    if(!secretKey){
      throw new Error("Otp required ")
    }
    const token=req.cookies.accessToken
   
    const dec=jwt.verify(token,process.env.JWT_SECRET)
    
    if(secretKey != dec.otp){
      throw new Error("invalid Otp please enter correct otp")
    }
    const exist=await EcomUsers.findOne({email:dec.email})
    if(exist){
      throw createError(404,`this (${dec.email}) Email already Used`)
    }
    const newUser=await EcomUsers.create(dec)
    
    return res.status(201).json({newUser,
      message:"user Create successfully",
    })
  }catch(error){
    next(error)
  }
}

const userLogin=async(req,res,next)=>{
  try{
    const {email,password}=req.body
    
    const exist=await EcomUsers.findOne({email})
    if(!exist){
      throw createError(404,"This user not found")
    }
    if(!exist.isActive){
      
      throw createError(404,"This user Baned kindly contact with Admin")
    }
    const userData={
      email,
      password,
      role:exist.role,
      id:exist._id,
      isActive:exist.isActive,
    }
 
   const hasd= await bcrypt.compare(password,exist.password)
   if(!hasd){
     throw createError(404,"Invald password")
   }
   
   const jwtset=jwt.sign(userData,process.env.JWT_LOGIN_KEY,{ expiresIn: '4h' })
   
  const CookieValue= res.cookie("loginCookie",jwtset,{
     maxAge:240*60*1000,
     httpOnly:true,
   })
  // console.log(userData)
    return res.status(201).json({message:"user login successfully",userData,
    success:true,
    })
  }catch(error){
    next(error)
  }
}
const userLogout=async(req,res,next)=>{
  try{
    res.clearCookie("loginCookie")
    return res.status(201).json({message:"user logOut successfully",
    })
  }catch(error){
    next(error)
  }
}

const isLogout=async(req,res,next)=>{
  try{
    const logCoo=req.cookies.loginCookie
  if(logCoo){
    throw new Error("user already loged in kindly logout first")
    try{
      const decoded=jwt.verify(logCoo,process.env.JWT_LOGIN_KEY)
  if(decoded){
    throw new Error("user already loged in kindly logout first")
  }
    }catch(error){
      throw error
    }
  }
  
  
  next()
  }catch(error){
    next(error)
  }
}

const isLogin=async(req,res,next)=>{
  try{
    const logCoo=req.cookies.loginCookie
  if(!logCoo){
    throw new Error("kindly login first")
  }
    const decoded=jwt.verify(logCoo,process.env.JWT_LOGIN_KEY)
  if(!decoded){
    throw new Error("session expired")
  }
  const exist=await EcomUsers.findById(decoded.id)
  
  if(!exist.isActive){
    res.clearCookie("loginCookie")
      throw createError(404,"This user Baned kindly contact with Admin")
    }
    
  
  req.loginData=decoded
  
  next()
  }catch(error){
    next(error)
  }
}


const isAdmin=async(req,res,next)=>{
  try{
    const logCoo=req.cookies.loginCookie
  if(!logCoo){
    throw new Error("kindly login first")
  }
    const decoded=jwt.verify(logCoo,process.env.JWT_LOGIN_KEY)
    console.log(decoded)
  if(!decoded){
    throw new Error("session expired")
  }
  if(decoded.role!=="admin"){
    return
  }
  req.loginData=decoded
  
  next()
  }catch(error){
    next(error)
  }
}


const GetAllUsers=async(req,res,next)=>{
  try{
    const search =req.query.search || ""
    const limits =Number(req.query.limit) || 5
    let page =Number(req.query.page) || 1
   const regExpration= RegExp('.*'+ search + '.*',"i")
   const byId=req.loginData.id
   const user=await EcomUsers.findById(byId)
   if(!user.isActive){
     res.clearCookie("loginCookie")
      throw createError(404,"This user Baned kindly contact with Admin")
    }
   
   let bool;
  if(search==="true" || search==="false"){
bool = JSON.parse(search);
   }
   
if(!user){
      throw createError(404,"kindly log in again")
    }
   let filter={}
  
  if(user.role==="admin"){
  
    if(typeof bool === "boolean"){
    filter={isActive:bool}
  }else{
    filter={
      //role:{$ne:"admin"}, 
      $or:[
        {email:{$regex:regExpration}},
        {role:{$regex:regExpration}},
       
        ]
    }
    }
  } 
  else{
    filter={
      email:user.email,
      $or:[
        {email:{$regex:regExpration}},
        ]
    }
  }

const total=await EcomUsers.find(filter).countDocuments()
       if(total>0){
       let limiter=Math.ceil(total/limits)
       if(page>limiter){
         page=limiter
       }
       }

    const allUser=await EcomUsers.find(filter).limit(limits).skip((page-1)*limits)
    

    const count=await EcomUsers.find(filter).countDocuments()
    
    return res.status(201).json({
      allUser,
      totalPage:Math.ceil(count/limits)
    })
  }catch(error){
    next(error)
  }
}

const updateUser=async(req,res,next)=>{
  try{
    const id=req.params.id
    const {email,password,role}=req.body
    const oneProduct={email,password,role}
    const exist=await EcomUsers.findById(id)
    if(!exist){
      throw createError(404,"this User not found")
    }
    
    const userData={
      email,
      password,
      role,
      id,
      isActive:exist.isActive,
    }
  
    
 const  existingDocument = await EcomUsers.findOne({email: { $regex: new RegExp(`^${email}$`, 'i') } })
        
    if(existingDocument){
      
     const vid= existingDocument._id.toString().replace(/ObjectId\("(.*)"\)/, "$1")
  
    if(vid!==id){
      throw createError(404,`this (${email}) email already exists`)
    }
   }
    const updateData= await EcomUsers.findByIdAndUpdate(id,oneProduct,{new:true}).select("-password")
    
    if(!updateData){
      throw createError(404,"user not update something went wrong")
    }
    const logCoo=req.cookies.loginCookie
    if(!logCoo){
    throw new Error("kindly login first")
  }
 
    const decoded=jwt.verify(logCoo,process.env.JWT_LOGIN_KEY)
    
    if(!decoded){
    throw new Error("session expired")
  }
  if(decoded.id === id){
    const jwtToken=jwt.sign(userData,process.env.JWT_LOGIN_KEY,{ expiresIn:'4h' })
    
    if(!jwtToken){
    throw new Error("something worng")
  }
    
    const CookieValue= res.cookie("loginCookie",jwtToken,{
     maxAge:240*60*1000,
     httpOnly:true,
   })
  }
    return res.status(201).json({message:"user update Successfully",success:true,updateData})
  }catch(error){
    if(error instanceof mongoose.Error.CastError){
return res.status(500).json({message:"Invalid Id"})
    }
    next(error)
  }
}


const deleteUser=async(req,res,next)=>{
  try{
    const id=req.params.id
    const exist=await EcomUsers.findById(id)
    if(!exist){
      throw createError(404,"this User not found")
    }
    await EcomUsers.findByIdAndDelete(id)
    return res.status(201).json({message:"user Delete Successfully",success:true})
  }catch(error){
    if(error instanceof mongoose.Error.CastError){
return res.status(500).json({message:"Invalid Id"})
    }
    next(error)
  }
}


const checkLogin=async(req,res,next)=>{
  try{
    
    const userInfo=req?.loginData
    const exist=await EcomUsers.findById(userInfo.id)
    if(!exist.isActive){
      res.clearCookie("loginCookie")
      throw createError(404,"This user Baned kindly contact with Admin")
    }
   //delete userInfo.password
    return res.status(201).json({message:"user validation Successfully",userInfo})
  }catch(error){
    next(error)
  }
}

const FindUser=async(req,res,next)=>{
  try{
    const id=req.params.id
    const exist=await EcomUsers.findById(id)
    if(!exist){
      throw createError(404,"this user not found")
    }
    if(!exist.isActive){
    
      throw createError(404,"This user Baned kindly contact with Admin")
    }
    
    const options={password:0}
   const singleUser= await EcomUsers.findById(id,options)
    return res.status(201).json({message:"user find Successfully",success:true,singleUser})
  }catch(error){
    if(error instanceof mongoose.Error.CastError){
return res.status(500).json({message:"Invalid Id"})
    }
    next(error)
  }
}

const banUser=async(req,res,next)=>{
  try{
    const id=req.params.id
    const data= {isActive:false}
    const exist=await EcomUsers.findById(id)
    if(!exist){
      throw createError(404,"this User not found")
    }
  
    const updateData= await EcomUsers.findByIdAndUpdate(id,data,{new:true}).select("-password")
    
    if(!updateData){
      throw createError(404,"user not update something went wrong")
    }
    
    return res.status(201).json({message:"user  Deactivated",success:true,updateData})
  }catch(error){
    if(error instanceof mongoose.Error.CastError){
return res.status(500).json({message:"Invalid Id"})
    }
    next(error)
  }
}


const unBanUser=async(req,res,next)=>{
  try{
    const id=req.params.id
    const data= {isActive:true}
    const exist=await EcomUsers.findById(id)
    if(!exist){
      throw createError(404,"this User not found")
    }
  
    const updateData= await EcomUsers.findByIdAndUpdate(id,data,{new:true}).select("-password")
    
    if(!updateData){
      throw createError(404,"user not update something went wrong")
    }
    
    return res.status(201).json({message:"user  Activate Successfully",success:true,updateData})
  }catch(error){
    if(error instanceof mongoose.Error.CastError){
return res.status(500).json({message:"Invalid Id"})
    }
    next(error)
  }
}


module.exports={procssRegistraion,checkOtp,userLogin,userLogout,isLogin,isLogout,GetAllUsers,deleteUser,checkLogin,updateUser,isAdmin,FindUser,banUser,unBanUser}