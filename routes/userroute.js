const express = require('express');
const user_route = express();
const session = require("express-session");
const config = require("../config/config");
user_route.use(session({
    secret:  "user_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 } // 1 hour
}));
user_route.set('view engine','ejs')
user_route.set('views','./views/users')
const auth  = require("../middleware/userAuth");
const bodyParser = require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}))
user_route.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});
const userController  = require("../controller/User/usercontroller");
const paymentController = require("../controller/paymentcontroller")
const addressController = require("../controller/User/addresscontroller")
const userCouponController = require("../controller/User/usercouponcontroller");
const userOrderController = require('../controller/User/userOrderController');
const userCartController = require('../controller/User/userCartController')
const wishListController = require("../controller/User/wishlistController");
const profiledetails = require("../controller/User/profileDetailsController");
const homepage = require('../controller/User/userControllerHome');
const otp = require('../controller/User/otpController');
const payment = require("../controller/User/userPaymentController");
const wallet = require('../controller/User/userWalletController');
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,path.join(__dirname,'../public/userImages'));
    },
    filename:function(req,file,cb){
      const name = Date.now()+'-'+file.originalname;
      cb(null,name);
    }
})
const upload = multer({storage:storage});
user_route.get('/Loadregister',userController.loginregister);
user_route.post('/register',otp.insertUser);
user_route.get('/',auth.isLogout,userController.loginLoadin);
user_route.post('/google-login',userController.google);
user_route.get('/login',auth.isLogout,userController.loginLoadin);
user_route.post('/login',homepage.verifyLogin);
user_route.get('/index1',auth.isLogin,homepage.loginHome);
user_route.post('/index1',auth.isLogin,homepage.loginHome);
user_route.get('/changepassword',userController.changepass)
user_route.post('/changepassword', userController.updatePassword);
user_route.get('/registerOtp',otp.registerOtp)
user_route.get('/forgot',userController.forgotspass)
user_route.post('/forgot',userController.handleForgotPass)
user_route.get('/forgot/otp', otp.forgotpassotp); 
user_route.get('/forgotregisterOtp', otp.forgotregisterOtp); 
user_route.post('/registerOtp1',otp.verifyRegister1)
user_route.post('/registerOtp',otp.verifyRegister)
user_route.post('/Resendotp', otp.resendOtp);
user_route.get('/logout',auth.isLogin,userController.logout)
user_route.post('/logout',auth.isLogin,userController.logout)
user_route.get('/user',auth.isLogin,profiledetails.userdetails)
user_route.get('/user-edit/:id',auth.isLogin,profiledetails.useredit)
user_route.post('/user-edit/:id',auth.isLogin,profiledetails.updateUsers)
// address
user_route.get('/address',auth.isLogin,addressController.addresslist)
user_route.get('/add-address',auth.isLogin,addressController.addaddress)
user_route.post('/add-address',auth.isLogin,addressController.insertaddress)
//delete address
user_route.get('/delete-address/:id',auth.isLogin,addressController.deleteAddress);
//edit address
user_route.get('/edit-address/:id',auth.isLogin,addressController.addressedit);
user_route.post('/edit-address/:id',auth.isLogin,addressController.updateaddress);
user_route.get('/product/:productId',auth.isLogin,userCartController.productdetails)
user_route.get('/cart',auth.isLogin,userCartController.getCartItems)
user_route.post('/addToCart',auth.isLogin, userCartController.addToCart); 
user_route.delete("/delete-cart/:itemId",auth.isLogin,userCartController.deleteCart)
user_route.get('/checkout',auth.isLogin,userCouponController.checkout);
user_route.get('/edit-checkoutaddress/:id',auth.isLogin,addressController.checkaddressedit);
user_route.post('/edit-checkoutaddress/:id',auth.isLogin,addressController.updatecheckedaddress);
user_route.get('/add-checkoutaddress/',auth.isLogin,addressController.checkedaddaddress);
user_route.get('/payment',auth.isLogin,payment.payment);
user_route.post('/payOnline',auth.isLogin,paymentController.payOnline);
user_route.post('/update-quantity',auth.isLogin,userCartController.updateQuantity)
user_route.get('/order-successfull',auth.isLogin, (req, res) => {
    res.render('ordersuccess');
});
user_route.post('/order-successfull',auth.isLogin,userOrderController.offlinepayment);
user_route.get('/order',auth.isLogin,userOrderController.order);
user_route.get('/order-view',auth.isLogin,userOrderController.orderview);
user_route.post('/add-checkoutaddress/',auth.isLogin,addressController.checkaddressinsert);
user_route.get("/search", auth.isLogin, homepage.searchProduct);

user_route.post("/search",auth.isLogin,homepage.searchProduct);
user_route.post('/order/cancel/:orderId', auth.isLogin,userOrderController.cancelOrder);
user_route.post('/wishlist',auth.isLogin,wishListController.wishlist)
user_route.get('/wishlistpage',auth.isLogin,wishListController.wishlistpage)
user_route.get('/delete-wishlist/:id',auth.isLogin,wishListController.deleteWish);
user_route.get('/online-payment',auth.isLogin,userOrderController.ordersuccess);
user_route.patch('/submitReturn',auth.isLogin,userOrderController.orderReturn);
user_route.get("/wallet",auth.isLogin,wallet.wallet1);
user_route.post('/applyCoupon',auth.isLogin,userCouponController.applycoupon);
user_route.post('/removeCoupon',auth.isLogin,userCouponController.removecoupon);
user_route.get('/failed-payment',auth.isLogin,userOrderController.orderfailure);
user_route.post('/payOnline1',auth.isLogin,paymentController.payOnline1);
user_route.get('/order1',auth.isLogin,userOrderController.order);
user_route.post('/wallet-payment',auth.isLogin,userOrderController.walletpayment);
// user_route.get("*", function (req, res) {
//     res.redirect("/login");
//   });
module.exports = user_route; 