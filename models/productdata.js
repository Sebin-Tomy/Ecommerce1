const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  productname: { type: String,  trim: true,uppercase: true,unique:true},
  price: { type: Number,  min: 0, trim: true },
  material: { type: String, uppercase: true },
  color: { type: String, uppercase: true },
  stock: { type: Number,  min: 0 },
  details: { type: String },
  brand: { type: String },
  image: [{ type: String }],
  description:{ type: String },
  category:{type: String},
  offer:{
   type:Boolean,
    default:false
},  
  offerPercentage:{
  type:String,
  default:"nil"
}
  });
const products = mongoose.model("products", productSchema);
module.exports = products;
