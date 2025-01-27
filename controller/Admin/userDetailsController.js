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


const userlist = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;

        function escapeRegex(text) {
            return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        }


        const inputLetter = req.query.search || "";

  
        const filter = { is_admin: 0 };

    
        if (inputLetter) {
            const escapedInput = escapeRegex(inputLetter);
            if (inputLetter.length == 1) {
 
                filter.$or = [
                    { name: { $regex: `^${escapedInput}`, $options: "i" } },
                    // { email: { $regex: `^${escapedInput}`, $options: "i" } }
                ];
            } else {
         
                filter.$or = [
                    { name: { $regex: escapedInput, $options: "i" } },
                    { email: { $regex: escapedInput, $options: "i" } }
                ];
            }
        }

 
        const usersData = await User.find(filter).sort({_id:-1})
                                    .skip(skip)
                                    .limit(limit)
                                    .exec();

   
        const totalUsers = await User.countDocuments(filter);
        const totalPages = Math.ceil(totalUsers / limit);

     
        res.render('users', {
            users: usersData,
            currentPage: page,
            totalPages: totalPages,
            limit: limit,
            searchQuery: inputLetter 
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error', { error: "Internal Server Error" });
    }
};


const deleteUser = async(req,res)=>{
    try{
   
        const id = req.params.id;
        await User.findByIdAndDelete(id);
        res.status(200).json({ success: true });
    }
    catch(error)
{
    console.log(error.message)
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
}}
const blockUser = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedUser = await User.findByIdAndUpdate(id, { is_blocked: true }, { new: true });
        
        res.status(200).json({
            message: 'User blocked successfully',
            is_blocked: updatedUser.is_blocked // send the updated status of the user
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Failed to block user' });
    }
};

const unblockUser = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedUser = await User.findByIdAndUpdate(id, { is_blocked: false }, { new: true });
        
        res.status(200).json({
            message: 'User unblocked successfully',
            is_blocked: updatedUser.is_blocked // send the updated status of the user
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Failed to unblock user' });
    }
};



module.exports = {userlist,deleteUser,blockUser,unblockUser}