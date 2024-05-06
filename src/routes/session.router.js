const { Router } = require('express')
const router = Router()
const User = require('../models/user.model') 

router.post('/login', async (req, res)=>{
    console.log(req.body)
    const {email, password} = req.body
    if(!email || !password){
        return res.status(400).json({error: 'No se ingreso Email o Contraseña!'})
    }
    // verificar si existe el usuario
    const user = await User.findOne({email, password })
    if (!user){
        return res.status(400).json({error: 'Usuario no encontrado!'})
    }
    req.session.user = { email, _id: user._id.toString() }
    res.redirect('/')
})

router.post('/register', (req, res)=>{
    console.log(req .body)



    res.redirect('/')
})

module.exports = router;