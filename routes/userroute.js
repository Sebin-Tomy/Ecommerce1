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
user_route.get('/',userController.loginLoadin);
user_route.post('/google-login',userController.google);
user_route.get('/login',auth.isLogout,userController.loginLoadin);
user_route.post('/login',homepage.verifyLogin);
user_route.get('/index1',auth.isLogin,auth.is_blocked,homepage.loginHome);
user_route.post('/index1',auth.isLogin,auth.is_blocked,homepage.loginHome);
user_route.get('/changepassword',userController.changepass)
user_route.post('/changepassword',userController.updatePassword);
user_route.get('/registerOtp',otp.registerOtp)
user_route.get('/forgot',userController.forgotspass)
user_route.post('/forgot',userController.handleForgotPass)
user_route.get('/forgot/otp',otp.forgotpassotp); 
user_route.get('/forgotregisterOtp', otp.forgotregisterOtp); 
user_route.post('/registerOtp1',otp.verifyRegister1)
user_route.post('/registerOtp',otp.verifyRegister)
user_route.post('/Resendotp', otp.resendOtp);
user_route.get('/logout',auth.isLogin,auth.is_blocked,userController.logout)
user_route.post('/logout',auth.isLogin,auth.is_blocked,userController.logout)
user_route.get('/user',auth.isLogin,auth.is_blocked,profiledetails.userdetails)
user_route.get('/user-edit/:id',auth.isLogin,auth.is_blocked,profiledetails.useredit)
user_route.post('/user-edit/:id',auth.isLogin,auth.is_blocked,profiledetails.updateUsers)
// address
user_route.get('/address',auth.isLogin,auth.is_blocked,addressController.addresslist)
user_route.get('/add-address',auth.isLogin,auth.is_blocked,addressController.addaddress)
user_route.post('/add-address',auth.isLogin,auth.is_blocked,addressController.insertaddress)
//delete address
user_route.get('/delete-address/:id',auth.isLogin,auth.is_blocked,addressController.deleteAddress);
//edit address
user_route.get('/edit-address/:id',auth.isLogin,auth.is_blocked,addressController.addressedit);
user_route.post('/edit-address/:id',auth.isLogin,auth.is_blocked,addressController.updateaddress);
user_route.get('/product/:productId',auth.isLogin,auth.is_blocked,userCartController.productdetails)
user_route.get('/cart',auth.isLogin,auth.is_blocked,userCartController.getCartItems)
user_route.post('/addToCart',auth.isLogin, auth.is_blocked,userCartController.addToCart); 
user_route.delete("/delete-cart/:itemId",auth.isLogin,auth.is_blocked,userCartController.deleteCart)
user_route.get('/checkout',auth.isLogin,auth.is_blocked,userCouponController.checkout);
user_route.get('/edit-checkoutaddress/:id',auth.isLogin,auth.is_blocked,addressController.checkaddressedit);
user_route.post('/edit-checkoutaddress/:id',auth.isLogin,auth.is_blocked,addressController.updatecheckedaddress);
user_route.get('/add-checkoutaddress/',auth.isLogin,auth.is_blocked,addressController.checkedaddaddress);
user_route.get('/payment',auth.isLogin,auth.is_blocked,payment.payment);
user_route.post('/payOnline',auth.isLogin,auth.is_blocked,paymentController.payOnline);
user_route.post('/update-quantity',auth.isLogin,auth.is_blocked,userCartController.updateQuantity)
user_route.get('/order-successfull',auth.isLogin, auth.is_blocked,(req, res) => {
    res.render('ordersuccess');
});
user_route.post('/order-successfull',auth.isLogin,auth.is_blocked,userOrderController.offlinepayment);
user_route.get('/order',auth.isLogin,auth.is_blocked,userOrderController.order);
user_route.get('/order-view',auth.isLogin,auth.is_blocked,userOrderController.orderview);
user_route.post('/add-checkoutaddress/',auth.isLogin,auth.is_blocked,addressController.checkaddressinsert);
user_route.get("/search", auth.isLogin,auth.is_blocked, homepage.searchProduct);

user_route.post("/search",auth.isLogin,auth.is_blocked,homepage.searchProduct);
user_route.post('/order/cancel/:orderId', auth.isLogin,auth.is_blocked,userOrderController.cancelOrder);
user_route.post('/wishlist',auth.isLogin,auth.is_blocked,wishListController.wishlist)
user_route.get('/wishlistpage',auth.isLogin,auth.is_blocked,wishListController.wishlistpage)
user_route.get('/delete-wishlist/:id',auth.isLogin,auth.is_blocked,wishListController.deleteWish);
user_route.get('/online-payment',auth.isLogin,auth.is_blocked,userOrderController.ordersuccess);
user_route.patch('/submitReturn',auth.isLogin,auth.is_blocked,userOrderController.orderReturn);
user_route.get("/wallet",auth.isLogin,auth.is_blocked,wallet.wallet1);
user_route.post('/applyCoupon',auth.isLogin,auth.is_blocked,userCouponController.applycoupon);
user_route.post('/removeCoupon',auth.isLogin,auth.is_blocked,userCouponController.removecoupon);
user_route.get('/failed-payment',auth.isLogin,auth.is_blocked,userOrderController.orderfailure);
user_route.post('/payOnline1',auth.isLogin,auth.is_blocked,paymentController.payOnline1);
user_route.get('/order1',auth.isLogin,auth.is_blocked,userOrderController.order);
user_route.post('/wallet-payment',auth.isLogin,auth.is_blocked,userOrderController.walletpayment);
// user_route.get("*", function (req, res) {
//     res.redirect("/login");
//   });
module.exports = user_route; 