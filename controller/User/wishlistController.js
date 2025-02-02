
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

const wishlist = async(req,res) => {
    try {
      
        const  userId = req.session.user_id;
        const productId = req.body.productId;
       
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
    const wishlistpage = async (req, res) => {
        try {
            const userId = req.session.user_id;
            const wish12 = await wishlist1.find({ userId }).populate('productId');
  
            const filteredWishlist = wish12.filter(item => item.productId.list === false);
    
            res.render('wishlist', { wish12: filteredWishlist });
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            res.status(500).send("Internal Server Error");
        }
    };
const deleteWish = async (req, res) => {
    try {
        const id = req.params.id;
        await wishlist1.deleteOne({ _id: id });
        res.sendStatus(STATUS_CODES.SUCCESS);
    } catch (error) {
        console.log(error.message);  

    }
};  

module.exports={wishlistpage,deleteWish,wishlist};