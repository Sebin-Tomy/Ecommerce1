const bycrypt = require('bcrypt');
const { STATUS_CODES,MESSAGES } = require('../constants/constants');
const User = require('../models/userModel');
const Category = require('../models/categories');
const Products = require('../models/productdata');
const { MongoError } = require('mongodb');
const {orderModel} = require('../models/order')
const address = require('../models/address');
const coupon1 = require('../models/coupon');
const wallet = require('../models/Wallet')
const offer12 = require('../models/offer')
const Cart  = require('../models/cart');
const wishlist1  = require('../models/wishlist');
const securePasword = async(password)=>{
    try{
        const passwordHash = await bycrypt.hash(password,10);
        return passwordHash;
    }catch(error){
       console.log(error.message);
    }
}
Products.findById();

const loadLogin = async(req,res)=>
{
try{
res.render('login');
}
catch(error){
    console.log(error.message);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
}
}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        console.log(email, password, userData);
        if (!email || !password) {
            let message = "Both email and password are required";
            if (!email) message = "Email is required";
            if (!password) message = "Password is required";
            if (!password && !email) message = "Email and password is required"
            res.render('login', { message });
            return;
        }

        
        if (!userData) {
            res.render('login', { message: "Email is incorrect" });
            return;
        }
        
        const passwordMatch = await bycrypt.compare(password, userData.password);
        if (!passwordMatch) {
            res.render('login', { message: "Password is incorrect" });
            return;
        }
        
        if (userData.is_admin === 0) {
            res.render('login', { message: "Email and password are invalid" });
            return;
        }
        
        req.session.user_id = userData._id;
        res.redirect("/admin/home");
    } catch (error) {
        console.log(error.message);
    }
};

const loadDashboard = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id });

        
        const topProducts = await orderModel.aggregate([
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.productId",
                    totalQuantity: { $sum: "$products.quantity" },
                    productName: { $first: "$products.productname" },
                    productImage: { $first: "$products.Image" },
                    productPrice: { $first: "$products.price" },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
        ]);

        const topProductsByCategory = await orderModel.aggregate([
            { $unwind: "$products" },
            {
                $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },
            { $unwind: "$productDetails" },
            {
                $group: {
                    _id: "$productDetails.category",
                    topProducts: {
                        $push: {
                            productId: "$products.productId",
                            productName: "$products.productname",
                            productImage: "$products.Image",
                            productPrice: "$products.price",
                            totalQuantity: "$products.quantity",
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    topProducts: { $slice: ["$topProducts", 10] },
                },
            },
        ]);

        const monthlySalesData = await orderModel.aggregate([
            {
                $group: {
                    _id: { $month: "$orderDate" },
                    totalSales: { $sum: "$totalAmount" },
                },
            },
            { $sort: { "_id": 1 } },
        ]);

        const monthlySalesLabels = [];
        const monthlySales = [];
        monthlySalesData.forEach((month) => {
            const monthName = new Date(2000, month._id - 1).toLocaleString("default", { month: "short" });
            monthlySalesLabels.push(monthName);
            monthlySales.push(month.totalSales.toFixed(2));
        });
        console.log("Monthly Sales Data:", monthlySalesData);
  
        const years = [2020, 2021, 2022, 2023, 2024];

const yearlySalesData = await orderModel.aggregate([
    {
        $group: {
            _id: { $year: "$orderDate" },
            totalSales: { $sum: "$totalAmount" },
        },
    },
    { $sort: { "_id": 1 } }, 
]);


const yearlySalesMap = new Map(yearlySalesData.map(item => [item._id, item.totalSales]));
const filledYearlySalesData = years.map(year => ({
    year,
    totalSales: yearlySalesMap.get(year) || 0, 
}));

const yearlySalesLabels = filledYearlySalesData.map(item => item.year);
const yearlySales = filledYearlySalesData.map(item => item.totalSales);

        res.render("home", {
            admin: userData,
            topProducts,
            topProductsByCategory,
            monthlySalesLabels,
            monthlySalesData,
            yearlySalesLabels,
            yearlySales,
        });
    } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render("error").send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
};



const logout = async(req,res)=>{
    try{
        req.session.destroy()
        res.redirect('/admin')
        console.log("hi");
    }
    catch(error){
        console.log(error.message);
        res.redirect('/admin');
    }
}

