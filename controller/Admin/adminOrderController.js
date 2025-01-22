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


const order = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 5; 
        const skip = (page - 1) * limit; 
        const searchTerm = req.query.search || ""; 

       
        function escapeRegex(text) {
            return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        }

   
        let searchFilter = {
            $or: [
                { "products.productname": { $regex: escapeRegex(searchTerm), $options: "i" } },
                { status: { $regex: escapeRegex(searchTerm), $options: "i" } },
                { trackingId: { $regex: escapeRegex(searchTerm), $options: "i" } }, 
            ],
        };

    
        const numericSearchTerm = parseFloat(searchTerm);
        if (!isNaN(numericSearchTerm)) {
            searchFilter.$or.push({ totalAmount: numericSearchTerm });
        }

       
        if (searchTerm.length === 1) {
            const escapedInput = escapeRegex(searchTerm);
            searchFilter.$or[2] = { trackingId: { $regex: `^${escapedInput}`, $options: "i" } };
            searchFilter.$or[0] = { "products.productname": { $regex: `^${escapedInput}`, $options: "i" } };
        }

      
        const totalOrders = await orderModel.countDocuments(searchFilter);

        const orders = await orderModel
            .find(searchFilter)
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalOrders / limit);


        res.render("orders", {
            order1: orders,
            currentPage: page,
            totalPages: totalPages,
            limit: limit,
            search: searchTerm, 
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};

const orderview1 = async (req, res) => {
    try {
        const orderId = req.query.orderId;
    
        const order = await orderModel.findById(orderId).populate('products.productId').populate('userId').populate('addressid'); 
        const user = await User.findById(order.userId)
        const Address = await address.findById(order.addressid)
        let discountAmount = 0;
        if (order.couponId) {
            const coupon = await coupon1.findById( order.couponId );
       
            if (coupon) {
            
                discountAmount = coupon.discount_amount || 0;
            }
        }
        res.render('orderview1', { order,user,Address,discountAmount });  
    } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.orderId; 
        const { status } = req.body; 
       await orderModel.findByIdAndUpdate(orderId, { status });

        res.redirect(`/admin/order?orderId=${orderId}`); 
    } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
};

const orderReturn1 = async (req, res) => {
    try {
   
        const { orderId } = req.body;
    
        const update = await orderModel.findByIdAndUpdate(
            { _id: orderId },
            { status: "returns" },
            { new: true }
        );
        await update.save();
        let wallet2 = await wallet.findOne({ userId: update.userId });
                    if (!wallet2) {
                      wallet2 = new wallet({ userId: update.userId });
                    }
                    wallet2.totalAmount += update.totalAmount;
                    wallet2.trackingId = update.trackingId
                    wallet2.refund.push({ productId: update._id, amount: update.totalAmount ,status: "Credited"});
                    await wallet2.save();
               
        res.json({ success: true, message: "Approval request sent." });
    } catch (error) {
        console.log(error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.INTERNAL_SERVER_ERROR});
    }
};

module.exports = {order,orderview1,updateOrderStatus,orderReturn1}