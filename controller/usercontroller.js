const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const nodemailer = require('nodemailer');
const { STATUS_CODES ,MESSAGES} = require('../constants/constants');
const Products = require('../models/productdata');
const address = require('../models/address');
const Category = require('../models/categories');
const {orderModel} = require('../models/order');
const Cart  = require('../models/cart');
const wishlist1  = require('../models/wishlist');
const Coupon = require('../models/coupon');
const products = require('../models/productdata');
const { default: mongoose } = require('mongoose');
const cart = require('../models/cart');
const wallet = require('../models/Wallet')
const securePassword = async(password)=>{
    try{
        const passwordHash = await bcrypt.hash(password,10);
        console.log(password);
        return passwordHash;
    }catch(error){
       console.log(error.message);

    }
}

const loginLoad = async(req,res)=>{
        try{
            res.render('logine1');
        }
        catch(error){
            console.log(error.message);   
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

const loginLoadin = async(req,res)=>{
        try{
            
            res.render('logine1');
        }
        catch(error){
            console.log(error.message);   
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

const loginregister = async(req,res)=>{
        try{
            res.render('register');
        }
        catch(error){
            console.log(error.message); 
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);  
        }
    }

    const loginHome = async (req, res) => {
        try {
            if (req.session.user_id) {
                const userData = await User.findById(req.session.user_id);
                if (userData && userData.is_blocked) {
                    return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
                }
            } else {
                return res.redirect('/login');
            }
    
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 2;
            const skip = (page - 1) * limit;
    
            const sort = req.query.sort || "option"; // Default sort option
    
            const totalProducts = await Products.countDocuments();
            const totalPages = Math.ceil(totalProducts / limit);
    
            const products1 = await Products.find().skip(skip).limit(limit);
            const categories = await Category.find();
    
            res.render('index1', {
                Products: products1,
                inputLetter: null,
                categories: categories,
                selectedCategory: null,
                currentPage: page,
                totalPages: totalPages,
                limit: limit,
                sortOption: sort, 
            });
        } catch (error) {
            console.log(error.message);
            res.redirect('/login');
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
        }
    };
    
    

const verifyLogin = async (req, res) => {
        try {
            const email = req.body.email;
            const password = req.body.password;
            if (!email || !password) {
                console.log(email);
                console.log(password);
                let message = "Both email and password are required";
                if (!email) message = "Email is required";
                if (!password && !email) message = "Email and password is required"
                if (!password) message = "Password is required";
                res.render('logine1', { message });
                return;
            }
            const userData = await User.findOne({ email: email });
            console.log(email, password, userData);
            if (!userData) {
                res.render('logine1', { message: "Email is incorrect" });
                return;
            }
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (!passwordMatch) {
                res.render('logine1', { message: "Password is incorrect" });
                return;
            }
            req.session.user_id = userData._id;
            res.redirect("/index1");
        } catch (error) {
            console.log(error.message);
            res.render('logine1', { message: "An error occurred. Please try again." });
        }
    };
    
const forgotspass = async(req,res)=>{
        try{
            res.render('forgotemail');
        }
        catch(error){
            console.log(error.message); 
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);  
        }
    }

const changepass = async(req,res)=>{
        try{
            const email = req.session.email;
            console.log(email)
            res.render('changepassword');
        }
        catch(error){
            console.log(error.message); 
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);  
        }
    }

const updatePassword = async (req, res) => {
        try {
            const { password, confirmPassword } = req.body;
            const email = req.session.email;
            if (!email) {
                return res.redirect('/forgot');
            }
    
            if (!validatePassword(password)) {
                return res.render('changepassword', { message: "Invalid password format" });
            }
            if (password !== confirmPassword) {
                return res.render('changepassword', { message: "Passwords do not match" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.findOneAndUpdate({ email }, { password: hashedPassword });
            console.log("Sdfsdfaaaa",user);
            if (!user) {
                return res.render('changepassword', { message: "User not found" });
            }
    
            res.redirect('/login?message=Password changed successfully');
        } catch (error) {
            console.log(error.message);
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error', { errorMessage: 'Internal Server Error' });
        }
    };function validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    }

const handleForgotPass = async (req, res) => {
        try {
            const email = req.body.email.trim();
            if (!email) {
                return res.render('forgotemail', { message: "Email is required" });
            }
    
            req.session.email = email; 

        console.log('forgot',email),
        
            res.redirect('/forgot/otp');
        } catch (error) {
            console.log(error.message);
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error', { errorMessage: 'Internal Server Error' });
        }
    };

const insertUser = async (req, res) => {
        try {
            console.log("enter into register ");
            const { email, name, phone, password, confirmPassword, reference } = req.body;
    
            const phonePattern = /^[1-9][0-9]{9}$/;
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
            if (email.trim() === "" || name.trim() === "" || phone.trim() === "" || password.trim() === "" ||
                !emailPattern.test(email) || !phonePattern.test(phone) || /\s/.test(name) || name.length < 3 ||
                !validatePassword(password) || password !== confirmPassword) {
                return res.render('register', { message: "Invalid input" });
            }
            
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.render('register', { message: "Email address already registered" });
            } else if (reference) {
                const referringUser = await User.findOne({ reference });
                if (referringUser) {
                    console.log("theuse", referringUser);
                    const userId = referringUser._id;
                    console.log(userId);
    
                    req.session.reference = 500;
    
                    console.log("Looking for user's wallet");
                    let userWallet = await wallet.findOne({ userId });
                   if (userWallet) {
                        console.log("Updating existing wallet");
                        const walletId = userWallet._id;
                        const newRefundAmount = 500;
                        userWallet.refund.push({ amount: newRefundAmount });
                        userWallet.totalAmount += newRefundAmount;
                        await userWallet.save();
                    } else {
                        console.log("Creating new wallet");
                        const newRefundAmount = 500;
                        const newWallet = new wallet({
                            userId,
                            refund: [{ amount: newRefundAmount }],
                            totalAmount: newRefundAmount
                        });
                        await newWallet.save();
                    }
                } else {
                    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('register', { message: "Referral code does not exist" });
                }
            }
    
            const spassword = await securePassword(password);
            const user = new User({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                password: spassword,
                is_admin: 0,
            });
            console.log(user);
    
            req.session.temp = user;
            req.session.email = email;
            const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
            console.log(otpCode);
            req.session.otp = otpCode;
            const otpExpiration = 1 * 60; 
            req.session.otpExpiration = otpExpiration;
            req.session.otpGeneratedAt = Date.now(); 
    
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: process.env.USER_NAME,
                    pass: process.env.USER_PASSWORD
                }
            });
    
            const mailOptions = {
                from: process.env.USER_NAME,
                to: email,
                subject: "Verification Code",
                text: `Your OTP code is ${otpCode}`
            };
    
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.error("Error sending mail ", err);
                    const statusCode = 500;
                    const errorMessage = "Failed to send OTP mail";
                    return res.status(statusCode).render('error', { statusCode, errorMessage });
                } else {
                    console.log("Email sent: " + info.response);
                    res.redirect("/registerOtp");
                }
            });
    
        } catch (error) {
            console.log(error.message);
            res.render('logine1', { message: "An error occurred during registration" });
        }
    };
    
    function validatePassword(password) {
        const minLength = 6;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    }

