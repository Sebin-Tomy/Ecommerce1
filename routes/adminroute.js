const express = require("express");
const admin_route = express();
const session = require("express-session");
const config = require("../config/config");
admin_route.use(session({
  secret:  "admin_secret_key",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // 1 hour
}));

const bodyParser = require("body-parser");
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));
admin_route.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/userImages"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});
const upload = multer({ storage: storage });
admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");
const auth = require("../middleware/adminauth");
const adminController = require("../controller/Admin/admincontroller");
const adminOrder = require("../controller/Admin/adminOrderController");
const productController = require("../controller/Admin/productController");
const userDetails = require("../controller/Admin/userDetailsController");
const categoryController = require("../controller/Admin/categoryController");
const offer = require("../controller/Admin/offerController");
const salesReport = require("../controller/Admin/salesReportController");
const couponController = require("../controller/Admin/couponController");
admin_route.get("/", auth.isLogout, adminController.loadLogin);
admin_route.post("/logi", adminController.verifyLogin);
admin_route.get("/home", auth.isLogin, adminController.loadDashboard);
admin_route.get("/logout", adminController.logout);
admin_route.get("/users", auth.isLogin, userDetails.userlist);
admin_route.delete("/delete-user/:id", auth.isLogin, userDetails.deleteUser);

admin_route.patch("/block-user/:id", auth.isLogin, userDetails.blockUser);
admin_route.patch(
  "/unblock-user/:id",
  auth.isLogin,
  userDetails.unblockUser
);
admin_route.get("/categories", auth.isLogin, categoryController.categorylist);
admin_route.post("/categories", auth.isLogin, categoryController.insertCategory);
admin_route.get(
  "/categories-edit/:id",
  auth.isLogin,
  categoryController.categoriesedit
);
admin_route.post(
  "/categories-edit/:id",
  auth.isLogin,
  categoryController.updateUsers
);
admin_route.delete(
  "/categories-delete/:id",
  auth.isLogin,
  categoryController.deleteCategory
);

admin_route.get("/products", auth.isLogin, productController.products);
admin_route.get("/add-products", auth.isLogin, productController.addproducts);
admin_route.post(
  "/add-products",
  auth.isLogin,
  upload.any("image"),
  productController.insertProducts
);
admin_route.get(
  "/edit-product/:id",
  auth.isLogin,
  productController.productsedit
);
admin_route.post(
  "/edit-product/:id",
  auth.isLogin,
  upload.any("image"),
  productController.updateproducts
);
admin_route.delete(
  "/products-delete/:id",
  auth.isLogin,
  productController.deleteProduct
);
admin_route.get("/order", auth.isLogin, adminOrder.order);
admin_route.get("/order-view", auth.isLogin, adminOrder.orderview1);
admin_route.post(
  "/update-order-status/:orderId",
  adminOrder.updateOrderStatus
);
admin_route.patch("/submitReturn1", auth.isLogin, adminOrder.orderReturn1);
admin_route.get("/coupon", auth.isLogin, couponController.coupon);
admin_route.get("/add-coupon", auth.isLogin, couponController.addcoupon);
admin_route.post("/add-coupon", auth.isLogin, couponController.insertcoupon);
admin_route.delete(
  "/coupon-delete/:id",
  auth.isLogin,
  couponController.deleteCoupon
);
admin_route.get("/salesreport", auth.isLogin, salesReport.salesreport);
admin_route.get("/offer", auth.isLogin, offer.offer2);
admin_route.get("/add-offer", auth.isLogin, offer.addoffer);
admin_route.post("/offer", auth.isLogin, offer.insertoffer);
admin_route.delete(
  "/offer-delete/:id",
  auth.isLogin,
  offer.deleteoffer
);

admin_route.patch("/list-category/:id", auth.isLogin, categoryController.listCategory);
admin_route.patch(
  "/unlist-category/:id",
  auth.isLogin,
  categoryController.unlistCategory
);
admin_route.patch("/list-product/:id", auth.isLogin, productController.listProduct);
admin_route.patch(
  "/unlist-product/:id",
  auth.isLogin,
  productController.unlistProduct
);
admin_route.get("*", function (req, res) {
  res.redirect("/admin");
});
module.exports = admin_route;
