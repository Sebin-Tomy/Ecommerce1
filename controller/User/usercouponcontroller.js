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




const applycoupon = async (req, res) => {
    try {
      

        const userId = req.session.user_id;
        const couponCode = req.body.couponCode;

        const couponFind = await Coupon.findOne({ couponCode });
        if (!couponFind) {
            return res.status(400).json({ success: false, message: 'Invalid coupon code' });
        }

        const user = await User.findById(userId);
        if (user.coupon.includes(couponFind._id)) {
            return res.status(400).json({ success: false, message: 'Coupon already used' });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(400).json({ success: false, message: 'Cart not found' });
        }

        const totalSum = cart.total || 0;
        const discountAmount = Math.round((couponFind.discount_amount / 100) * totalSum);
        const updatedTotal = totalSum - discountAmount;

        if (discountAmount >= totalSum) {
            return res.status(400).json({ success: false, message: 'Discount exceeds total amount' });
        }

        cart.total = updatedTotal;
        cart.coupon = "Applied";
        cart.couponId = couponFind._id;
        cart.discountAmount = discountAmount;

        await cart.save();
        user.coupon.push(couponFind._id);
        await user.save();

        res.json({ success: true, message: 'Coupon applied successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const removecoupon = async (req, res) => {
    try {
       

        const userId = req.session.user_id;
        const couponCode = req.body.couponCode;

        const couponFind = await Coupon.findOne({ couponCode });
        if (!couponFind) {
            return res.status(400).json({ success: false, message: 'Coupon not found' });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(400).json({ success: false, message: 'Cart not found' });
        }

        const originalTotal = Number(cart.total) + Number(cart.discountAmount); 
        cart.total = Math.round(originalTotal); 
        cart.coupon = "Not Applied";
        cart.couponId = null;
        cart.discountAmount = 0;

        await cart.save();
        await User.updateOne({ _id: userId }, { $pull: { coupon: couponFind._id } });

        res.json({ success: true, message: 'Coupon removed successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};
const checkout = async (req, res) => {
    try {
       

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


module.exports={applycoupon,removecoupon,checkout};