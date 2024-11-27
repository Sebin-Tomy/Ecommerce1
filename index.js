const mongoose = require('mongoose');
require('dotenv').config()
const mongoURL =  "mongodb://localhost:27017/e-commerce";
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true 
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:',err))
const express = require("express");
const app = express();
const morgan = require('morgan');
const path = require('path');
app.use("/css", express.static(path.resolve(__dirname, "assets/css")));
app.use("/imgs", express.static(path.resolve(__dirname, "assets/imgs")));
app.use("/js", express.static(path.resolve(__dirname, "assets/js")));
app.use("/fonts", express.static(path.resolve(__dirname,"assets1/fonts")))
app.use("/css", express.static(path.resolve(__dirname, "assets1/css")));
app.use("/images", express.static(path.resolve(__dirname, "assets1/images")));
app.use("/libs", express.static(path.resolve(__dirname, "assets1/libs")));
app.use("/js", express.static(path.resolve(__dirname, "assets1/js")));
app.use("/fonts", express.static(path.resolve(__dirname, "assets1/fonts")))
app.use("/userImages", express.static(path.resolve(__dirname, "public/userImages")))
const userRoute = require('./routes/userroute');
app.use('/',userRoute);
const adminRoute =  require('./routes/adminroute');
app.use('/admin',adminRoute);
app.use(morgan("tiny"));
app.listen(3000,function(){
    console.log("Server is running");
});
