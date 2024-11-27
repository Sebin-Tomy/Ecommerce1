const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    unique:true,
    uppercase:true
},
  description: {
    type: String,
    unique:false,
  }
});

const Category = mongoose.model("Category", CategorySchema);

module.exports = Category;