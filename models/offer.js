
const mongoose=require("mongoose")

const couponSchema = new mongoose.Schema({
    offer:{
        type:String,
        
    },
    category:{
        type: String,
    
    },
    productname:{
        type: String,
}
});


module.exports = mongoose.model('offer',couponSchema)