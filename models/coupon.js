const mongoose=require("mongoose")
const couponSchema=new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
          ref:"users"
    },
    name:{
        type:String
    },
    couponCode: {
        type: String,
        unique: true
    },
    discount_amount: {
        type: Number
        
    },
    valid_from: {
        type: String,
        required: true
    },
    valid_to: {
        type: String,
        required: true
    },
    coupon: {
        type: [String] 
     },
     
})
const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon    

