const mongoose = require("mongoose")
const cartSchema = new mongoose.Schema({
userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        },
    products:[{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products"
           },
        quantity: {
            type: Number,
            required:true
        },
        size:{
            type:String,
            required:true
        },
    }],
total:{
        type:Number,
},  
coupon: {
    type: String,
    default: "Not Applied" 
},
couponId: {
    type: String
},
discountAmount: {
    type: String,
    default: "0"
},
createdAt:{
        type:Date,
        default:Date.now()
}})
module.exports = mongoose.model("cart",cartSchema)