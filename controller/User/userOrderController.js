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

const ordersuccess = async (req, res) => {
    try {
      const userId = req.session.user_id;
      const addressId = req.query.addressId; 
      console.log('Address ID:', addressId);
      const cartItems = await Cart.find({ userId }).populate('products.productId');
cartItems.forEach(cart => {
console.log(cart.couponId, "Coupon ID for cart");
});
const couponId = cartItems[0]?.couponId || null;
      const totalSum = cartItems.reduce((acc, cart) => acc + cart.total, 0);
      console.log('Total Sum:', totalSum);
      const orderProducts = [];
     for (const cart of cartItems) {
        for (const product of cart.products) {
          if (product.productId) {
          
            orderProducts.push({
              productId: product.productId._id,
              quantity: product.quantity,
              productname: product.productId.productname,
              Image: product.productId.image,
              price: product.productId.price,
              couponId: cart.couponId || null 
            });
  
            const productId = product.productId._id;
            const orderedQuantity = product.quantity;
           
            const foundProduct = await products.findById(productId);
            
            if (!foundProduct) {
              throw new Error('Product not found');
            }
           foundProduct.stock -= orderedQuantity;
           await foundProduct.save();
            console.log(`Stock reduced for product ${foundProduct._id} by ${orderedQuantity}`);
          }
        }
      }
  const order = new orderModel({
        userId,
        addressid: addressId,
        products: orderProducts,
        totalAmount: totalSum,
        status: "Paid",
        payment: "Online payment", 
        couponId
      });
  
      const savedOrder = await order.save();

      console.log('Saved Order:', savedOrder);
     const cartDelete = await Cart.findOne({userId: userId})
     if(cartDelete){
        await Cart.findByIdAndDelete(cartDelete._id);
     }
      
      res.redirect('/order-successfull');
    } catch (error) {
      console.error('Error placing order:', error);
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
  };
  
const order = async (req, res) => {
    try {
       

        const userId = req.session.user_id;
        const page = parseInt(req.query.page) || 1;
        const limit = 5; 
        const skip = (page - 1) * limit;

      
        const totalOrders = await orderModel.countDocuments({ userId: userId });
        const orders = await orderModel.find({ userId: userId })
            .sort({ orderDate: -1 }) 
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalOrders / limit);

        res.render('order', {
            order1: orders,
            currentPage: page,
            totalPages: totalPages,
            limit: limit, 
        });
    } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
};


const orderview = async (req, res) => {
    try {
        
        const userId = req.session.user_id;
        const orderId = req.query.orderId;

  const order = await orderModel.findById(orderId)
            .populate('products.productId')
            .populate('userId')
            .populate('addressid');
            const user = await User.findById(order.userId)
            const Address = await address.findById(order.addressid);
          
   
      

        let discountAmount = 0;
        if (order.couponId) {
            const coupon = await Coupon.findById( order.couponId );
          
            if (coupon) {
         
                discountAmount = coupon.discount_amount || 0;
            }
        }
res.render('order-view', {
            order,
            user,
            Address,
            discountAmount
        });
    } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
};

