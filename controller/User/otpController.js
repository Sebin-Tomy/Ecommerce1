const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../models/userModel');
const nodemailer = require('nodemailer');
const { STATUS_CODES ,MESSAGES} = require('../../constants/constants');
const Products = require('../../models/productdata');
const address = require('../../models/address');
const Category = require('../../models/categories');
const {orderModel} = require('../../models/order');
const Cart  = require('../../models/cart');
const wishlist1  = require('../../models/wishlist');
const Coupon = require('../../models/coupon');
const products = require('../../models/productdata');
const { default: mongoose } = require('mongoose');
const cart = require('../../models/cart');
const wallet = require('../../models/Wallet')

const securePassword = async(password)=>{
    try{
        const passwordHash = await bcrypt.hash(password,10);
        console.log(password);
        return passwordHash;
    }catch(error){
       console.log(error.message);

    }
}

const insertUser = async (req, res) => {
    try {
        console.log("Enter into register");
        let { email, name, phone, password, confirmPassword, reference } = req.body;
        name = name.trim();
        email = email.trim();
        const phonePattern = /^[1-9][0-9]{9}$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email.trim() === "" || name.trim() === "" || phone.trim() === "" || password.trim() === "" ||
            !emailPattern.test(email) || !phonePattern.test(phone) || name.length < 3 ||
            !validatePassword(password) || password !== confirmPassword) {
            return res.render('register', { message: "Invalid input" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { message: "Email address already registered" });
        } else if (reference) {
            const referringUser = await User.findOne({ reference });

            if (!referringUser) {
                return res.render('register', { message: "Referral code does not exist" });
            }

            if (referringUser.isReferenceUsed) {
                return res.render('register', { message: "Referral code has already been used" });
            }

            console.log("Referral code valid:", referringUser);
            const userId = referringUser._id;

            req.session.reference = 500;

            let userWallet = await wallet.findOne({ userId });
            const newRefundAmount = 500;

            if (userWallet) {
                console.log("Updating existing wallet");
                userWallet.refund.push({ amount: newRefundAmount, status: "Credited" });
                userWallet.totalAmount += newRefundAmount;
                await userWallet.save();
            } else {
                console.log("Creating new wallet");
                const newWallet = new wallet({
                    userId,
                    refund: [{ amount: newRefundAmount, status: "Credited" }],
                    totalAmount: newRefundAmount
                });
                await newWallet.save();
            }

         
            referringUser.isReferenceUsed = true;
            await referringUser.save();
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
        req.session.otpExpiration = 1 * 60;
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

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Error sending mail:", err);
                return res.render('error', { message: "Failed to send OTP mail" });
            } else {
                console.log("Email sent:", info.response);
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

module.exports={insertUser,verifyRegister,registerOtp,resendOtp,forgotpassotp,forgotregisterOtp,verifyRegister1};