const userlist = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8; 
        const skip = (page - 1) * limit;

        const usersData = await User.find({ is_admin: 0 })
                                    .skip(skip)
                                    .limit(limit)
                                    .exec();

        const totalUsers = await User.countDocuments({ is_admin: 0 });
        const totalPages = Math.ceil(totalUsers / limit);
        console.log("hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"+page);
        res.render('users', {
            users: usersData,
            currentPage: page,
            totalPages: totalPages,
            limit: limit
        });
    } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
};


const deleteUser = async(req,res)=>{
    try{
        console.log('hi')
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
        console.log(id)
        await User.findByIdAndUpdate(id, {is_blocked: true });
        console.log(id);
        res.sendStatus(STATUS_CODES.SUCCESS);
    } catch (error) {
        console.log(error.message);
        res.sendStatus(STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};

const unblockUser = async (req, res) => {
    try {
        const id = req.params.id;
        await User.findByIdAndUpdate(id, { is_blocked: false });
        res.sendStatus(STATUS_CODES.SUCCESS);
    } catch (error) {
        console.log(error.message);
        res.sendStatus(STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};

const insertCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const category = new Category({
            name: name,
            description: description
        });

        await category.save();

        if (category) {
            const categories = await Category.find();
            res.render('categories', { categories });
        } else {
            res.render('categories', { message: "Your addition of categories has failed." });
        }
    } catch (error) {
        let errorMessage = "An error occurred while creating the category.";
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name === 1) {
            errorMessage = "Duplicate category name. Please choose a different name.";
        } else {
            console.log(error);
        }
        const categories = await Category.find();
        res.render('categories', { message: errorMessage, categories });
    }
};


const categorylist = async (req, res) => {
try { const categories = await Category.find();
            res.render('categories', { categories: categories }); 
        } catch (error) {
            console.log(error.message);
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(MESSAGES.INTERNAL_SERVER_ERROR);
        } };

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
        const { name, description } = req.body;

      
        const existingCategory = await Category.findOne({  name: name.toUpperCase(), _id: { $ne: id } });
     
        if (existingCategory) {
            const category = await Category.findById(id);
            return res.render('categories-edit', { 
                categories: category, 
                message: 'Category name already exists. Please use a different name.' 
            });
        }

        // Update the category if no conflict
        await Category.findByIdAndUpdate(id, { $set: { name, description } });
        res.redirect('/admin/categories');
    } catch (error) {
        console.log(error.message);
      
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
};


const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        console.log('the deleted category');
    
        //  await Products.deleteMany({categoryId:id})
 
        await Category.findByIdAndDelete(id);
        res.sendStatus(STATUS_CODES.SUCCESS);
    } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
        
    }
};

const products = async (req, res) => {
const page = parseInt(req.query.page) || 1;
const perPage = 6; 
 try {
        const products1 = await Products.find().populate('categoryId')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
       
      const totalProducts = await Products.countDocuments();
      const totalPages = Math.ceil(totalProducts / perPage);
       res.render('products', { 
            Products: products1,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(MESSAGES.INTERNAL_SERVER_ERROR); 
    }
};

const addproducts = async (req, res) => {
    try { const category = await Category.find()
        console.log("Sfasdf",category);
        res.render('add-products',{category:category});
    } catch (error) {
        console.log(error.message);
      }
};

const insertProducts = async (req, res) => {
    try {
        const { category, productname, productprice, brand, color, description, stock } = req.body;
        const files = req.files;
console.log(req.body,"req")
   
        const existingProduct = await Products.findOne({ productname: { $regex: `^${productname}$`, $options: "i" } });
        if (existingProduct) {
            const categories = await Category.find(); 
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
const category = await Category.find();
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
        const { productname, productprice, brand, material, color, description, dimensions, stock,category } = req.body;

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


const order = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 5; 
        const skip = (page - 1) * limit; 
        const totalOrders = await orderModel.countDocuments();
        const orders = await orderModel.find().sort({ orderDate: -1 }) .skip(skip).limit(limit);
        const totalPages = Math.ceil(totalOrders / limit);



        res.render('orders', { 
            order1: orders, 
            currentPage: page, 
            totalPages: totalPages, 
            limit: limit 
        });
    } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
};


const orderview1 = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        console.log("hi") ;
        const order = await orderModel.findById(orderId).populate('products.productId').populate('userId').populate('addressid'); 
        const user = await User.findById(order.userId)
        const Address = await address.findById(order.addressid)
        res.render('orderview1', { order,user,Address });  
    } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
};

const updateOrderStatus = async (req, res) => {
    try {console.log('hi');
        const orderId = req.params.orderId; 
        const { status } = req.body; 
       await orderModel.findByIdAndUpdate(orderId, { status });
console.log(orderId);
        res.redirect(`/admin/order?orderId=${orderId}`); 
    } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);
    }
};

