const mongoose = require('mongoose');

const productModel = new mongoose.Schema({
    title:{
        type:String,
        trim:true,
        require:true
    },
    description:{
        type:String,
        trim:true,
        require:true
    },category:{
        type:String,
        trim:true,
        require:true
    },
    price:{
        type:String,
        trim:true,
        require:true
    },image:{
        type:String,
        trim:true,
        require:true
    },
    rating:{
        type:String,
        trim:true,
        require:true
    }
})

const product = new mongoose.model("product",productModel);

module.exports = product;
