require('dotenv').config()
const Db=require("./Service/Db.js")
const app=require("./Module/App.js")
const port = process.env.PORT


app.listen(port,async() => {
  console.log(`Server is running on http://localhost:3000`)
 await Db()
})
