require('dotenv').config()

const nodemailer = require("nodemailer")


const SendEmail=async(dec)=>{
  try{
    const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});
const info = await transporter.sendMail({
    from: process.env.SMTP_USER, // sender address
    to: dec.email, // list of receivers
    subject:"User procssRegistraion",
    html:`
    <h3>this for Rahope registration</h3>
    <h1>Here is your OTP ${dec.otp}</h1>
    `, // html body
  });
  }catch(error){
    throw error
  }
}
module.exports=SendEmail