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



const userdetails = async(req,res)=>{
    try{   
 const userData = await User.findById({_id:req.session.user_id});
            res.render('userdetails',{user:userData});
            }
    catch(error){
     console.log(error.message);  
     res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR); 
     }}
    
    const useredit = async(req,res)=>   
    {try{
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
   
    const catte = await User.findByIdAndUpdate(id,{$set:{name:req.body.customerName,phone:req.body.phoneNumber,email:req.body.emailAddress}})
    res.redirect('/user')  
    }
    catch(error)
    {console.log(error.message)
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
    }}

    module.exports={userdetails,useredit,updateUsers};