const {USER, PUBLIC, ADMIN} = require('../policies/policies.constants')
module.exports = { 
    authorizationMiddlewear : (role) =>{
        return(req, res, next)=>{
            if(!req.user){
                return res.status(401).send({error: 'el usuario debe autenticarse!'})
            }
            if(!req.user.role || req.user.role !== role){
                return res.status(403).send({error: 'el usuario necesita permisos!'})
            }
            next()
        }
    },

//middlewear de autenticacion
    handlePolicies: (policies) => {
        return (req, res, next) => {
            if(policies [0] === PUBLIC ){
                return next()
            }
            return res.status(401).send({ status: 'error', message: 'Unautthorized'})
        }
    }
}