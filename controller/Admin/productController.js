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


const products = async (req, res) => {
    const page = parseInt(req.query.page) || 1; 
    const perPage = 3; 
    const searchTerm = req.query.search || ""; 

  
    function escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }

    try {
        let searchFilter = {};

   
        if (searchTerm.length === 1) {
            const escapedInput = escapeRegex(searchTerm);
            searchFilter = {
                $or: [
                    { productname: { $regex: `^${escapedInput}`, $options: "i" } },
                    // { description: { $regex: `^${escapedInput}`, $options: "i" } },
                    // { brand: { $regex: `^${escapedInput}`, $options: "i" } },
                    // { color: { $regex: `^${escapedInput}`, $options: "i" } },
                ],
            };
        } else {
           
            searchFilter = {
                $or: [
                    { productname: { $regex: escapeRegex(searchTerm), $options: "i" } },
                    { description: { $regex: escapeRegex(searchTerm), $options: "i" } },
                    { brand: { $regex: escapeRegex(searchTerm), $options: "i" } },
                    { color: { $regex: escapeRegex(searchTerm), $options: "i" } },
                ],
            };
        }

    
        const products1 = await Products.find(searchFilter)
            .populate('categoryId').sort({_id:-1})
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        const totalProducts = await Products.countDocuments(searchFilter);
        const totalPages = Math.ceil(totalProducts / perPage);

      
        res.render('products', { 
            Products: products1,
            currentPage: page,
            totalPages: totalPages,
            search: searchTerm,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};



const addproducts = async (req, res) => {
    try { const category = await Category.find({list:false})
        console.log("Sfasdf",category);
        res.render('add-products',{category:category});
    } catch (error) {
        console.log(error.message);
      }
};

const insertProducts = async (req, res) => {
    try {
        let { category, productname, productprice, brand, color, description, stock } = req.body;
        const files = req.files;
console.log(req.body,"req")
   productname = productname.trim()
        const existingProduct = await Products.findOne({ productname: { $regex: `^${productname}$`, $options: "i" } });
        if (existingProduct) {
            const categories = await Category.find({list:false}); 
            return res.render('add-products', { 
                category: categories, 
                message: 'Product name already exists. Please use a different name.' 
            });
        }
        const categoryDoc = await Category.findById(category);
        console.log(categoryDoc,"cae")
        // Validate images
        const imageNames = [...new Set(files.map(file => file.filename))];
      
        if (imageNames.length%2 == 0) {
            let k = imageNames.length;
            let no = k/2;
            imageNames.splice(no, no); 
        } 
     console.log(imageNames.length,"ASdf")
     
        const prod = new Products({
            productname,
            price: productprice,
            color,
            description,
            image: imageNames,
            brand,
            stock,
            categoryId: categoryDoc._id 
        });
console.log(prod,"roducts")
        await prod.save();
        console.log("Product added successfully");
        res.redirect('/admin/products');
    } catch (error) {
        console.log(error.message);
        const categories = await Category.find(); 
        res.render('add-products', { 
            category: categories, 
            message: 'Failed to add product' 
        });
    }
};




const productsedit = async(req,res)=>
{try{const id = req.params.id
const products = await Products.findById(id).populate('categoryId')
const category = await Category.find({list:false});
res.render('edit-product',{Products:products,category:category});
}
catch(error){
    console.log(error.message);
}
}


const updateproducts = async (req, res) => {
    try {
        console.log(req.body);
        const id = req.params.id;
        let { productname, productprice, brand, material, color, description, dimensions, stock,category } = req.body;
productname = productname.trim()  
       console.log(category,"Adsfsdf");
        const existingProduct = await Products.findOne({ 
            productname: { $regex: `^${productname}$`, $options: "i" }, 
            _id: { $ne: id } 
        });
        if (existingProduct) {
            const categories = await Category.find(); 
            return res.render('edit-product', { 
                category: categories,
                message: 'Product name already exists. Please use a different name.', 
                Products: await Products.findById(id) 
            });
        }
        const categoryDoc = await Category.findById(category);
        console.log(categoryDoc,"Adsgdsgs");
        const imageNames = [];
       
        const oldimage = [req.body.oldimage].flat();
    
        console.log("Old Images:", oldimage);
        if (!(oldimage.includes(undefined))) {
            oldimage.forEach((image) => imageNames.push(image));
          
       
        }
console.log('iamg',imageNames);
        const files = req.files;
        console.log(files,"filess")
          const imageIndices = req.body.imageIndex ? [req.body.imageIndex].flat().map(Number) : [];
        console.log("Image Indices:", imageIndices);
        files.forEach((file) => {
            if (file.fieldname === 'imageundefined') {
              imageNames.push(file.filename);
            }
          });
        console.log('iamg',imageNames);
        if(imageNames.length == 0){
            const products =   await Products.findByIdAndUpdate(id, {
                $set: {image: []  
                },
            });
const category = await Category.find();
            return res.render('edit-product', { 
                Products:await Products.findById(id).populate('categoryId'),category:category,
                message: 'Please insert an image.' 
            });
        }
 console.log("Image Indices:", imageIndices);
        await Products.findByIdAndUpdate(id, {
            $set: {
                productname,
                price: productprice,
                material,
                color,
                description,
                dimensions,
                brand,
                image: imageNames,
                stock,
                categoryId:categoryDoc._id
            },
       
        });
    
        console.log(Products,'products');
        res.redirect('/admin/products');
    } catch (error) {
        console.log(error.message);
        const categories = await Category.find(); 
        res.render('edit-product', { 
            category: categories, 
            message: 'Failed to edit product' 
        });
       
    }
};



const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id; 

        const deletedProduct = await Products.deleteOne({ _id: id });


       
        await Cart.updateMany(
            { "products.productId": id },
            { $pull: { products: { productId: id } } } 
        );

  
        const affectedCarts = await Cart.find({ "products.productId": id });
        for (const cart of affectedCarts) {
            let totalAmount = 0;
            for (const product of cart.products) {
                const pr = await Products.findOne({ _id: product.productId });
                if (pr) {
                    totalAmount += pr.price * product.quantity;
                }
            }
            cart.total = totalAmount;
            await cart.save();
        }
        await wishlist1.deleteMany({ productId: id });
       
        res.sendStatus(STATUS_CODES.SUCCESS);
    } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.INTERNAL_SERVER_ERROR });
    }
};
const listProduct = async (req, res) => {
    try {  
        const id = req.params.id;
       
        await Products.findByIdAndUpdate(id, {list: true });
        console.log(id);
        res.sendStatus(STATUS_CODES.SUCCESS);
    } catch (error) {
        console.log(error.message);
        res.sendStatus(STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};
const unlistProduct = async (req, res) => {
    try {
        const id = req.params.id;
        await Products.findByIdAndUpdate(id, { list: false });
        res.sendStatus(STATUS_CODES.SUCCESS);
    } catch (error) {
        console.log(error.message);
        res.sendStatus(STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};

module.exports = {products,addproducts,insertProducts,productsedit,updateproducts,deleteProduct,listProduct, unlistProduct}