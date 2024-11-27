const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();
const transporter = nodemailer.createTransport({
    service:'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.USER,
      pass: process.env.APP_PASSWORD,
    },
  });
  const mailOptions = {
    from: {name : 'ssa',
    address: process.env.USER
},
    to: "sebintomy@gmail.com",
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
    attachments:[
{ filename: 'test.pdf',
path:path.join(__dirname,'Capture.PNG'),
contentType:'image/PNG'
}]
  }
const sendMail = async()=>{
try{
    await transporter.sendMail()
    console.log('Email has been sent');
}catch(error){
    console.log(error);
}

  }
sendMail(transporter,mailOptions);