const orderReturn1 = async (req, res) => {
    try {
        console.log("enter into order return");
        const { orderId } = req.body;
        console.log(orderId, "orderiddd");
        const update = await orderModel.findByIdAndUpdate(
            { _id: orderId },
            { status: "returns" },
            { new: true }
        );
        await update.save();
        let wallet2 = await wallet.findOne({ userId: update.userId });
                    if (!wallet2) {
                      wallet2 = new wallet({ userId: update.userId });
                    }
                    wallet2.totalAmount += update.totalAmount;
                    wallet2.refund.push({ productId: update._id, amount: update.totalAmount });
                    await wallet2.save();
                   console.log("wallesf",wallet2);
        res.json({ success: true, message: "Approval request sent." });
    } catch (error) {
        console.log(error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.INTERNAL_SERVER_ERROR});
    }
};

const coupon = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 5; 
        const skip = (page - 1) * limit;

        const totalCoupons = await coupon1.countDocuments();
        const couponcode = await coupon1.find().skip(skip).limit(limit);

        res.render('coupon', {
            coup: couponcode,
            currentPage: page,
            totalPages: Math.ceil(totalCoupons / limit),
            totalCoupons,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).render('error', { message: "Internal Server Error" });
    }
};


const addcoupon = async (req, res) => {
    try {
         const couponcode = await coupon1.find()
         res.render('add-coupon',{coup: couponcode});

  } catch (error) {
        console.log(error.message);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send('Internal Server Error');
    }
};

const insertcoupon = async (req, res) => {
    try {
        const { couponCode, discount_amount, min_amount } = req.body;

      
        const existingCoupon = await coupon1.findOne({ couponCode: couponCode });

        if (existingCoupon) {
     
            return res.render('add-coupon', { message: 'Please use a different coupon code. This one already exists.' });
        }

       
        const coupon = new coupon1({
            min_amount: min_amount,
            couponCode: couponCode,
            discount_amount: discount_amount,
        });

        await coupon.save();
        console.log(coupon, "Coupon added successfully");
        res.redirect('/admin/coupon');

    } catch (error) {
        console.error(error.message);
        res.render('add-coupon', { message: 'Failed to add coupon' });
    }
};


const deleteCoupon = async (req, res) => {
        try {
            const id = req.params.id;
            await coupon1.findByIdAndDelete(id);
            res.sendStatus(STATUS_CODES.SUCCESS);
        } catch (error) {
            console.log(error.message);
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send('Internal Server Error');
            }
    };

const salesreport = async (req, res) => {
        try {
            const orders = await orderModel.find();
            const totalOrders = orders.length; 
            const overallOrderAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0); 
            const coupons = await coupon1.find(); 
            const totalDiscountAmount = coupons.reduce((sum, coupon) => sum + coupon.discount_amount, 0); 
    
            res.render('sales-report', {
                orders: orders,
                totalOrders: totalOrders,
                overallOrderAmount: overallOrderAmount,
                totalDiscountAmount: totalDiscountAmount 
            });
        } catch (error) {
            console.log(error.message);
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('error').send(MESSAGES.INTERNAL_SERVER_ERROR);   
        }
    };
    
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
            const offers = await offer12.find().skip(skip).limit(limit);
    
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

module.exports = {loadLogin,verifyLogin,securePasword,loadDashboard,logout,userlist,deleteUser,blockUser,unblockUser,categorylist,insertCategory,categorylist,categoriesedit,updateUsers,deleteCategory,products,addproducts,insertProducts,productsedit,updateproducts,deleteProduct,order,orderview1,updateOrderStatus,orderReturn1,coupon,addcoupon,insertcoupon,deleteCoupon,salesreport,offer2,insertoffer,addoffer,deleteoffer}