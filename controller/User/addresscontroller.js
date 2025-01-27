const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const user = require('../../models/userModel');
const nodeMailer = require('nodemailer');
const { STATUS_CODES ,MESSAGES} = require('../../constants/constants');
const address = require('../../models/address');
const category = require('../../models/categories');
const {orderModel} = require('../../models/order');
const wishList1  = require('../../models/wishlist');
const coupon = require('../../models/coupon');
const products = require('../../models/productdata');
const { default: mongoose } = require('mongoose');
const cart = require('../../models/cart');

const addAddress = async (req, res) => {
    try {
        res.render('add-address'); 
        } catch (error) {
            console.log(error.message);
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(MESSAGES.INTERNAL_SERVER_ERROR);
        }
    };
    
const insertAddress = async(req, res) => {
        try {
        const { fullName, addressLine1, city, state, postalCode, phoneNumber } = req.body;
        const userId = req.session.user_id;
        
          const address1 = new address({
            userId: userId,
            fullName: fullName,
            addressLine1: addressLine1,
            city: city,
            state: state,
            postalCode: postalCode,
            phoneNumber: phoneNumber
          });
          await address1.save();
      
          res.redirect('/address');
        } catch (error) {
          console.log(error.message);
          res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR); }
      };
    
    const addressList = async(req, res) => {
            try {   const userid = req.session.user_id;
            
                const Address = await address.find({userId:userid});
          
                res.render('address',{address:Address});; 
            } catch (error) {
                console.log(error.message);
                res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error');
            }
        };
    
    const deleteAddress = async (req, res) => {
            try {
                const id = req.params.id;
                await address.deleteOne({ _id: id });
                res.redirect('/address');
                res.sendStatus(STATUS_CODES.SUCCESS);
            } catch (error) {
                console.log(error.message);
                res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error')
            }
        };
    
    const addressEdit = async(req,res)=>
    {try{
    const id = req.params.id
    const address12 = await address.findById(id)
    res.render('edit-address',{address:address12});
    }
    catch(error){
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
    }}
    
    const updateAddress = async(req,res)=>{
    try{
        const id = req.params.id
      
        const catte = await address.findByIdAndUpdate(id,{$set:{fullName:req.body.fullName,phoneNumber:req.body.phoneNumber,addressLine1:req.body.addressLine1,city:req.body.city,state:req.body.state,postalCode:req.body.postalCode}})
       
        res.redirect('/address');  
        }
    catch(error)
        {console.log(error.message)
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
        }}

        const checkAddressEdit = async(req, res) => {
            try{
            const id = req.params.id
            const address12 = await address.findById(id)
            res.render('edit-checkoutadress',{address:address12});
            }
            catch(error){
                console.log(error.message);
            }
        };

const updateCheckedAddress = async(req,res)=>{
            try{
                const id = req.params.id
                
                const catte = await address.findByIdAndUpdate(id,{$set:{fullName:req.body.fullName,phoneNumber:req.body.phoneNumber,addressLine1:req.body.addressLine1,city:req.body.city,state:req.body.state,postalCode:req.body.postalCode}},{new:true})
           
                res.redirect('/checkout');  
                }
            catch(error)
                {console.log(error.message)}
            
            }  
const checkedAddAddress = async (req, res) => {
                try {
                    res.render('add-checkoutadress'); 
                    } catch (error) {
                        console.log(error.message);
                        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(MESSAGES.INTERNAL_SERVER_ERROR);
                    }
                };

const checkAddressInsert = async(req, res) => {
                try{
                    const { fullName, addressLine1, city, state, postalCode, phoneNumber } = req.body;
                   console.log("Request Body:", req.body); 
                   const address2 = new address({
                     fullName: fullName,
                     userId: req.session.user_id,
                     addressLine1: addressLine1,
                     city: city,
                     state: state,
                     postalCode: postalCode,
                     phoneNumber: phoneNumber
                   });
                   await address2.save();
                   console.log(address2);       
                   res.redirect('/checkout');
                }
                catch(error){
                    console.log(error.message);
                    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
                }
            };

module.exports={insertAddress,addressList,addAddress,deleteAddress,addressEdit,updateAddress,checkAddressEdit,updateCheckedAddress,checkedAddAddress,checkAddressInsert};