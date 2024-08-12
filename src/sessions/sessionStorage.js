const MongoStorage = require('connect-mongo')
const session = require('express-session')
// const default

const storage = MongoStorage.create({
    dbName:'sessionStorage',
    mongoUrl: process.env.MONGODB_URI,
    ttl: 120
})

module.exports =session({
    store: storage,
    resave: false, // Evita guardar sesiones no modificadas en el almacén
    saveUninitialized: false, // Evita guardar sesiones no inicializadas
    secret: 'your-secret-key' // Clave secreta para firmar la cookie de sesión
});