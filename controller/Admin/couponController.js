const bycrypt = require('bcrypt');
const { STATUS_CODES,MESSAGES } = require('../../constants/constants');
const User = require('../../models/userModel');
const Category = require('../../models/categories');
const Products = require('../../models/productdata');
const { MongoError } = require('mongodb');
const {orderModel} = require('../../models/order')
const address = require('../../models/address');
const coupon1 = require('../../models/coupon');
const wallet = require('../../models/Wallet')
const offer12 = require('../../models/offer')
const Cart  = require('../../models/cart');
const wishlist1  = require('../../models/wishlist');
const moment = require('moment');



const coupon = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 5; 
        const skip = (page - 1) * limit;

        const totalCoupons = await coupon1.countDocuments();
        const couponcode = await coupon1.find().skip(skip).limit(limit).sort({_id:-1});

        res.render('coupon', {
            coup: couponcode,
            currentPage: page,
            totalPages: Math.ceil(totalCoupons / limit),
            totalCoupons,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error', { message: "Internal Server Error" });
    }
};


const addcoupon = async (req, res) => {
    try {
         const couponcode = await coupon1.find()
         res.render('add-coupon',{coup: couponcode});

  } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send('Internal Server Error');
    }
};

const insertcoupon = async (req, res) => {
    try {
        let { couponCode, discount_amount, min_amount,valid_from,valid_to } = req.body;

      couponCode = couponCode.trim();
        const existingCoupon = await coupon1.findOne({ couponCode: couponCode });

        if (existingCoupon) {
     
            return res.render('add-coupon', { message: 'Please use a different coupon code. This one already exists.' });
        }

       
        const coupon = new coupon1({
            min_amount: min_amount,
            couponCode: couponCode,
            discount_amount: discount_amount,
            valid_from: valid_from,
            valid_to: valid_to
        });

        await coupon.save();
       
        res.redirect('/admin/coupon');

    } catch (error) {
        console.error(error.message);
        res.render('add-coupon', { message: 'Failed to add coupon' });
    }
};


const deleteCoupon = async (req, res) => {
        try {
            const id = req.params.id;
            await coupon1.findByIdAndDelete(id);
            res.sendStatus(STATUS_CODES.SUCCESS);
        } catch (error) {
            console.log(error.message);
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send('Internal Server Error');
            }
    };


    module.exports = {coupon,addcoupon,insertcoupon,deleteCoupon};