const mongoose = require('mongoose')


const schema = new mongoose.Schema({
    Code: Object,
    Amount: Number,
    Status: String,
    Date:Number,
    Purchaser:{
        type: mongoose.Schema.Types.String,
        ref: 'User'
    },
    Products:{
        type: mongoose.Schema.Types.Array,
        ref: 'Product'
    }
})

module.exports= mongoose.model('Ticket', schema, 'tickets')