const cancelOrder = async (req, res) => {
    try {  const orderId = req.params.orderId;
      const order = await orderModel.findById(orderId);
      if (!order) {
        return res.status(STATUS_CODES.NOT_FOUND).send("Order not found");
      }
      const cancellableStatuses = ["Pending", "Processing", "Paid"];
      if (!cancellableStatuses.includes(order.status)) {
        return res.status(STATUS_CODES.BAD_REQUEST).send("Order cannot be cancelled");
      }
    order.status = "Cancelled";
     await order.save();
     let wallet2 = await wallet.findOne({ userId: order.userId });
      if (!wallet2) {
        wallet2 = new wallet({ userId: order.userId });
      }
      wallet2.trackingId = order.trackingId
      wallet2.totalAmount += order.totalAmount;
      wallet2.refund.push({ productId: order._id, amount: order.totalAmount,status:'Credited' });
      await wallet2.save();
      for (const product of order.products) {
          const productId = product.productId;
          const quantity = product.quantity || 1; 
          const productData = await products.findById(productId);
    
          if (productData) {
            productData.stock += quantity; 
            await productData.save();
          }
        }
    
     
      res.redirect('/order');
    } catch (error) {
      console.log(error.message);
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
  };

const orderReturn=async(req,res)=>{
    try {
     
        const { orderId } = req.body
      
        const update=await orderModel.findByIdAndUpdate({_id:orderId},{
            status:"requested for return"},{new:true})
           
  res.json({ success: true, message: "Order has been canceled." });
    } catch (error) {
        console.log(error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
}

const orderfailure = async (req, res) => {
    try {
      const userId = req.session.user_id;
      const addressId = req.query.addressId; 

      

      const cartItems = await Cart.find({ userId }).populate('products.productId');
      
      cartItems.forEach(cart => {
        console.log(cart.couponId, "Coupon ID for cart");
    });
    const couponId = cartItems[0]?.couponId || null;
      const totalSum = cartItems.reduce((acc, cart) => acc + cart.total, 0);
     
      
    
      const orderProducts = [];
  
  
      for (const cart of cartItems) {
        for (const product of cart.products) {
          if (product.productId) {
          
            orderProducts.push({
              productId: product.productId._id,
              quantity: product.quantity,
              productname: product.productId.productname,
              Image: product.productId.image,
              price: product.productId.price,
              couponId: cart.couponId || null 
            });
  
            const productId = product.productId._id;
            const orderedQuantity = product.quantity;
           
            const foundProduct = await products.findById(productId);
            
            if (!foundProduct) {
              throw new Error('Product not found');
            }
           foundProduct.stock -= orderedQuantity;
           await foundProduct.save();
            console.log(`Stock reduced for product ${foundProduct._id} by ${orderedQuantity}`);
          }
        }
      }
     const order = new orderModel({
        userId,
        addressid: addressId,
        products: orderProducts,
        totalAmount: totalSum,
        status: "Pending",
        payment: "Online Payment",
        couponId
      });
  

      const savedOrder = await order.save();

  
     const cartDelete = await Cart.findOne({userId: userId})
     if(cartDelete){
        await Cart.findByIdAndDelete(cartDelete._id);
     }
      
      res.redirect('/order');
    } catch (error) {
      console.error('Error placing order:', error);
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
  };
  const walletpayment = async (req, res) => {
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
        const addressId = req.query.addressId;
      

        const cartItems = await Cart.find({ userId }).populate('products.productId');
        cartItems.forEach(cart => {
            console.log(cart.couponId, "Coupon ID for cart");
        });
        const couponId = cartItems[0]?.couponId || null;
        const wallet2 = await wallet.findOne({ userId: userId });

        if (!wallet2) {
            return res.status(400).json({ success: false, message: "Insufficient amount in wallet" });
        }

       

        const totalSum = cartItems.reduce((acc, cart) => acc + cart.total, 0);

 
        if (wallet2.totalAmount < totalSum) {
            return res.status(400).json({ success: false, message: "Insufficient wallet balance to pay the amount." });
        }

        wallet2.totalAmount -= totalSum;
 
        const orderProducts = [];
        for (const cart of cartItems) {
            for (const product of cart.products) {
                if (product.productId) {
                    orderProducts.push({
                        productId: product.productId._id,
                        quantity: product.quantity,
                        productname: product.productId.productname,
                        Image: product.productId.image,
                        price: product.productId.price,
                        couponId: cart.couponId || null 
                    });

                    const productId = product.productId._id;
                    const orderedQuantity = product.quantity;

                    const foundProduct = await products.findById(productId);
                    if (!foundProduct) {
                        throw new Error('Product not found');
                    }

                    foundProduct.stock -= orderedQuantity;
                    await foundProduct.save();
                    console.log(`Stock reduced for product ${foundProduct._id} by ${orderedQuantity}`);
                }
            }
        }

        const order = new orderModel({
            userId,
            addressid: addressId,
            products: orderProducts,
            totalAmount: totalSum,
            status: "Paid",
            payment: "Wallet payment",
            couponId
        });

        const savedOrder = await order.save();
        wallet2.trackingId = order.trackingId
        wallet2.refund.push({ productId: order._id, amount: order.totalAmount, status: "Debited" });
       
        await wallet2.save();
       

        const cartDelete = await Cart.findOne({ userId: userId });
        if (cartDelete) {
            await Cart.findByIdAndDelete(cartDelete._id);
        }

        res.redirect('/order-successfull');
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
const offlinepayment = async (req, res) => {
    try {if (req.session.user_id) {
        const userData = await User.findById(req.session.user_id);
        if (userData && userData.is_blocked) {
            return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED});
        }
    } else {
        return res.redirect('/login');
    }
      const userId = req.session.user_id;
      const addressId = req.query.addressId; 
   
      const cartItems = await Cart.find({ userId }).populate('products.productId');
cartItems.forEach(cart => {
console.log(cart.couponId, "Coupon ID for cart");
});
const couponId = cartItems[0]?.couponId || null;
      const totalSum = cartItems.reduce((acc, cart) => acc + cart.total, 0);
    
      const orderProducts = [];
     for (const cart of cartItems) {
        for (const product of cart.products) {
          if (product.productId) {
          
            orderProducts.push({
              productId: product.productId._id,
              quantity: product.quantity,
              productname: product.productId.productname,
              Image: product.productId.image,
              price: product.productId.price,
              couponId: cart.couponId || null 
            });
  
            const productId = product.productId._id;
            const orderedQuantity = product.quantity;
           
            const foundProduct = await products.findById(productId);
            
            if (!foundProduct) {
              throw new Error('Product not found');
            }
  

            foundProduct.stock -= orderedQuantity;
  
            
            await foundProduct.save();
            console.log(`Stock reduced for product ${foundProduct._id} by ${orderedQuantity}`);
          }
        }
      }
  const order = new orderModel({
        userId,
        addressid: addressId,
        products: orderProducts,
        totalAmount: totalSum,
        status: "Paid",
        payment: "Offline payment", 
        couponId
      });
  
      const savedOrder = await order.save();

     
     const cartDelete = await Cart.findOne({userId: userId})
     if(cartDelete){
        await Cart.findByIdAndDelete(cartDelete._id);
     }
      
      res.redirect('/order-successfull');
    } catch (error) {
      console.error('Error placing order:', error);
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
  };
  
  
module.exports={ordersuccess,order,orderview,cancelOrder,orderReturn,orderfailure,walletpayment,offlinepayment};