const resendOtp = async (req, res) => {
        try {
        console.log("sdfsd")
        const email = req.session.email; 
        if (!email) {
            return res.status(STATUS_CODES.BAD_REQUEST).send('Email not found in session');
        }
            const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
            console.log(otpCode);
            req.session.otp = otpCode;
            const otpExpiration = 1 * 60; 
            req.session.otpExpiration = otpExpiration;
            req.session.otpGeneratedAt = Date.now(); 
    
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: process.env.USER_NAME,
                    pass: process.env.USER_PASSWORD
                }
            });
            const mailOptions = {
                from: process.env.USER_NAME,
                to: email,
                subject: "Verification Code",
                text: `Your OTP code is ${otpCode}`
            };
    
            transporter.sendMail(mailOptions, function(err, info) {
                if (err) {
                    console.error("Error sending mail ", err);
                    const statusCode = 500;
                    const errorMessage = "Failed to send OTP mail";
                    res.status(statusCode).render('error', { statusCode, errorMessage });
                    return;
                } else {
                    console.log("Email sent: " + info.response);
                    res.json({ otpExpiration, otpGeneratedAt: req.session.otpGeneratedAt });
                }
            });
        } catch (error) {
            console.log(error.message);
            res.render('logine1', { message: "An error occurred during registration" });
        }
    };  

const forgotpassotp = async (req, res) => {
        try {
      const email = req.session.email; 
    
        if (!email) {
            return res.status(STATUS_CODES.BAD_REQUEST).send('Email not found in session');
        }
            const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
            console.log(otpCode);
            req.session.otp = otpCode;
            const otpExpiration = 1 * 60; 
            req.session.otpExpiration = otpExpiration;
            req.session.otpGeneratedAt = Date.now(); 
    
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: process.env.USER_NAME,
                    pass: process.env.USER_PASSWORD
                }
            });
            const mailOptions = {
                from: process.env.USER_NAME,
                to: email,
                subject: "Verification Code",
                text: `Your OTP code is ${otpCode}`
            };
    
            transporter.sendMail(mailOptions, function(err, info) {
                if (err) {
                    console.error("Error sending mail ", err);
                    const statusCode = 500;
                    const errorMessage = "Failed to send OTP mail";
                    res.status(statusCode).render('error', { statusCode, errorMessage });
                    return;
                } else {
                    console.log("Email sent: " + info.response);
                    res.redirect("/forgotregisterOtp");
                }
            });
        } catch (error) {
            console.log(error.message);
    
        }
    };   

const verifyRegister = async (req, res) => {
        try {
            console.log("enter in to otpcheck page");
            let OTPs = req.body.OTP;
            var loadOtp = req.session.otp;
            console.log("2otp", OTPs, loadOtp);
            var k = Date.now()
            console.log(OTPs);
            console.log(k);
           
           
            if (Date.now() > req.session.otpGeneratedAt + req.session.otpExpiration * 1000) {
                
                return res.render('registerotp', { message: "OTP has expired", otpExpiration: req.session.otpExpiration,  otpGeneratedAt :req.session.otpGeneratedAt });
            }
    
            if (loadOtp === OTPs) {
                function generateReferralCode(length) {
                    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                    let code = '';
                    for (let i = 0; i < length; i++) {
                        const randomIndex = Math.floor(Math.random() * characters.length);
                        code += characters.charAt(randomIndex);
                    }
                    return code;
                }
                const referralCode = generateReferralCode(8);
                let cust = req.session.temp;
                const user = new User({
                    name: cust.name,
                    email: cust.email,
                    phone: cust.phone,
                    password: cust.password,
                    reference:referralCode,
                    is_admin: 0
                });
               console.log("referral code",user)
                const userData = await user.save();
                if (userData) {
                    
                    const token = jwt.sign({ id: userData._id }, process.env.JWT_SECRET, { expiresIn: '3h' });
                    res.cookie("jwt", token, { httpOnly: true, maxAge: 600000 });
                    res.render('logine1', { message: "Registration is successful" });
                }
            } else {
                res.render('registerotp', { message: "OTP is not correct", otpExpiration: req.session.otpExpiration,  otpGeneratedAt :req.session.otpGeneratedAt });
            }
        } catch (error) {
            if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
                return res.render('logine1', { message: "Email address already registered" });
            }
            console.log(error);
            const errorMessage = "Internal Server Error";
            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error', { statusCode: 500, errorMessage });
        }
    };

const verifyRegister1 = async (req, res) => {
        try {
            console.log("enter in to otpcheck page");
            let OTPs = req.body.OTP;
            var loadOtp = req.session.otp;
            console.log("2otp", OTPs, loadOtp);
            var k = Date.now()
            console.log(OTPs);
            console.log(k);
            if (Date.now() > req.session.otpGeneratedAt + req.session.otpExpiration * 1000) {
                console.log("hi");
                return res.render('registerotp', { message: "OTP has expired", otpExpiration: req.session.otpExpiration,  otpGeneratedAt :req.session.otpGeneratedAt });
            }
            if (loadOtp === OTPs) {
            res.redirect('/changepassword')
            } else {
                res.render('forgotregisterotp', { message: "OTP is not correct", otpExpiration: req.session.otpExpiration,  otpGeneratedAt :req.session.otpGeneratedAt });
            }
        } catch (error) {
            if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
                return res.render('logine1', { message: "Email address already registered" });
            }
            console.log(error);
            const errorMessage = "Internal Server Error";
            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error', { statusCode: 500, errorMessage });
        }
    };

