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

const getCartItems = async (req, res) => {
    try {  if (req.session.user_id) {
       const userData = await User.findById(req.session.user_id);
       if (userData && userData.is_blocked) {
           return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED});
       }
   } else {
       return res.redirect('/login');
   }     const userId = req.session.user_id;
                const s = await Cart.findOne({userId:userId})
             
                   const updatedCart = await Cart.aggregate([
                       { $match: { userId: new mongoose.Types.ObjectId(userId) } },
                       { $unwind: "$products" },
                       {
                           $lookup: {
                               from: "products",
                               localField: "products.productId",
                               foreignField: "_id",
                               as: "productDetails"
                           }
                       },
                       { $unwind: "$productDetails" },
                       {
                           $project: {
                                _id: "$products._id",
                               productId: "$productDetails._id",
                               productName: "$productDetails.productname",
                               productPrice: "$productDetails.price",
                               productDescription: "$productDetails.details",
                               productImage: {
                                   $cond: {
                                       if: { $eq: [{ $isArray: "$productDetails.image" }, true] },
                                       then: { $arrayElemAt: ["$productDetails.image", 0] },
                                       else: null 
                                   }
                               },
                               stock: "$productDetails.stock",
                               quantity: "$products.quantity",
                               size: "$products.size" ,
                               total: "$products.total"
                           }
                       }
                   ]);
     
            res.render('cart',{updatedCart:updatedCart,s:s});
   
    } catch (error) {
                   console.log(error.message);
                   res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error');
                 }
           };
   
   const addToCart = async (req, res) => {
           try {if (req.session.user_id) {
                   const userData = await User.findById(req.session.user_id);
                   if (userData && userData.is_blocked) {
                       return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED});
                   }
               } else {
                   return res.redirect('/login');
               }
              
                   const userId = req.session.user_id;
           
                   const productId = req.body.productId;
                  
                   const quantity = parseInt(req.body.quantity);
                   const size = req.body.size;
                
                   let saveData = await Cart.findOne({ userId: userId });
                
                   const pr1 = await products.findOne({ _id: productId });
        if (!saveData) {
                    const pr = await products.findOne({ _id: productId });
                    if (!pr) {
                       return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: 'Product not found.' });
                   } if (quantity > pr.stock || quantity>10) {
                       return res.json({
                           success: false,
                           message: 'Item cannot be added to the cart.'
                       });
                   }
                      
                       let sub = pr.price * quantity;
               
                       saveData = new Cart({
                           userId: userId,
                           products: [{
                               productId: productId,
                               size: size,
                               quantity: quantity
                           }],
                           total: sub
                       });
                       // pr.stock -= quantity;
                       // console.log(pr.stock,"adfsadf")
                
                       await saveData.save();
                    
                   } else {
                       const existingProductIndex = saveData.products.findIndex(item => item.productId.toString() === productId);
                       if (existingProductIndex !== -1) {
                           const existingProduct = saveData.products[existingProductIndex];
                       
                           if (existingProduct.quantity + quantity > pr1.stock || existingProduct.quantity + quantity > 10 ) {
                               return res.json({
                                   success: false,
                                   message: 'Item cannot be added to the cart.'
                               });
                           }
                           saveData.products[existingProductIndex].quantity += quantity;
                         
                       } else {
                           if (quantity > pr1.stock || quantity>10) {
                               return res.json({
                                   success: false,
                                   message: 'Item cannot be added to the cart.'
                               });
                           }
                           saveData.products.push({
                               productId: productId,
                               size: size,
                               quantity: quantity
                           });
                       }
                      let totalAmount = 0;
                       for (const product of saveData.products) {
                           const pr = await products.findOne({ _id: product.productId });
                           totalAmount += pr.price * product.quantity;
                       }
                       saveData.total = totalAmount;
                  
       
                       await saveData.save();
                    
                   }
               
                
                  res.json({ success: true, message: 'Item added to cart successfully.' });
               } catch (error) {
                   console.log(error);
                   res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.INTERNAL_SERVER_ERROR });
               }
           };
           
           const deleteCart = async (req, res) => {
               try {
                   const itemId = req.params.itemId; 
                   const userId = req.session.user_id; 
                   
                
                   const cart = await Cart.findOne({ userId: userId });
                   if (!cart) {
                       return res.status(404).send("Cart not found");
                   }
           
                   const productToRemove = cart.products.find(product => product._id.toString() === itemId);
                   if (!productToRemove) {
                       return res.status(404).send("Product not found in cart");
                   }
           
                
                   const productDetails = await Products.findById(productToRemove.productId);
                   if (!productDetails) {
                       return res.status(404).send("Product not found in inventory");
                   }
           
                   const priceReduction = productDetails.price * productToRemove.quantity;
           
               
                   await Cart.updateOne(
                       { userId: userId },
                       {
                           $pull: { products: { _id: itemId } },
                           $inc: { total: -priceReduction },
                       }
                   );
           
                   res.sendStatus(200);
               } catch (error) {
                   console.log(error.message);
                   res.status(500).send("Internal Server Error");
               }
           };
const updateQuantity = async(req,res)=>{
            try {if (req.session.user_id) {
                const userData = await User.findById(req.session.user_id);
                if (userData && userData.is_blocked) {
                    return res.render('logine1', { message:MESSAGES.ACCOUNT_BLOCKED });
                }
            } else {
                return res.redirect('/login');
            }
                const quantity = Number(req.query.quantity);
                const productId = req.query.pid;
              
                const userId = req.session.user_id;
                let saveData = await Cart.findOne({ userId: userId });
                    const existingProductIndex = saveData.products.findIndex(item => item.productId.toString() === productId);
                    if (existingProductIndex !== -1) {
                        saveData.products[existingProductIndex].quantity = quantity;
                    } else {
                        saveData.products.push({
                            productId: productId,
                            size: size,
                            quantity: quantity
                        });
                    }
                    let totalAmount = 0;
                    for (const product of saveData.products) {
                        const pr = await products.findOne({ _id: product.productId });
                        totalAmount += pr.price * product.quantity;
                    }
                    saveData.total = totalAmount;
                    await saveData.save();
                
           } catch (error) {
                console.log(error);
                res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
            }
        }
        const productdetails = async(req,res)=>{
            try{ if (req.session.user_id) {
                const userData = await User.findById(req.session.user_id);
                if (userData && userData.is_blocked) {
                    return res.render('logine1', { message: MESSAGES.ACCOUNT_BLOCKED });
                }
            } else {
                return res.redirect('/login');
            }const productId = req.params.productId;
                 const product = await Products.findById(productId);
                res.render('product-details', {Product: product });
                            }
                    catch(error){
                     console.log(error.message);  
                     res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR); 
                     }}
            
module.exports={getCartItems,addToCart,deleteCart,updateQuantity,productdetails};