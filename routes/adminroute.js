const express = require("express");
const admin_route = express();
const session = require("express-session");
const config = require("../config/config");
admin_route.use(session({ secret: config.sessionSecret }));
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
const adminController = require("../controller/admincontroller");
admin_route.get("/", auth.isLogout, adminController.loadLogin);
admin_route.post("/logi", adminController.verifyLogin);
admin_route.get("/home", auth.isLogin, adminController.loadDashboard);
admin_route.get("/logout", auth.isLogin, adminController.logout);
admin_route.get("/users", auth.isLogin, adminController.userlist);
admin_route.get("/delete-user", auth.isLogin, adminController.deleteUser);
// Route to block user
admin_route.patch("/block-user/:id", auth.isLogin, adminController.blockUser);
// Route to unblock user
admin_route.patch(
  "/unblock-user/:id",
  auth.isLogin,
  adminController.unblockUser
);
admin_route.get("/categories", auth.isLogin, adminController.categorylist);
admin_route.post("/categories", auth.isLogin, adminController.insertCategory);
admin_route.get(
  "/categories-edit/:id",
  auth.isLogin,
  adminController.categoriesedit
);
admin_route.post(
  "/categories-edit/:id",
  auth.isLogin,
  adminController.updateUsers
);
admin_route.get(
  "/categories-delete/:id",
  auth.isLogin,
  adminController.deleteCategory
);
// products
admin_route.get("/products", auth.isLogin, adminController.products);
admin_route.get("/add-products", auth.isLogin, adminController.addproducts);
admin_route.post(
  "/add-products",
  auth.isLogin,
  upload.any("image"),
  adminController.insertProducts
);
admin_route.get(
  "/edit-product/:id",
  auth.isLogin,
  adminController.productsedit
);
admin_route.post(
  "/edit-product/:id",
  auth.isLogin,
  upload.any("image"),
  adminController.updateproducts
);
admin_route.get(
  "/products-delete/:id",
  auth.isLogin,
  adminController.deleteProduct
);
admin_route.get("/order", auth.isLogin, adminController.order);
admin_route.get("/order-view", auth.isLogin, adminController.orderview1);
admin_route.post(
  "/update-order-status/:orderId",
  adminController.updateOrderStatus
);
admin_route.patch("/submitReturn1", auth.isLogin, adminController.orderReturn1);
admin_route.get("/coupon", auth.isLogin, adminController.coupon);
admin_route.get("/add-coupon", auth.isLogin, adminController.addcoupon);
admin_route.post("/add-coupon", auth.isLogin, adminController.insertcoupon);
admin_route.get(
  "/coupon-delete/:id",
  auth.isLogin,
  adminController.deleteCoupon
);
admin_route.get("/salesreport", auth.isLogin, adminController.salesreport);
admin_route.get("/offer", auth.isLogin, adminController.offer2);
admin_route.get("/add-offer", auth.isLogin, adminController.addoffer);
admin_route.post("/offer", auth.isLogin, adminController.insertoffer);
admin_route.get(
  "/offer-delete/:id",
  auth.isLogin,
  adminController.deleteoffer
);
admin_route.get("*", function (req, res) {
  res.redirect("/admin");
});
module.exports = admin_route;