const forgotregisterOtp = async (req, res) => {
        try {
            console.log("enter in to register otp");
            const otpExpiration = req.session.otpExpiration;
            const otpGeneratedAt = req.session.otpGeneratedAt;
            console.log("hi")
            res.render('forgotregisterotp', { otpExpiration, otpGeneratedAt });
            console.log("adsfasdfadsfafsadadfasfddsa")
        } catch (error) {
            console.log(error.message);
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error', { statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR, errorMessage: MESSAGES.INTERNAL_SERVER_ERROR });
        }
    };
    
    
const registerOtp = async (req, res) => {
        try {
            console.log("enter in to register otp");
            const otpExpiration = req.session.otpExpiration;
            const otpGeneratedAt = req.session.otpGeneratedAt;
            console.log("hi")
            res.render('registerotp', { otpExpiration, otpGeneratedAt });
            console.log("adsfasdfadsfafsadadfasfddsa")
        } catch (error) {
            console.log(error.message);
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error', { statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR, errorMessage: MESSAGES.INTERNAL_SERVER_ERROR });
        }
    };
    
    
const logout = async(req,res)=>{
    try{  
        delete req.session.user_id;
            res.redirect('/login');
            console.log("hi");
        }
   catch(error){
    console.log(error.message);
    res.redirect('/login');
    }
    }

const userdetails = async(req,res)=>{
try{     if (req.session.user_id) {
    const userData = await User.findById(req.session.user_id);
    if (userData && userData.is_blocked) {
        return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
    }
} else {
    return res.redirect('/login');
}

    console.log("User ID from session:", req.session.user_id);
const userData = await User.findById({_id:req.session.user_id});
        res.render('userdetails',{user:userData});
        }
catch(error){
 console.log(error.message);  
 res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR); 
 }}

const useredit = async(req,res)=>   
{try{if (req.session.user_id) {
    const userData = await User.findById(req.session.user_id);
    if (userData && userData.is_blocked) {
        return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
    }
} else {
    return res.redirect('/login');
}
const id = req.params.id;
const user = await User.findById(id);
res.render('editprofile',{user});
}
catch(error){
console.log(error.message);
res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
}
}

const updateUsers = async(req,res)=>{
try{if (req.session.user_id) {
    const userData = await User.findById(req.session.user_id);
    if (userData && userData.is_blocked) {
        return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
    }
} else {
    return res.redirect('/login');
}
const id = req.params.id
console.log(req.body)
const catte = await User.findByIdAndUpdate(id,{$set:{name:req.body.customerName,phone:req.body.phoneNumber,email:req.body.emailAddress}})
res.redirect('/user')  
}
catch(error)
{console.log(error.message)
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
}}

const addaddress = async (req, res) => {
try {if (req.session.user_id) {
    const userData = await User.findById(req.session.user_id);
    if (userData && userData.is_blocked) {
        return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
    }
} else {
    return res.redirect('/login');
}
    res.render('add-address'); 
    } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
};

const insertaddress = async(req, res) => {
    try {if (req.session.user_id) {
        const userData = await User.findById(req.session.user_id);
        if (userData && userData.is_blocked) {
            return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
        }
    } else {
        return res.redirect('/login');
    }
    const { fullName, addressLine1, city, state, postalCode, phoneNumber } = req.body;
    const userId = req.session.user_id;
       console.log(addressLine1);
      console.log("Request Body:", req.body); 
      const address1 = new address({
        userId: userId,
        fullName: fullName,
        addressLine1: addressLine1,
        city: city,
        state: state,
        postalCode: postalCode,
        phoneNumber: phoneNumber
      });
      await address1.save();
      console.log("d",address1);
      res.redirect('/address');
    } catch (error) {
      console.log(error.message);
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR); }
  };

const addresslist = async(req, res) => {
        try {  if (req.session.user_id) {
            const userData = await User.findById(req.session.user_id);
            if (userData && userData.is_blocked) {
                return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED});
            }
        } else {
            return res.redirect('/login');
        } const userid = req.session.user_id;
            console.log("User ID from session:", userid);
            const Address = await address.find({userId:userid});
            console.log("Fetched Addresses:", Address);
            res.render('address',{address:Address});; 
        } catch (error) {
            console.log(error.message);
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error');
        }
    };

const deleteAddress = async (req, res) => {
        try {
            const id = req.params.id;
            await address.deleteOne({ _id: id });
            res.redirect('/address');
            res.sendStatus(STATUS_CODES.SUCCESS);
        } catch (error) {
            console.log(error.message);
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error')
        }
    };

const addressedit = async(req,res)=>
{try{if (req.session.user_id) {
    const userData = await User.findById(req.session.user_id);
    if (userData && userData.is_blocked) {
        return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
    }
} else {
    return res.redirect('/login');
}
const id = req.params.id
const address12 = await address.findById(id)
res.render('edit-address',{address:address12});
}
catch(error){
    console.log(error.message);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
}}

const updateaddress = async(req,res)=>{
try{if (req.session.user_id) {
    const userData = await User.findById(req.session.user_id);
    if (userData && userData.is_blocked) {
        return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
    }
} else {
    return res.redirect('/login');
}
    const id = req.params.id
    console.log(req.body)
    const catte = await address.findByIdAndUpdate(id,{$set:{fullName:req.body.fullName,phoneNumber:req.body.phoneNumber,addressLine1:req.body.addressLine1,city:req.body.city,state:req.body.state,postalCode:req.body.postalCode}})
    console.log(catte);
    res.redirect('/address');  
    }
catch(error)
    {console.log(error.message)
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
    }}

const productdetails = async(req,res)=>{
try{ if (req.session.user_id) {
    const userData = await User.findById(req.session.user_id);
    if (userData && userData.is_blocked) {
        return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
    }
} else {
    return res.redirect('/login');
}const productId = req.params.productId;
     const product = await Products.findById(productId);
    res.render('product-details', {Product: product });
                }
        catch(error){
         console.log(error.message);  
         res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR); 
         }}

