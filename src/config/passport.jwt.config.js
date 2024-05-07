const passport = require("passport")
const { Strategy, ExtractJwt } =require('passport-jwt')
const { secret } = require('../utils/jwt')


const cookieExtractor = req => req && req.cookies ? req.cookies['accessToken']: null

const initializeJWTStrategy = () =>{

    passport.use('jwt', new  Strategy({
        secretOrKey: secret,
        jwtFromRequest:ExtractJwt.fromExtractors([cookieExtractor]) //configura passport para que use la  funcion cookieExtractor
    }, 
    async(jwtPayload , done)=>{
        try{
            console.log(jwtPayload.user);
            return done(null, jwtPayload.user)
            
        }catch(error){
            done(error)
        }
    }))
}
module.exports = initializeJWTStrategy;
