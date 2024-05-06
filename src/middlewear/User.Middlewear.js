module.exports = {

    userIsLoggedIn: (req, res, next)=>{
        // chekear si el usuario esta loggeado
        const isLoggedIn = ! [null,undefined].includes(req.session.user)
        if(!isLoggedIn){
            return res.status(401).json({error: 'Debes ingresar al tu usuario primero!'})
        }
        next()
    },
    userIsNotLoggedIn: (req, res, next)=>{
        const isLoggedIn = ! [null,undefined].includes(req.session.user)
        if(isLoggedIn){
            return res.status(401).json({error: 'No debes de tener una sesion iniciada!'})
        }
        next()
    }
}