const getCartItems = async (req, res) => {
 try {  if (req.session.user_id) {
    const userData = await User.findById(req.session.user_id);
    if (userData && userData.is_blocked) {
        return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED});
    }
} else {
    return res.redirect('/login');
}     const userId = req.session.user_id;
             const s = await Cart.findOne({userId:userId})
          
                const updatedCart = await Cart.aggregate([
                    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
                    { $unwind: "$products" },
                    {
                        $lookup: {
                            from: "products",
                            localField: "products.productId",
                            foreignField: "_id",
                            as: "productDetails"
                        }
                    },
                    { $unwind: "$productDetails" },
                    {
                        $project: {
                             _id: "$products._id",
                            productId: "$productDetails._id",
                            productName: "$productDetails.productname",
                            productPrice: "$productDetails.price",
                            productDescription: "$productDetails.details",
                            productImage: {
                                $cond: {
                                    if: { $eq: [{ $isArray: "$productDetails.image" }, true] },
                                    then: { $arrayElemAt: ["$productDetails.image", 0] },
                                    else: null 
                                }
                            },
                            stock: "$productDetails.stock",
                            quantity: "$products.quantity",
                            size: "$products.size" ,
                            total: "$products.total"
                        }
                    }
                ]);
         console.log("updatedCart", updatedCart);
         console.log("dsfyds",cart)
         console.log("dsfyds",s)
         console.log('update cart === ',updatedCart)
         res.render('cart',{updatedCart:updatedCart,s:s});

 } catch (error) {
                console.log(error.message);
                res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error');
              }
        };

const addToCart = async (req, res) => {
        try {if (req.session.user_id) {
                const userData = await User.findById(req.session.user_id);
                if (userData && userData.is_blocked) {
                    return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED});
                }
            } else {
                return res.redirect('/login');
            }
               console.log("enter in to addToCart");
                const userId = req.session.user_id;
                console.log(userId);
                const productId = req.body.productId;
                console.log(productId,"prod")
                const quantity = parseInt(req.body.quantity);
                const size = req.body.size;
                console.log("DSf")
                let saveData = await Cart.findOne({ userId: userId });
                console.log(saveData);
                const pr1 = await products.findOne({ _id: productId });
     if (!saveData) {console.log("ome")
                 const pr = await products.findOne({ _id: productId });
                 if (!pr) {
                    return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: 'Product not found.' });
                } if (quantity > pr.stock || quantity>10) {
                    return res.json({
                        success: false,
                        message: 'Item cannot be added to the cart.'
                    });
                }
                    console.log("Product details:", pr);
                    let sub = pr.price * quantity;
                    console.log("Subtotal:", sub);
                    saveData = new Cart({
                        userId: userId,
                        products: [{
                            productId: productId,
                            size: size,
                            quantity: quantity
                        }],
                        total: sub
                    });
                    // pr.stock -= quantity;
                    // console.log(pr.stock,"adfsadf")
             
                    await saveData.save();
                    console.log("Saved cart:", saveData);
                } else {console.log("Dasfsd")
                    const existingProductIndex = saveData.products.findIndex(item => item.productId.toString() === productId);
                    if (existingProductIndex !== -1) {
                        const existingProduct = saveData.products[existingProductIndex];
                        console.log(existingProduct.quantity,"quantity")
                        if (existingProduct.quantity + quantity > pr1.stock || existingProduct.quantity + quantity > 10 ) {
                            return res.json({
                                success: false,
                                message: 'Item cannot be added to the cart.'
                            });
                        }
                        saveData.products[existingProductIndex].quantity += quantity;
                      
                    } else {
                        if (quantity > pr1.stock || quantity>10) {
                            return res.json({
                                success: false,
                                message: 'Item cannot be added to the cart.'
                            });
                        }
                        saveData.products.push({
                            productId: productId,
                            size: size,
                            quantity: quantity
                        });
                    }
                   let totalAmount = 0;
                    for (const product of saveData.products) {
                        const pr = await products.findOne({ _id: product.productId });
                        totalAmount += pr.price * product.quantity;
                    }
                    saveData.total = totalAmount;
               
    
                    await saveData.save();
                    console.log("Saved cart with updated total:", saveData);
                }
            
                console.log("Saved cart wie total:", saveData.total);
               res.json({ success: true, message: 'Item added to cart successfully.' });
            } catch (error) {
                console.log(error);
                res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.INTERNAL_SERVER_ERROR });
            }
        };
        
const deleteCart = async (req, res) => {
    try {
        const itemId = req.params.itemId; 
        const userId = req.session.user_id; 
        // const cart = await Cart.findOne({ userId: userId });
        // const productToRemove = cart.products.find(product => product._id.toString() === itemId);
        // const product = await Products.findById(productToRemove.productId);
        await Cart.updateOne(
            { userId: userId },
            { $pull: { products: { _id: itemId } } }
        );
        // product.stock += productToRemove.quantity;
        // await product.save();


        res.sendStatus(STATUS_CODES.SUCCESS);
    } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
};


const checkout = async (req, res) => {
    try {
        if (req.session.user_id) {
            const userData = await User.findById(req.session.user_id);
            if (userData && userData.is_blocked) {
                return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
            }
        } else {
            return res.redirect('/login');
        }

        const userId = req.session.user_id;
        const Address = await address.find({ userId: userId });
        const userData = await User.findOne({ _id: userId });

        const coupon1 = await Coupon.find();
        const saveData = await Cart.find({ userId: userId });
        const originalTotal = saveData.reduce((acc, cart) => acc + (cart.total || 0), 0);

        let couponStatus = saveData[0]?.coupon || "Not Applied";
        let discountAmount = saveData[0]?.discountAmount || 0; 
        let appliedCouponCode = saveData[0]?.couponId 
            ? (await Coupon.findById(saveData[0].couponId))?.couponCode 
            : "";

        const total = originalTotal - discountAmount; 

        res.render('checkout', {
            address: Address,
            coup: coupon1.filter(coupon => originalTotal >= coupon.min_amount && originalTotal > coupon.discount_amount),
            total, 
            originalTotal, 
            discountAmount, 
            saveData: saveData.length > 0 ? saveData : [{ coupon: "Not Applied" }],
            appliedCouponCode,
        });
    } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
};



