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
        }
    }],
    totalAmount: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('wallet', walletSchema);
