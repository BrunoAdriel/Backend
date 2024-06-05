const mongoose = require('mongoose')


const schema = new mongoose.Schema({
    _id: {  type: mongoose.Schema.Types.ObjectId, auto: true }, 
    Code: Object,
    Amount: Number,
    Status: String,
    Date:{ type: Date, default: Date.now },
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