const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')


const schema = new mongoose.Schema({
    _id: {  type: mongoose.Schema.Types.ObjectId, auto: true },
    id: Number,
    title: String,
    description: String,
    price: Number,
    thumbnail:String,
    code: Number,
    stock: Number
}) 

schema.plugin(mongoosePaginate)

const Product = mongoose.model('Product', schema);

module.exports = {
    Product: Product,
    products: mongoose.model('Product', schema, 'products')
};