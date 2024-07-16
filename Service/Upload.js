
const multer = require('multer')
const path=require("path")
const createError = require('http-errors')
const mime = require('mime-types');
const alowdFile=["image/jpeg","image/jpg","image/png"]
const lim=2097152
const storage = multer.diskStorage({
 /* destination: function (req, file, cb) {
    cb(null, './Images')
  },*/
  filename: function (req, file, cb) {
    
    //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
     const ext=path.extname(file.originalname)
    cb(null, Date.now()+ext)
    
  }
  
})

const fileFilter=(req,file,cb)=>{
  const ext=path.extname(file.originalname)
  const type = mime.lookup(file.originalname);
  if(file.size > lim){
   return cb(new Error("file size should be 2md"),false)
  }
  if(!alowdFile.includes(type)){
   return cb(new Error("only image allowed"),false)
  }
  
 if(type=="video/mp4"){
   return cb(new Error("video not allowed"),false)
  }
  
  
  else {cb(null, true)}
}


const Upload = multer({ 
  storage: storage, 
limits:{fileSize:lim},
  fileFilter:fileFilter
  
})



module.exports={Upload}