const mongoose = require("mongoose");
const { payment } = require("../controller/usercontroller");

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
addressid: {
    type: String,
  },
method: {
    type: String,
  },
products: {
    type: [
      {
        type: Object,
        default: function () {
          return { is_returned: false };
        },
      },
    ],
    required: true,
  },
totalAmount: { type: Number,  },
orderDate: { type: Date, default: Date.now },
status: {
    type: String,
enum: [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
      "returns",
      "Paid"
    ],
    default: "Pending",
  },
is_cancelled: {
    type: Boolean,
    default: false,
  },
 cancelReason: {
    type: String,
  },
  payment:{
    type: String
  },
  createdAt: { type: Date, default: Date.now },
});
const orderModel = mongoose.model("order", orderSchema);

module.exports ={orderModel};