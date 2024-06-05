const { response } = require('express')
const passport = require('passport')

const passportMiddlwear = strategy =>{
    
    return async (req, res, next) =>{
        const passportAutenticate = passport.authenticate(strategy, function(err, user, info){

            if(err){
                return next(err)
            }
            if(!user){
                return res.status(401).send({
                    error: info && info.message ? info.message : info.toString()
                })
            }
            req.user= user
            next()
        })
        passportAutenticate(req, res, next)
    } 
}

module.exports = passportMiddlwear;