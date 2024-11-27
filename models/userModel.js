const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
 name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{type:Number,required:true},
    phone: {
        type:Number,  required:true
    },
    coupon: {
        type: [String] 
     },
    is_blocked:{
        type:Boolean,
        default:0  },
        referral:{
            type : String
        },
 reference:{
    type: String
 }
});
const user = mongoose.model('user',userSchema);
module.exports = user;