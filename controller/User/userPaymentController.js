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
    
        res.render('payment', { total: totalSum, cartItems, isCodAvailable });
    } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
};

module.exports={payment};