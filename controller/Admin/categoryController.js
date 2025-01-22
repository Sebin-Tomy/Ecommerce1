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


const insertCategory = async (req, res) => {
    try {
        let { name, description } = req.body;

        name = name.trim();


        const existingCategory = await Category.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
        if (existingCategory) {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const skip = (page - 1) * limit;

            const totalCategories = await Category.countDocuments();
            const categories = await Category.find().skip(skip).limit(limit).sort({_id:-1});
            const totalPages = Math.ceil(totalCategories / limit);

            return res.render('categories', { 
                message: "Duplicate category name. Please choose a different name.", 
                categories, 
                currentPage: page, 
                totalPages, 
                limit, 
                skip 
            });
        }

 
        const category = new Category({ name, description });
        await category.save();

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const totalCategories = await Category.countDocuments();
        const categories = await Category.find().skip(skip).limit(limit).sort({_id:-1});
        const totalPages = Math.ceil(totalCategories / limit);

        res.render('categories', { 
            categories, 
            currentPage: page, 
            totalPages, 
            limit, 
            skip 
        });
    } catch (error) {
        console.error(error);

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const totalCategories = await Category.countDocuments();
        const categories = await Category.find().skip(skip).limit(limit).sort({_id:-1});
        const totalPages = Math.ceil(totalCategories / limit);

        res.render('categories', { 
            message: "An error occurred while creating the category.", 
            categories, 
            currentPage: page, 
            totalPages, 
            limit, 
            skip 
        });
    }
};



const categorylist = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 5; 
        const skip = (page - 1) * limit;

        const totalCategories = await Category.countDocuments(); 
        const categories = await Category.find().skip(skip).limit(limit).sort({_id:-1}); 

        const totalPages = Math.ceil(totalCategories / limit); 

        res.render('categories', { 
            categories, 
            currentPage: page, 
            totalPages, 
            limit, 
            skip 
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};


const categoriesedit = async(req,res)=>
{
try{
    const id = req.params.id
    const categories = await Category.findById(id)
res.render('categories-edit',{categories:categories});
}
catch(error){
    console.log(error.message);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
}}

const updateUsers = async (req, res) => {
    try {
        const id = req.params.id;
        let { name, description } = req.body;
     
        name = name.trim();


        const existingCategory = await Category.findOne({
            name: { $regex: `^${name}$`, $options: "i" }, 
            _id: { $ne: id } 
        });

        if (existingCategory) {
            const category = await Category.findById(id);
            return res.render('categories-edit', {
                categories: category,
                message: 'Category name already exists. Please use a different name.'
            });
        }
      

     
        await Category.findByIdAndUpdate(id, { $set: { name: name.toUpperCase(), description } });
        res.redirect('/admin/categories');
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};


const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
      
    
       
 
        await Category.findByIdAndDelete(id);
        res.sendStatus(STATUS_CODES.SUCCESS);
    } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
        
    }
};

const listCategory = async (req, res) => {
    try {  
        const id = req.params.id;
   
        await Category.findByIdAndUpdate(id, {list: true });
      
        res.sendStatus(STATUS_CODES.SUCCESS);
    } catch (error) {
        console.log(error.message);
        res.sendStatus(STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};
const unlistCategory = async (req, res) => {
    try {
        const id = req.params.id;
        await Category.findByIdAndUpdate(id, { list: false });
        res.sendStatus(STATUS_CODES.SUCCESS);
    } catch (error) {
        console.log(error.message);
        res.sendStatus(STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};

module.exports = {categorylist,insertCategory,categorylist,categoriesedit,updateUsers,deleteCategory,listCategory,unlistCategory}