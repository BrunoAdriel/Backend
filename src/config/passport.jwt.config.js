const passport = require("passport")
const { Strategy, ExtractJwt } =require('passport-jwt')
const { secret } = require('../utils/jwt')


const cookieExtractor = req => req && req.cookies ? req.cookies['accessToken']: null

const initializeJWTStrategy = () => {
    passport.use('jwt', new Strategy({
        secretOrKey: secret,
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor])
    },
    async (jwtPayload, done) => {
        try {
            // Verificar si el usuario tiene los permisos necesarios para acceder a la ruta
            if (jwtPayload && jwtPayload.email && jwtPayload._id) {
                // Si el usuario tiene los datos necesarios, pasa al siguiente middleware
                return done(null, jwtPayload);
            } else {
                // Si el usuario no tiene los datos necesarios, devuelve Unauthorized
                return done(null, false, { message: 'Unauthorized' });
            }
        } catch (error) {
            return done(error);
        }
    }));
};
module.exports = initializeJWTStrategy;