const checkaddressedit = async(req, res) => {
            try{if (req.session.user_id) {
                const userData = await User.findById(req.session.user_id);
                if (userData && userData.is_blocked) {
                    return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
                }
            } else {
                return res.redirect('/login');
            }
            const id = req.params.id
            const address12 = await address.findById(id)
            res.render('edit-checkoutadress',{address:address12});
            }
            catch(error){
                console.log(error.message);
            }
        };

const updatecheckedaddress = async(req,res)=>{
            try{if (req.session.user_id) {
                const userData = await User.findById(req.session.user_id);
                if (userData && userData.is_blocked) {
                    return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
                }
            } else {
                return res.redirect('/login');
            }
                const id = req.params.id
                console.log(req.body)
                const catte = await address.findByIdAndUpdate(id,{$set:{fullName:req.body.fullName,phoneNumber:req.body.phoneNumber,addressLine1:req.body.addressLine1,city:req.body.city,state:req.body.state,postalCode:req.body.postalCode}},{new:true})
                console.log("updated address",catte);
                res.redirect('/checkout');  
                }
            catch(error)
                {console.log(error.message)}
            
            }  

            const payment = async (req, res) => {
                try {if (req.session.user_id) {
                    const userData = await User.findById(req.session.user_id);
                    if (userData && userData.is_blocked) {
                        return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
                    }
                } else {
                    return res.redirect('/login');
                }
                    const userId = req.session.user_id;
                    const cartItems = await Cart.find({ userId }).populate('products.productId');
                    const totalSum = cartItems.reduce((acc, cart) => acc + cart.total, 0);
                    
                    const isCodAvailable = totalSum <= 1000; 
                    
                    console.log(totalSum);
                    res.render('payment', { total: totalSum, cartItems, isCodAvailable });
                } catch (error) {
                    console.log(error.message);
                    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
                }
            };
            
        const ordersuccess = async (req, res) => {
                    try {if (req.session.user_id) {
                        const userData = await User.findById(req.session.user_id);
                        if (userData && userData.is_blocked) {
                            return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED});
                        }
                    } else {
                        return res.redirect('/login');
                    }
                      const userId = req.session.user_id;
                      const addressId = req.query.addressId; 
                      console.log('Address ID:', addressId);
                      const cartItems = await Cart.find({ userId }).populate('products.productId');
cartItems.forEach(cart => {
    console.log(cart.couponId, "Coupon ID for cart");
});
const couponId = cartItems[0]?.couponId || null;
                      const totalSum = cartItems.reduce((acc, cart) => acc + cart.total, 0);
                      console.log('Total Sum:', totalSum);
                      const orderProducts = [];
                     for (const cart of cartItems) {
                        for (const product of cart.products) {
                          if (product.productId) {
                          
                            orderProducts.push({
                              productId: product.productId._id,
                              quantity: product.quantity,
                              productname: product.productId.productname,
                              Image: product.productId.image,
                              price: product.productId.price,
                              couponId: cart.couponId || null 
                            });
                  
                            const productId = product.productId._id;
                            const orderedQuantity = product.quantity;
                           
                            const foundProduct = await products.findById(productId);
                            
                            if (!foundProduct) {
                              throw new Error('Product not found');
                            }
                  
                
                            foundProduct.stock -= orderedQuantity;
                  
                            
                            await foundProduct.save();
                            console.log(`Stock reduced for product ${foundProduct._id} by ${orderedQuantity}`);
                          }
                        }
                      }
                  const order = new orderModel({
                        userId,
                        addressid: addressId,
                        products: orderProducts,
                        totalAmount: totalSum,
                        status: "Paid",
                        payment: "online payment", 
                        couponId
                      });
                  
                      const savedOrder = await order.save();

                      console.log('Saved Order:', savedOrder);
                     const cartDelete = await Cart.findOne({userId: userId})
                     if(cartDelete){
                        await Cart.findByIdAndDelete(cartDelete._id);
                     }
                      
                      res.redirect('/order-successfull');
                    } catch (error) {
                      console.error('Error placing order:', error);
                      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
                    }
                  };
                  

                  const order = async (req, res) => {
                    try {
                        if (req.session.user_id) {
                            const userData = await User.findById(req.session.user_id);
                            if (userData && userData.is_blocked) {
                                return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
                            }
                        } else {
                            return res.redirect('/login');
                        }
                
                        const userId = req.session.user_id;
                        const page = parseInt(req.query.page) || 1;
                        const limit = 5; 
                        const skip = (page - 1) * limit;
                
                      
                        const totalOrders = await orderModel.countDocuments({ userId: userId });
                        const orders = await orderModel.find({ userId: userId })
                            .sort({ orderDate: -1 }) 
                            .skip(skip)
                            .limit(limit);
                
                        const totalPages = Math.ceil(totalOrders / limit);
                
                        res.render('order', {
                            order1: orders,
                            currentPage: page,
                            totalPages: totalPages
                        });
                    } catch (error) {
                        console.log(error.message);
                        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
                    }
                };
                
                
                const orderview = async (req, res) => {
                    try {
                        if (req.session.user_id) {
                            const userData = await User.findById(req.session.user_id);
                            if (userData && userData.is_blocked) {
                                return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
                            }
                        } else {
                            return res.redirect('/login');
                        }
                
                        const userId = req.session.user_id;
                        const orderId = req.query.orderId;
                
                        const order = await orderModel.findById(orderId)
                            .populate('products.productId')
                            .populate('userId')
                            .populate('addressid');
                            const user = await User.findById(order.userId)
                            const Address = await address.findById(order.addressid);
                            console.log(order,"dfs")
                   
                      
          
                        let discountAmount = 0;
                        if (order.couponId) {
                            const coupon = await Coupon.findById( order.couponId );
                            console.log(coupon,"Asdfsd")
                            if (coupon) {
                         
                                discountAmount = coupon.discount_amount || 0;
                            }
                        }
                
                   

                        res.render('order-view', {
                            order,
                            user,
                            Address,
                            discountAmount
                        });
                    } catch (error) {
                        console.log(error.message);
                        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
                    }
                };
                

