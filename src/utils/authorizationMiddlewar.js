const authorizationMiddlewear  = role =>{
    return(req, res, next)=>{
        if(!req.user){
            return res.status(401).send({error: 'el usuario debe autenticarse!'})
        }
        if(!req.user.role || req.user.role !== role){
            return res.status(403).send({error: 'el usuario necesita permisos!'})
        }
        next()
    }
}

module.exports = authorizationMiddlewear