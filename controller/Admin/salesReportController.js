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

const salesreport = async (req, res) => {
    try {
       
        const { min, max, filterType } = req.query;
        console.log(req.query);

        let minDate, maxDate;

        if (filterType) {
       
            const now = moment();

            if (filterType === 'week') {
                minDate = now.startOf('week').toDate();
                maxDate = now.endOf('week').toDate();
            } else if (filterType === 'month') {
                minDate = now.startOf('month').toDate();
                maxDate = now.endOf('month').toDate();
            } else if (filterType === 'year') {
                minDate = now.startOf('year').toDate();
                maxDate = now.endOf('year').toDate();
            }
        } else {
           
            minDate = min ? new Date(min) : null;
            maxDate = max ? new Date(max) : null;
        }

  
        const isValidDate = (date) => date instanceof Date && !isNaN(date);

  
        if (minDate && !isValidDate(minDate)) {
            console.log("Invalid min date:", min);
            return res.status(400).json({ message: "Invalid min date" });
        }
        if (maxDate && !isValidDate(maxDate)) {
            console.log("Invalid max date:", max);
            return res.status(400).json({ message: "Invalid max date" });
        }

        console.log("Received minDate:", minDate, "maxDate:", maxDate);

       
        let dateFilter = {};

        if (minDate && maxDate) {
          
            dateFilter.orderDate = { $gte: minDate, $lte: maxDate };
        } else if (minDate) {
    
            dateFilter.orderDate = { $gte: minDate };
        } else if (maxDate) {
         
            dateFilter.orderDate = { $lte: maxDate };
        }
        console.log("Date filter:", dateFilter);

        const orders = await orderModel.find(dateFilter).populate(
 'userId');

      
        const totalOrders = orders.length;
        const overallOrderAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const coupons = await coupon1.find();
        const totalDiscountAmount = coupons.reduce((sum, coupon) => sum + coupon.discount_amount, 0);

        res.render('sales-report', {
            orders: orders,
            totalOrders: totalOrders,
            overallOrderAmount: overallOrderAmount,
            totalDiscountAmount: totalDiscountAmount,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = {salesreport}