const checkedaddaddress = async (req, res) => {
                    try {if (req.session.user_id) {
                        const userData = await User.findById(req.session.user_id);
                        if (userData && userData.is_blocked) {
                            return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED});
                        }
                    } else {
                        return res.redirect('/login');
                    }
                        res.render('add-checkoutadress'); 
                        } catch (error) {
                            console.log(error.message);
                            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(MESSAGES.INTERNAL_SERVER_ERROR);
                        }
                    };

const checkaddressinsert = async(req, res) => {
                    try{if (req.session.user_id) {
                        const userData = await User.findById(req.session.user_id);
                        if (userData && userData.is_blocked) {
                            return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
                        }
                    } else {
                        return res.redirect('/login');
                    }
                        const { fullName, addressLine1, city, state, postalCode, phoneNumber } = req.body;
                       console.log("Request Body:", req.body); 
                       const address2 = new address({
                         fullName: fullName,
                         userId: req.session.user_id,
                         addressLine1: addressLine1,
                         city: city,
                         state: state,
                         postalCode: postalCode,
                         phoneNumber: phoneNumber
                       });
                       await address2.save();
                       console.log(address2);       
                       res.redirect('/checkout');
                    }
                    catch(error){
                        console.log(error.message);
                        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
                    }
                };
                const searchProduct = async (req, res) => {
                    try {
                        if (req.session.user_id) {
                            const userData = await User.findById(req.session.user_id);
                            if (userData && userData.is_blocked) {
                                return res.render('logine1', { message: "Your account is blocked." });
                            }
                        } else {
                            return res.redirect('/login');
                        }
                
                        const inputLetter = req.body.search || req.query.search || '';
                        const categoryFilter = req.query.category || null;
                
                       
                        function escapeRegex(text) {
                            return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
                        }
                
                        let query = {};
                        if (inputLetter) {
                            const escapedInput = escapeRegex(inputLetter); 
                            if (inputLetter.length === 1) {
                               
                                query.productname = { $regex: `^${escapedInput}`, $options: "i" };
                            } else {
                         
                                query.productname = { $regex: escapedInput, $options: "i" };
                            }
                        }
                
                        if (categoryFilter) {
                            const category = await Category.findOne({ name: categoryFilter.toUpperCase() });
                            if (category) {
                                query.categoryId = category._id;
                            } else {
                                query.categoryId = null;
                            }
                        }
                
                        const sortOption = {};
                        const sortCriteria = req.body.sortOption || req.query.sort || "default";
                
                        switch (sortCriteria) {
                            case "lowtohigh":
                                sortOption.price = 1;
                                break;
                            case "hightolow":
                                sortOption.price = -1;
                                break;
                            case "alphabeticallyAZ":
                                sortOption.productname = 1;
                                break;
                            case "alphabeticallyZA":
                                sortOption.productname = -1;
                                break;
                        }
                
                        const page = parseInt(req.query.page) || 1;
                        const limit = parseInt(req.query.limit) || 2;
                        const skip = (page - 1) * limit;
                
                        const totalProducts = await Products.countDocuments(query);
                        const totalPages = Math.ceil(totalProducts / limit);
                
                        console.log("Query:", query);
                        console.log("Regex Input:", inputLetter);
                
                        sortOption._id = 1; 
                        const products = await Products.find(query)
                            .sort(sortOption)
                            .skip(skip)
                            .limit(limit);
                
                        const categories = await Category.find();
                
                        res.render("index1", {
                            inputLetter: inputLetter,
                            Products: products,
                            currentPage: page,
                            totalPages: totalPages,
                            limit: limit,
                            selectedCategory: categoryFilter,
                            categories: categories,
                            sortOption: sortCriteria,
                        });
                    } catch (error) {
                        console.error("Error:", error);
                        res.status(500).json({ error: "An error occurred while searching for products." });
                    }
                };
                
                
              
const cancelOrder = async (req, res) => {
                  try {if (req.session.user_id) {
                    const userData = await User.findById(req.session.user_id);
                    if (userData && userData.is_blocked) {
                        return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED});
                    }
                } else {
                    return res.redirect('/login');
                }
                    const orderId = req.params.orderId;
                    const order = await orderModel.findById(orderId);
                    if (!order) {
                      return res.status(STATUS_CODES.NOT_FOUND).send("Order not found");
                    }
                    const cancellableStatuses = ["Pending", "Processing", "Paid"];
                    if (!cancellableStatuses.includes(order.status)) {
                      return res.status(STATUS_CODES.BAD_REQUEST).send("Order cannot be cancelled");
                    }
                    
                   order.status = "Cancelled";
                   await order.save();
                   let wallet2 = await wallet.findOne({ userId: order.userId });
                    if (!wallet2) {
                      wallet2 = new wallet({ userId: order.userId });
                    }
                    wallet2.totalAmount += order.totalAmount;
                    wallet2.refund.push({ productId: order._id, amount: order.totalAmount,status:'Credited' });
                    await wallet2.save();
                   console.log(wallet2);
                    res.redirect('/order');
                  } catch (error) {
                    console.log(error.message);
                    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(MESSAGES.INTERNAL_SERVER_ERROR);
                  }
                };

const wishlist = async(req,res) => {
    try {console.log('hi');
        if (req.session.user_id) {
            const userData = await User.findById(req.session.user_id);
            if (userData && userData.is_blocked) {
                return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
            }
        } else {
            return res.redirect('/login');
        }
        const  userId = req.session.user_id;
        const productId = req.body.productId;
        console.log("kl",productId);
        let wish = await wishlist1.findOne({ productId: productId, userId: userId });
        if (!wish) {
            const wishnew = new wishlist1({
                userId: userId,
                productId: productId,
            });
            await wishnew.save();
        }
        res.json({ success: true, message: 'Item added to wishlist successfully.' });
         
       } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(MESSAGES.INTERNAL_SERVER_ERROR);
    }}

const wishlistpage = async(req,res) => {
console.log('hi')
if (req.session.user_id) {
    const userData = await User.findById(req.session.user_id);
    if (userData && userData.is_blocked) {
        return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED});
    }
} else {
    return res.redirect('/login');
}
const userId = req.session.user_id;

const wish12 = await wishlist1.find({ userId }).populate('productId');
res.render('wishlist', { wish12 });
} 

