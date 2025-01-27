const bycrypt = require('bcrypt');
const { STATUS_CODES,MESSAGES } = require('../../constants/constants');
const user = require('../../models/userModel');
const category = require('../../models/categories');
const Products = require('../../models/productdata');
const { mongoError } = require('mongodb');
const {orderModel} = require('../../models/order')
const address = require('../../models/address');
const coupon1 = require('../../models/coupon');
const wallet = require('../../models/Wallet')
const offer12 = require('../../models/offer')
const cart  = require('../../models/cart');
const wishList1  = require('../../models/wishlist');
const moment = require('moment');

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
        const userData = await user.findOne({ email: email });
        // console.log(email, password, userData);
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
        
        req.session.admin_id = userData._id;
     
        res.redirect("/admin/home");
    } catch (error) {
        console.log(error.message);
    }
};

const loadDashboard = async (req, res) => {
    try {
        const userData = await user.findById({ _id: req.session.admin_id });

        
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
  
        const years = [2020, 2021, 2022, 2023, 2024,2025];

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
      
        delete req.session.admin_id;
        res.redirect('/admin')
   
    }
    catch(error){
        console.log(error.message);
        res.redirect('/admin');
    }
}






module.exports = {loadLogin,verifyLogin,securePasword,loadDashboard,logout}