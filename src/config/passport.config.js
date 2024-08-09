const passport = require('passport')
const { Strategy } = require('passport-local')
const User = require('../models/user.model')
const hashUtils = require('../utils/hashing')
const { generateToken } = require('../utils/jwt')

const initializePassportStrategy  = () =>{
// configurar metodo register de passport
    passport.use('register', new Strategy({
        passReqToCallback: true,
        usernameField:'email'
    }, async (req, username, password, done)=>{

        const { firstName, lastName, email} = req.body
        try{
            const user = await User.findOne({email: username})
            if(user){
                // espacio de error por si el usuario ya existe
                return done(null, false)
            }
            const newUser = {
                firstName,
                lastName,
                email,
                password: hashUtils.hashPassword(password),
                role:"user"
            }
            const result = await User.create(newUser)
            // usuario nuevo creado exitosamente
            return done(null, result)
        }catch(error){
            // error inesperado
            done(error)
        }
    }))

    passport.use('login',new Strategy({
        usernameField: 'email'
    }, async(username, password, done)=>{
        try{    
            if(!username || !password){
            return done( null, false)
            }
            // verificar si existe el usuario
            const user = await User.findOne({email: username })
            if (!user){
                return done(null, false)
            }
            // validar password
            if(!hashUtils.isValidPassword(password, user.password)){
                return done(null, false)
            }
            const credentials = {id: user._id.toString(), email: user.email}
            const accessToken = generateToken(credentials)
            // console.log(accessToken)
            return done(null, user)
    }catch(error){
        done(error)
        }
    }))

    passport.serializeUser((user, done)=>{
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done)=>{
        const user = await User.findById(id)
        done(null, user)
    })
}
module.exports = initializePassportStrategy 