const deleteWish = async (req, res) => {
    try {if (req.session.user_id) {
        const userData = await User.findById(req.session.user_id);
        if (userData && userData.is_blocked) {
            return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
        }
    } else {
        return res.redirect('/login');
    }
        const id = req.params.id;
        await wishlist1.deleteOne({ _id: id });
        res.sendStatus(STATUS_CODES.SUCCESS);
    } catch (error) {
        console.log(error.message);  

    }
};  

const orderReturn=async(req,res)=>{
    try {if (req.session.user_id) {
        const userData = await User.findById(req.session.user_id);
        if (userData && userData.is_blocked) {
            return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
        }
    } else {
        return res.redirect('/login');
    }
        console.log("enter in to order return");
        const { orderId } = req.body
        console.log(orderId,"orderiddd");
        const update=await orderModel.findByIdAndUpdate({_id:orderId},{
            status:"requested for return"},{new:true})
            console.log(update,'upd');
res.json({ success: true, message: "Order has been canceled." });
    } catch (error) {
        console.log(error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
}

const wallet1 = async (req, res) => {
    try {
        if (req.session.user_id) {
            const userData = await User.findById(req.session.user_id);
            if (userData && userData.is_blocked) {
                return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
            }
        } else {
            return res.redirect('/login');
        }

        const userId = req.session.user_id;
        if (!userId) {
            return res.status(STATUS_CODES.BAD_REQUEST).send("User ID is required");
        }

        const wallet2 = await wallet.findOne({ userId: userId }).populate({
            path: 'refund.productId',
            populate: {
                path: 'products.productId',
                model: 'products',
                select: 'productname'
            }
        });

        if (!wallet2) {
            return res.render('wallet', { 
                wallet: { totalAmount: "No wallet amount", createdAt: null }, 
                refund: [] 
            });
        }

        // Sort refunds in reverse chronological order
        const refunds = wallet2.refund.slice().reverse();

        console.log("Wallet Details:", wallet2);

        res.render('wallet', { 
            wallet: wallet2, 
            refund: refunds 
        });
    } catch (error) {
        console.error("Error fetching wallet details:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
};

const updateQuantity = async(req,res)=>{
    try {if (req.session.user_id) {
        const userData = await User.findById(req.session.user_id);
        if (userData && userData.is_blocked) {
            return res.render('logine1', { message:MESSAGES.ACCOUNT_BLOCKED });
        }
    } else {
        return res.redirect('/login');
    }
        const quantity = Number(req.query.quantity);
        const productId = req.query.pid;
        console.log("id  ",productId);
        console.log('quadn', typeof quantity)
        const userId = req.session.user_id;
        let saveData = await Cart.findOne({ userId: userId });
            const existingProductIndex = saveData.products.findIndex(item => item.productId.toString() === productId);
            if (existingProductIndex !== -1) {
                saveData.products[existingProductIndex].quantity = quantity;
            } else {
                saveData.products.push({
                    productId: productId,
                    size: size,
                    quantity: quantity
                });
            }
            let totalAmount = 0;
            for (const product of saveData.products) {
                const pr = await products.findOne({ _id: product.productId });
                totalAmount += pr.price * product.quantity;
            }
            saveData.total = totalAmount;
            await saveData.save();
            console.log("Saved cart with updated total:", saveData);
            console.log("Saved cart wie total:", saveData.total);
   } catch (error) {
        console.log(error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
}

const applycoupon = async(req, res) => {
    try {if (req.session.user_id) {
        const userData = await User.findById(req.session.user_id);
        if (userData && userData.is_blocked) {
            return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
        }
    } else {
        return res.redirect('/login');
    }
        const Address = await address.find();
        let k = await Coupon.find();

        const couponCode = req.body.couponCode; 
        const userId = req.session.user_id;
        const couponFind = await Coupon.findOne({couponCode:couponCode})
        console.log(couponFind,"cou")
        const user = await User.findById(userId)
        console.log("user,adsf",user);
        if (user.coupon.includes(couponFind._id)) {
            return res.status(400).json({ success: false, message: 'Coupon already used' });
        }
        console.log('ji')
        const saveData = await Cart.find({userId: userId});
        console.log('ji')
        const totalSum = saveData.reduce((acc, cart) => acc + cart.total, 0);
        console.log("total",totalSum); 
        console.log("d",couponFind.discount_amount)
        if (Number(couponFind.discount_amount) > totalSum) {
            console.log('hi');
            return res.status(400).json({ success: false, message: 'Coupon discount amount exceeds the total value.' });
        }

        const coupon = await Coupon.findOne({ 
        couponCode:couponCode });
        console.log("discount amount",coupon);
        console.log(totalSum);
        console.log(coupon.discount_amount);
       
  let minus = Number(totalSum) - Number(coupon.discount_amount)
  console.log("sdfsf",minus);
  const updateCart=await Cart.findOneAndUpdate(
    { userId: userId},{total: minus},{new :true}
 )
 if(updateCart){
  const updateCouponStatus = await Cart.updateOne(
        { userId: userId },
        { coupon: "Applied" },{new:true}
    );
    const cartUpdate = await Cart.updateOne({userId: userId},{couponId:couponFind._id,discountAmount:coupon.discount_amount},{new:true})
   user.coupon.push(couponFind._id); 
    await user.save()
    res.json({ success: true, message: 'Coupon applied successfully' });
}  }
    catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
};

const removecoupon = async(req, res) => {
    try {if (req.session.user_id) {
        const userData = await User.findById(req.session.user_id);
        if (userData && userData.is_blocked) {
            return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
        }
    } else {
        return res.redirect('/login');
    }
        const Address = await address.find();
        const couponCode = req.body.couponCode;
        const userId = req.session.user_id;

        console.log('hii');   
        const user = await User.findById(userId);
        const saveData = await Cart.find({ userId: userId });
        const totalSum = saveData.reduce((acc, cart) => acc + cart.total, 0);

        console.log("sdfsdfs", totalSum); 
        const coupon = await Coupon.findOne({ couponCode: couponCode });

        if (!coupon) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: 'Coupon not found' });
        }

        console.log("discount amount", coupon);
        let add = Number(totalSum) + Number(coupon.discount_amount);
        
        const updateCart = await Cart.findOneAndUpdate(
            { userId: userId }, 
            { total: add }, 
            { new: true }
        );

        if (updateCart) {
            await Cart.updateOne(
                { userId: userId },
                { coupon: "Not Applied", couponId: null, discountAmount: 0 },
                { new: true }
            );
        
        await User.updateOne(
                { _id: userId },
                { $pull: { coupon: coupon._id } }
            );

            console.log("welcome to remove");
            console.log("this is the user", user);
            res.json({ success: true, message: 'Coupon removed successfully' });
        } else {
            res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: 'Failed to update cart' });
        }

         console.log('dsfsdf');
    } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
};

const orderfailure = async (req, res) => {
    try {if (req.session.user_id) {
        const userData = await User.findById(req.session.user_id);
        if (userData && userData.is_blocked) {
            return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED
             });
        }
    } else {
        return res.redirect('/login');
    }
      const userId = req.session.user_id;
      const addressId = req.query.addressId; 
      console.log('Address ID:', addressId);
      

      const cartItems = await Cart.find({ userId }).populate('products.productId');
      
      cartItems.forEach(cart => {
        console.log(cart.couponId, "Coupon ID for cart");
    });
    const couponId = cartItems[0]?.couponId || null;
      const totalSum = cartItems.reduce((acc, cart) => acc + cart.total, 0);
      console.log('Total Sum:', totalSum);
      
    
      const orderProducts = [];
  
  
      for (const cart of cartItems) {
        for (const product of cart.products) {
          if (product.productId) {
          
            orderProducts.push({
              productId: product.productId._id,
              quantity: product.quantity,
              productname: product.productId.productname,
              Image: product.productId.image,
              price: product.productId.price,
              couponId: cart.couponId || null 
            });
  
            const productId = product.productId._id;
            const orderedQuantity = product.quantity;
           
            const foundProduct = await products.findById(productId);
            
            if (!foundProduct) {
              throw new Error('Product not found');
            }
  

            foundProduct.stock -= orderedQuantity;
  
            
            await foundProduct.save();
            console.log(`Stock reduced for product ${foundProduct._id} by ${orderedQuantity}`);
          }
        }
      }
     const order = new orderModel({
        userId,
        addressid: addressId,
        products: orderProducts,
        totalAmount: totalSum,
        status: "Pending",
        payment: "not paid",
        couponId
      });
  

      const savedOrder = await order.save();

      console.log('Saved Order:', savedOrder);
     const cartDelete = await Cart.findOne({userId: userId})
     if(cartDelete){
        await Cart.findByIdAndDelete(cartDelete._id);
     }
      
      res.redirect('/order');
    } catch (error) {
      console.error('Error placing order:', error);
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
  };
  const google = async (req, res) => {
    try {
        const { email,name } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required for Google Login" });
        }

     
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                email,
                name , 
                        
                is_admin: 0,             
                isGoogleUser: true       
            });
        }

        console.log(user, "user");


        req.session.user_id = user._id;
        console.log(   req.session.user_id,"dssdf")

        res.status(200).json({ message: "Google login successful" });
    } catch (error) {
        console.error("Error in /google-login:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
const walletpayment = async (req, res) => {
    try {
        if (req.session.user_id) {
            const userData = await User.findById(req.session.user_id);
            if (userData && userData.is_blocked) {
                return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
            }
        } else {
            return res.redirect('/login');
        }

        const userId = req.session.user_id;
        const addressId = req.query.addressId;
        console.log('Address ID:', addressId);

        const cartItems = await Cart.find({ userId }).populate('products.productId');
        cartItems.forEach(cart => {
            console.log(cart.couponId, "Coupon ID for cart");
        });
        const couponId = cartItems[0]?.couponId || null;
        const wallet2 = await wallet.findOne({ userId: userId });

        if (!wallet2) {
            return res.status(400).json({ success: false, message: "Insufficient amount in wallet" });
        }

        console.log(wallet2, "ADSfsfd");

        const totalSum = cartItems.reduce((acc, cart) => acc + cart.total, 0);

 
        if (wallet2.totalAmount < totalSum) {
            return res.status(400).json({ success: false, message: "Insufficient wallet balance to pay the amount." });
        }

        wallet2.totalAmount -= totalSum;
        console.log('Total Sum:', totalSum);

        const orderProducts = [];
        for (const cart of cartItems) {
            for (const product of cart.products) {
                if (product.productId) {
                    orderProducts.push({
                        productId: product.productId._id,
                        quantity: product.quantity,
                        productname: product.productId.productname,
                        Image: product.productId.image,
                        price: product.productId.price,
                        couponId: cart.couponId || null 
                    });

                    const productId = product.productId._id;
                    const orderedQuantity = product.quantity;

                    const foundProduct = await products.findById(productId);
                    if (!foundProduct) {
                        throw new Error('Product not found');
                    }

                    foundProduct.stock -= orderedQuantity;
                    await foundProduct.save();
                    console.log(`Stock reduced for product ${foundProduct._id} by ${orderedQuantity}`);
                }
            }
        }

        const order = new orderModel({
            userId,
            addressid: addressId,
            products: orderProducts,
            totalAmount: totalSum,
            status: "Paid",
            payment: "online payment",
            couponId
        });

        const savedOrder = await order.save();
        wallet2.refund.push({ productId: order._id, amount: order.totalAmount, status: "Debited" });
        console.log(wallet2, 'wallet3');
        await wallet2.save();
        console.log('Saved Order:', savedOrder);

        const cartDelete = await Cart.findOne({ userId: userId });
        if (cartDelete) {
            await Cart.findByIdAndDelete(cartDelete._id);
        }

        res.redirect('/order-successfull');
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};


module.exports={updateQuantity,insertUser,securePassword,loginHome,loginLoad,verifyLogin,verifyRegister,registerOtp,logout,userdetails,useredit,updateUsers,insertaddress,addresslist,addresslist,insertaddress,addaddress,deleteAddress,addressedit,updateaddress,getCartItems,productdetails,addToCart,deleteCart,checkout,checkaddressedit,updatecheckedaddress,payment,ordersuccess,order,orderview,loginregister,checkedaddaddress,checkaddressinsert,searchProduct,cancelOrder,wishlist,wishlistpage,deleteWish,orderReturn,wallet1,applycoupon,removecoupon,resendOtp,forgotspass,forgotpassotp,handleForgotPass,forgotregisterOtp,verifyRegister1,changepass,updatePassword,loginLoadin,orderfailure,google,walletpayment};


