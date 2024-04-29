const mongoose = require('mongoose')

const collection = 'users'

const schema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    // indicamos que no permita crear 2 ususarios con el mismo email
    email:{
        type: String,
        unique: true
    },
    password: String,
})

module.exports = mongoose.model(collection, schema)