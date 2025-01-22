const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function () {
            return !this.isGoogleUser; 
        },
    },
    is_admin: {
        type: Number,
        required: true,
        
    },
    phone: {
        type: Number,
        required: function () {
            return !this.isGoogleUser; 
        },
   
    },
    coupon: {
        type: [String]
    },
    is_blocked: {
        type: Boolean,
        default: false
    },
    referral: {
        type: String
    },
    reference: {
        type: String
    }, isReferenceUsed: { type: Boolean, default: false },
    image: [
        {
            type: String
        }
    ],
    isGoogleUser: {
        type: Boolean,
        default: false 
    }
});

const User = mongoose.model("user", userSchema);
module.exports = User;
