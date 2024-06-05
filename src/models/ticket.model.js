const mongoose = require('mongoose')


const schema = new mongoose.Schema({
    Code: Number,
    Amount: Number,
    Status: String,
    Date:Number,
    Purchaser:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    Products:{
        type: mongoose.Schema.Types.Array,
        ref: 'Product'
    }
})

module.exports= mongoose.model('Ticket', schema, 'tickets')