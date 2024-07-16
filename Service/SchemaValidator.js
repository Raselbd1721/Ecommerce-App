
const {body,validationResult}=require("express-validator")
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);


const Products=require("../Model/ProductSchema.js")
const EcomUsers=require("../Model/UserRegSch.js")
const EcomCategory=require("../Model/CategorySchema.js")
const createError = require('http-errors')


 const inputValidation=[
   body("name")
   .trim()
   .isString()
   .notEmpty()
   .withMessage("product name required")
   .custom(async(val,{req})=>{
     const id=req.params.id
    const  exist = await Products.findOne({name: { $regex: new RegExp(`^${val}$`, 'i') } })
    if(exist){
      vid= exist._id.toString().replace(/ObjectId\("(.*)"\)/, "$1")
    
    if(vid!==id){
      throw createError(404,`this (${val}) product already exists`)
    }
    }
    return true
   })
   .isLength({min:2,max:31})
   .withMessage("character should be min 2 to 31 long"),
   
   body("image")
   .trim()
   //.isString()
   .custom((value, { req }) => {
        if (!req.file) throw new Error("Image must be required")
        return true
    }),
   //.notEmpty()
 // .withMessage("image is required"),
   
   body("category")
   //.trim()
   .isString()
   .notEmpty()
   .withMessage("category name required")
   .isLength({min:2,max:31})
   .withMessage("character should be min 2 to 31 long") ,
   
   body("desc")
    .trim()
   .notEmpty()
   .withMessage("desc name required")
   .isLength({min:2,max:50})
   .withMessage("desc should be min 2 to 50 long") ,
   body("price")
   .isNumeric()
   .withMessage("only Number allowed")
   .notEmpty()
   .withMessage("price is required"),
   
   body("ratings")
   .isNumeric()
   .optional(),
  //.default(4.6),
   
   ];
   
   const userRegValidation=[
     body("email")
     .isString()
     .isEmail()
     .withMessage("Please enter valid email")
     .notEmpty()
    .withMessage("Email must be entered")
    .isLength({min:2,max:50})
   .withMessage("Email should be min 2 to 50 long")
   .custom(async(val,{req})=>{
     const id=req.params.id
     const  exist= await EcomUsers.findOne({email: { $regex: new RegExp(`^${val}$`, 'i') } })
    if(exist){
     const vid= exist._id.toString().replace(/ObjectId\("(.*)"\)/, "$1")
    console.log("vid",vid)
    console.log("id",id)
    if(vid!==id){
      throw createError(404,`this (${val}) user already existshhd`)
    }
    }
    return true
   }),
   
  /* .custom(async(val)=>{
     const exist=await EcomUsers.findOne({email:val})
    if(exist){
      throw createError(404,`this (${val}) Email already Usedhh`)
    }
   })
    ,*/
     body("password")
     .isString()
     .notEmpty()
    .withMessage("password must be entered")
    .isLength({min:3,max:200})
   .withMessage("password should be min 3 character long")
   .custom((val)=>{
     return bcrypt.hashSync(val, salt)
   })
   ,
   body("role")
     .isString()
     .notEmpty()
    .withMessage("user Role must be entered"),
     ]
   
   const categoryValidation=[
    
    body("name")
   .trim()
   .isString()
   .notEmpty()
   .withMessage("category name required")
   .custom(async(val,{req})=>{
     const id=req.params.id
   const  exist = await EcomCategory.findOne({name: { $regex: new RegExp(`^${val}$`, 'i') } })
    if(exist){
      vid= exist._id.toString().replace(/ObjectId\("(.*)"\)/, "$1")
    
    if(vid!==id){
      throw createError(404,`this (${val}) category already exists`)
    }
    }
    return true
   })
   .isLength({min:2,max:31})
   .withMessage("character should be min 2 to 31 long"),
   
   body("image")
   .trim()
   //.isString()
   .custom((value, { req }) => {
        if (!req.file) throw new Error("Image must be required")
        return true
    }),
     ]
     
   
   const runValidator=async(req,res,next)=>{
     try{
     
       const errors = validationResult(req)
       
       if(!errors.isEmpty()){
         const listError=errors.array().map((err)=> err.msg)
         return res.status(500).json({message:listError})
       }
      else{ return next()}
     }catch(error){
        next(error)
     }
   }
   
   module.exports={inputValidation,runValidator,userRegValidation,categoryValidation}