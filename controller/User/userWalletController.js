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
            const page = parseInt(req.query.page) || 1; // Current page
            const limit = 5; // Refunds per page
            const skip = (page - 1) * limit;
      
            const totalRefunds = 1;
            const totalPages = Math.ceil(totalRefunds / limit);
    
         
            return res.render('wallet', { 
                wallet: { totalAmount: "No wallet amount", createdAt: null }, 
                refund: [] ,
                currentPage: page, 
                totalPages 
            });
        }

        const page = parseInt(req.query.page) || 1; // Current page
        const limit = 5; // Refunds per page
        const skip = (page - 1) * limit;
        const refunds = wallet2.refund.slice().reverse();
        const totalRefunds = refunds.length;
        const totalPages = Math.ceil(totalRefunds / limit);

        const paginatedRefunds = refunds.slice(skip, skip + limit);

        res.render('wallet', { 
            wallet: wallet2, 
            refund: paginatedRefunds, 
            currentPage: page, 
            totalPages 
        });
    } catch (error) {
        console.error("Error fetching wallet details:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
};


module.exports={wallet1};