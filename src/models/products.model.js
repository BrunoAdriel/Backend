const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')


const schema = new mongoose.Schema({
    id: Number,
    title: String,
    description: String,
    price: Number,
    thumbnail:String,
    code: Number,
    stock: Number
}) 

schema.plugin(mongoosePaginate)

module.exports = mongoose.model('newProd', schema, 'products')