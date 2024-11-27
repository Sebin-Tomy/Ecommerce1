const mongoose = require("mongoose");
const addressSchema = new mongoose.Schema({
userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
},
fullName: {
    type: String,
  
  },
addressLine1: {
    type: String,

  },
addressLine2: {
    type: String,
  },
city: {
    type: String,
  
  },
state: {
    type: String,
    
  },
postalCode: {
    type: String,
    
  },
phoneNumber: {
    type: String,

  },
});
const addressModel = mongoose.model("address", addressSchema);
module.exports = addressModel;