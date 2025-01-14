const Razorpay = require('razorpay'); 
const {orderModel} = require('../models/order');
const User = require('../models/userModel');
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

const Cart = require("../models/cart")

const renderProductPage = async(req,res)=>{
try {
  res.render('payment');
  } catch (error) {
        console.log(error.message);
    }
}


const payOnline = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const name = await User.findById(userId);
        console.log(name.name);
        console.log(name.email);
        console.log(name.phone);
        let name1 = name.name;
        let email1 = name.email;
        let phone1 = name.phone;
     
        const cartItems = await Cart.find({ userId }).populate('products.productId');
        const totalSum = cartItems.reduce((acc, cart) => acc + cart.total, 0);
        console.log(totalSum);
        const amount = totalSum*100
        console.log("amount-"+amount);
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: 'razorUser@gmail.com'
        }
       
         razorpayInstance.orders.create(options,
            (err, order)=>{
                if(!err){
                    res.status(200).send({
                        success:true,
                        msg:'Order Created',
                        order_id:order.id,
                        amount:amount,
                        key_id:RAZORPAY_ID_KEY, 
                        contact:phone1,
                        name: name1,
                        email: email1
                    });
                }
                else{
                    console.log(err);
                    res.status(400).send({success:false,msg:'Something went wrong!'});
                }
            } 
        );

    } catch (error) {
        console.log(error.message);
        res.render('error');
   }
}
const payOnline1 = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const orderId = req.body.orderId;
        const name = await User.findById(userId);
        let name1 = name.name;
        let email1 = name.email;
        let phone1 = name.phone;
        const order = await orderModel.findOne({ _id: orderId, userId }); 
        order.status = "Paid";
        await order.save();
        const totalSum = order.totalAmount; 
        const amount = totalSum * 100; 
        console.log("Amount to be paid:", amount);
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: `receipt_order_${orderId}`,
        };
        razorpayInstance.orders.create(options, (err, razorpayOrder) => {
            if (!err) {
                res.status(200).send({
                    success: true,
                    msg: 'Order Created',
                    order_id: razorpayOrder.id,
                    amount: amount,
                    key_id: RAZORPAY_ID_KEY,
                    contact: phone1, 
                    name: name1,
                    email: email1
                });
                }
                else{
                    console.log(err);
                    res.status(400).send({success:false,msg:'Something went wrong!'});
                }
            } 
        );

    } catch (error) {
        console.log(error.message);
        res.render('error');
   }
}

module.exports = {renderProductPage,payOnline,payOnline1}