const mongoose = require('mongoose')

const collection = 'users'

const schema = new mongoose.Schema({
    // indicamos a mongoose que nuestros docmentos "user" tendra campos de tipo string
    firstName: String,
    lastName: String,

    // indicamos que no permita crear 2 ususarios con el mismo email
    email:{
        type: String,
        unique: true
    }
})

// exportamos la collecion y la clase constructora
module.exports = mongoose.model(collection, schema)