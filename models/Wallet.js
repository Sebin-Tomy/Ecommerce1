const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const walletSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true  
    },
    refund: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'order' 
        },
        amount: {
            type: Number,
        },
        status: { type: String },
    }],
    totalAmount: {
        type: Number,
        default: 0
    }
}, { timestamps: true }); 


module.exports = mongoose.model('wallet', walletSchema);
