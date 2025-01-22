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

const google = async (req, res) => {
    try {
        const { email,name } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required for Google Login" });
        }
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                email,name, 
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



module.exports={loginLoad,logout,loginregister,forgotspass,handleForgotPass,changepass,updatePassword,loginLoadin,google};


