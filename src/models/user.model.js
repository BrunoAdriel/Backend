const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    role: String,
    // indicamos que no permita crear 2 ususarios con el mismo email
    email:{
        type: String,
        unique: true
    },
    password: String,
})

module.exports = mongoose.model('User', schema, 'users')