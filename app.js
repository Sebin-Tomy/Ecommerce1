require('dotenv').config()
const mongoose = require('mongoose');


mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('MongoDB connected'))

const express = require("express");
const app = express();
const morgan = require('morgan');
const path = require('path');
const PORT = 3000 || process.env.PORT;
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
app.listen(PORT,function(){
    console.log("Server is running");
});
