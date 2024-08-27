const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    products: [
        {
            id: { type: Number, required: true },
            title: { type: String, required: true },
            description: { type: String, required: true },
            price: { type: Number, required: true },
            thumbnail: { type: String },
            code: { type: String },
            stock: { type: Number },
            quantity: { type: Number, default: 1 }
        }
    ]
});

module.exports = mongoose.model('Cart', cartSchema);
