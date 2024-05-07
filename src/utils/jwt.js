const jwt = require('jsonwebtoken')

const PRIVATE_KEY = "ol0pñ9ik8jmu7yhnb64fgrt53edw2"



    const generateToken = credentials => {
        const token = jwt.sign(credentials, PRIVATE_KEY, { expiresIn: '24h' })
        return token
    }

    const verifyToken = (req,  res, next) => {
        const authHeader = req.headers.authorization
        if(!authHeader){
            return res.status(401).json({error: 'Token no encontrado'})
        }

        const [ , token] = authHeader.split(' ')
        jwt.verify(token, PRIVATE_KEY, (err, credentials) => {
            if(err){
                return res.status(403).json({ error: 'Token Invalido!'})
            }
            req.authUser = credentials
            next()
        })
    }

module.exports = { generateToken,  verifyToken,  secret: PRIVATE_KEY}