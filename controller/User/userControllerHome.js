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



const loginHome = async(req, res) => {
    try {
     

       const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const skip = (page - 1) * limit;

        const sort = req.query.sort || "option"; // Default sort option

        const totalProducts = await Products.countDocuments({list:false});
        const totalPages = Math.ceil(totalProducts / limit);

        const products1 = await Products.find({list:false}).skip(skip).limit(limit);
        const categories = await Category.find({list:false});

        res.render('index1', {
            Products: products1,
            inputLetter: null,
            categories: categories,
            selectedCategory: null,
            currentPage: page,
            totalPages: totalPages,
            limit: limit,
            sortOption: sort, 
        });
    } catch (error) {
        console.log(error.message);
        res.redirect('/login');
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
};



const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        if (!email || !password) {
         
            let message = "Both email and password are required";
            if (!email) message = "Email is required";
            if (!password && !email) message = "Email and password is required"
            if (!password) message = "Password is required";
            res.render('logine1', { message });
            return;
        }
        const userData = await User.findOne({ email: email });
       
        if (!userData) {
            res.render('logine1', { message: "Email is incorrect" });
            return;
        }
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (!passwordMatch) {
            res.render('logine1', { message: "Password is incorrect" });
            return;
        }
        req.session.user_id = userData._id;
        res.redirect("/index1");
    } catch (error) {
        console.log(error.message);
        res.render('logine1', { message: "An error occurred. Please try again." });
    }
};
const searchProduct = async (req, res) => {
    try {
      

        const inputLetter = req.body.search || req.query.search || '';
        const categoryFilter = req.query.category || null;

       
        function escapeRegex(text) {
            return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        }

        let query = { };
        if (inputLetter) {
            const escapedInput = escapeRegex(inputLetter); 
            if (inputLetter.length === 1) {
               
                query.productname = { $regex: `^${escapedInput}`, $options: "i" };
            } else {
         
                query.productname = { $regex: escapedInput, $options: "i" };
            }
        }

        if (categoryFilter) {
            const category = await Category.findOne({ name: categoryFilter.toUpperCase() });
            if (category) {
                query.categoryId = category._id;
            } else {
                query.categoryId = null;
            }
        }

        const sortOption = {};
        const sortCriteria = req.body.sortOption || req.query.sort || "default";

        switch (sortCriteria) {
            case "lowtohigh":
                sortOption.price = 1;
                break;
            case "hightolow":
                sortOption.price = -1;
                break;
            case "alphabeticallyAZ":
                sortOption.productname = 1;
                break;
            case "alphabeticallyZA":
                sortOption.productname = -1;
                break;
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const skip = (page - 1) * limit;

        const totalProducts = await Products.countDocuments({...query,list:false});
        const totalPages = Math.ceil(totalProducts / limit);


        sortOption._id = 1; 
        const products = await Products.find({...query,list:false})
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        const categories = await Category.find({list:false});

        res.render("index1", {
            inputLetter: inputLetter,
            Products: products,
            currentPage: page,
            totalPages: totalPages,
            limit: limit,
            selectedCategory: categoryFilter,
            categories: categories,
            sortOption: sortCriteria,
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred while searching for products." });
    }
};



module.exports={loginHome,verifyLogin,searchProduct};