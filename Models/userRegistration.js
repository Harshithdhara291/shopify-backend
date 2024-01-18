const mongoose = require('mongoose');

const userModel = new mongoose.Schema({
    username:{
        type:String,
        trim:true
    },
    email:{
        type:String,
        trim:true,
        unique:true,
    },
    password:{
        type:String,
        trim:true
    }
})

const connectUser = new mongoose.model("users list",userModel);

module.exports = connectUser;