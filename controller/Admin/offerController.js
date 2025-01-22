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

    
    
const addoffer = async (req, res) => {
    try {
        const category = await Category.find();
        const product = await Products.find()
        res.render('add-offer', { category,product });  
    } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
};

const offer2 = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 5; 
        const skip = (page - 1) * limit;

        const totalOffers = await offer12.countDocuments(); 
        const offers = await offer12.find().skip(skip).limit(limit).sort({_id:-1});

        res.render('offer', {
            offers,
            currentPage: page,
            totalPages: Math.ceil(totalOffers / limit),
            totalOffers,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error', { message: "Internal Server Error" });
    }
};

const insertoffer = async (req, res) => {
try { 
    const { category, productname, offer } = req.body;
    const offerPercentage = parseInt(offer);
   if (!category && !productname) {
        return res.send('<script>alert("Please select either a category or a product"); window.history.back();</script>');
    }
   let existingOffer;
    if (category) {
        existingOffer = await offer12.findOne({ category });
    } else if (productname) {
        existingOffer = await offer12.findOne({ productname });
    }

    if (existingOffer) {
         const category = await Category.find();
        const product = await Products.find()
       return res.render('add-offer', { category,product,message:"Offer for this category/products exists" });  
    }

    const offer1 = new offer12({
        offer: offer,
        category: category || null,
        productname: productname || null,
    });
    await offer1.save();

    if (category) {
        const products = await Products.find({ category });
        for (const product of products) {
            if (!product.originalPrice) {
                product.originalPrice = product.price; 
            }
            product.offer = true;
            product.price = Math.round(product.price * (1 - offerPercentage / 100));
            product.offerPercentage = offerPercentage;
            await product.save();
            console.log("Modified product:", product);
        }
    } else if (productname) {
        const product = await Products.findOne({ productname });
        if (product) {
            if (!product.originalPrice) {
                product.originalPrice = product.price; 
            }
            product.offer = true;
            product.price = Math.round(product.price * (1 - offerPercentage / 100));
            product.offerPercentage = offerPercentage;
            await product.save();
            console.log("Modified product:", product);
        }
    }
    

    res.redirect("/admin/offer");

} catch (error) {
    console.log(error.message);
    res.render('add-offer', { message: 'Failed to add offer' });
}
};
const deleteoffer = async (req, res) => {
try {
    const id = req.params.id;

  
    const offer = await offer12.findById(id);
    if (!offer) {
        return res.status(STATUS_CODES.NOT_FOUND).send('Offer not found');
    }

   
    await offer12.deleteOne({ _id: id });

    if (offer.category) {
      
        const products = await Products.find({ category: offer.category });
        for (const product of products) {
            if (product.originalPrice) {
                product.price = product.originalPrice; 
                product.originalPrice = null; 
            }
            product.offer = false;
            product.offerPercentage = 0;
            await product.save();
        }
    } else if (offer.productname) {
        const product = await Products.findOne({ productname: offer.productname });
        if (product && product.originalPrice) {
            product.price = product.originalPrice;
            product.originalPrice = null; 
            product.offer = false;
            product.offerPercentage = 0;
            await product.save();
        }
    }

    res.sendStatus(STATUS_CODES.SUCCESS);
} catch (error) {
    console.error("Error deleting offer:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send('Failed to delete offer');
}
};

module.exports = {offer2,insertoffer,addoffer,deleteoffer}