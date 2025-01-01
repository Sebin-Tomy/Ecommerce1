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
const userController  = require("../controller/usercontroller");
const paymentController = require("../controller/paymentcontroller")
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
user_route.post('/register',userController.insertUser);
user_route.get('/',auth.isLogout,userController.loginLoadin);
user_route.post('/google-login',userController.google);
user_route.get('/login',auth.isLogout,userController.loginLoadin);
user_route.post('/login',userController.verifyLogin);
user_route.get('/index1',auth.isLogin,userController.loginHome);
user_route.post('/index1',auth.isLogin,userController.loginHome);
user_route.get('/changepassword',userController.changepass)
user_route.post('/changepassword', userController.updatePassword);
user_route.get('/registerOtp',userController.registerOtp)
user_route.get('/forgot',userController.forgotspass)
user_route.post('/forgot',userController.handleForgotPass)
user_route.get('/forgot/otp', userController.forgotpassotp); 
user_route.get('/forgotregisterOtp', userController.forgotregisterOtp); 
user_route.post('/registerOtp1',userController.verifyRegister1)
user_route.post('/registerOtp',userController.verifyRegister)
user_route.post('/Resendotp', userController.resendOtp);
user_route.get('/logout',auth.isLogin,userController.logout)
user_route.get('/user',auth.isLogin,userController.userdetails)
user_route.get('/user-edit/:id',auth.isLogin,userController.useredit)
user_route.post('/user-edit/:id',auth.isLogin,userController.updateUsers)
// address
user_route.get('/address',auth.isLogin,userController.addresslist)
user_route.get('/add-address',auth.isLogin,userController.addaddress)
user_route.post('/add-address',auth.isLogin,userController.insertaddress)
//delete address
user_route.get('/delete-address/:id',auth.isLogin,userController.deleteAddress);
//edit address
user_route.get('/edit-address/:id',auth.isLogin,userController.addressedit);
user_route.post('/edit-address/:id',auth.isLogin,userController.updateaddress);
user_route.get('/product/:productId',auth.isLogin,userController.productdetails)
user_route.get('/cart',auth.isLogin,userController.getCartItems)
user_route.post('/addToCart',auth.isLogin, userController.addToCart); 
user_route.delete("/delete-cart/:itemId",auth.isLogin,userController.deleteCart)
user_route.get('/checkout',auth.isLogin,userController.checkout);
user_route.get('/edit-checkoutaddress/:id',auth.isLogin,userController.checkaddressedit);
user_route.post('/edit-checkoutaddress/:id',auth.isLogin,userController.updatecheckedaddress);
user_route.get('/add-checkoutaddress/',auth.isLogin,userController.checkedaddaddress);
user_route.get('/payment',auth.isLogin,userController.payment);
user_route.post('/payOnline',auth.isLogin,paymentController.payOnline);
user_route.post('/update-quantity',auth.isLogin,userController.updateQuantity)
user_route.get('/order-successfull',auth.isLogin, (req, res) => {
    res.render('ordersuccess');
});
user_route.post('/order-successfull',auth.isLogin,userController.ordersuccess);
user_route.get('/order',auth.isLogin,userController.order);
user_route.get('/order-view',auth.isLogin,userController.orderview);
user_route.post('/add-checkoutaddress/',auth.isLogin,userController.checkaddressinsert);
user_route.get("/search", auth.isLogin, userController.searchProduct);

user_route.post("/search",auth.isLogin,userController.searchProduct);
user_route.post('/order/cancel/:orderId', auth.isLogin,userController.cancelOrder);
user_route.post('/wishlist',auth.isLogin,userController.wishlist)
user_route.get('/wishlistpage',auth.isLogin,userController.wishlistpage)
user_route.get('/delete-wishlist/:id',auth.isLogin,userController.deleteWish);
user_route.get('/online-payment',auth.isLogin,userController.ordersuccess);
user_route.patch('/submitReturn',auth.isLogin,userController.orderReturn);
user_route.get("/wallet",auth.isLogin,userController.wallet1);
user_route.post('/applyCoupon',auth.isLogin,userController.applycoupon);
user_route.post('/removeCoupon',auth.isLogin,userController.removecoupon);
user_route.get('/failed-payment',auth.isLogin,userController.orderfailure);
user_route.post('/payOnline1',auth.isLogin,paymentController.payOnline1);
user_route.get('/order1',auth.isLogin,userController.order);
user_route.post('/wallet-payment',auth.isLogin,userController.walletpayment);
// user_route.get("*", function (req, res) {
//     res.redirect("/login");
//   });
module.exports = user_route; 