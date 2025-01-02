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
    min_amount: {
        type: Number,
      
    },valid_from: {
        type: String,
      },
    valid_to: {
        type: String,
      },
    coupon: {
        type: [String] 
     },
     
})
const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon    

