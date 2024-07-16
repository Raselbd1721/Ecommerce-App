
const express = require('express')
const {seedCategory,postCategory,getAllCategory,deleteCategory,updateCategory,FindCategory}=require("../Controlers/CreateCategory.js")
const {CreateOrder,deleteOrder,getAllOrder,updateOrder,FindOrder}=require("../Controlers/CreateOrder.js")
const {seedProduct,postProduct,getAllProduct,deleteProduct,updateProduct,FindProduct}=require("../Controlers/PostProduct.js")
const {procssRegistraion,checkOtp,userLogin,userLogout,isLogin,isLogout,GetAllUsers,deleteUser,checkLogin,updateUser,isAdmin,FindUser,banUser,unBanUser}=require("../Controlers/UserReg.js")
const {Upload}=require("../Service/Upload.js")
const {inputValidation,runValidator,userRegValidation,categoryValidation}=require("../Service/SchemaValidator.js")
const ProductsRoute=express.Router()

// user login
ProductsRoute.get("/logout",isLogin,userLogout)
ProductsRoute.get("/islogin",isLogin,checkLogin)
ProductsRoute.post("/checkotp",checkOtp)
ProductsRoute.delete("/deleteUser/:id",isLogin,deleteUser)
ProductsRoute.post("/userlogin",isLogout,userLogin)
ProductsRoute.post("/user",userRegValidation,runValidator,procssRegistraion)
ProductsRoute.put("/user/:id",isLogin,userRegValidation,runValidator,updateUser)
ProductsRoute.put("/deactive/:id",isLogin,isAdmin,banUser)
ProductsRoute.put("/activate/:id",isLogin,isAdmin,unBanUser)
ProductsRoute.get("/singleuser/:id",isLogin,FindUser)
ProductsRoute.get("/allusers",isLogin,GetAllUsers)

//Product related Router

ProductsRoute.get("/seed",isLogin,seedProduct)
ProductsRoute.get("/app",isLogin,getAllProduct)
ProductsRoute.get("/findproduct/:id",isLogin,FindProduct)
ProductsRoute.delete("/app/:id",isLogin,deleteProduct)
ProductsRoute.post("/app",Upload.single("image"),isLogin,inputValidation,runValidator,postProduct)
ProductsRoute.put("/app/:id",Upload.single("image"),isLogin,inputValidation,runValidator,updateProduct)

//category All router
ProductsRoute.get("/seedcategory",isLogin,seedCategory)
ProductsRoute.get("/category",isLogin,getAllCategory)
ProductsRoute.post("/createCategory",Upload.single("image"),isLogin,categoryValidation,runValidator,postCategory)
ProductsRoute.delete("/category/:id",isLogin,deleteCategory)
ProductsRoute.put("/category/:id",Upload.single("image"),isLogin,categoryValidation,runValidator,updateCategory)
ProductsRoute.get("/singlecategory/:id",isLogin,FindCategory)

//ORDER RELATED ROUTER 

ProductsRoute.get("/orders",isLogin,getAllOrder)
ProductsRoute.post("/createOrder",isLogin,CreateOrder)
ProductsRoute.delete("/orders/:id",isLogin,deleteOrder)
ProductsRoute.get("/singleorder/:id",isLogin,FindOrder)
ProductsRoute.put("/orders/:id",isLogin,updateOrder)

module.exports=ProductsRoute