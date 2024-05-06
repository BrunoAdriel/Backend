const { Router } = require('express')
const router = Router()
const User = require('../models/user.model') 

router.post('/login', async (req, res)=>{
    const {email, password} = req.body
    if(!email || !password){
        return res.status(400).json({error: 'No se ingreso Email o Contraseña!'})
    }
    // verificar si existe el usuario
    const user = await User.findOne({email, password })
    if (!user){
        return res.status(400).json({error: 'Usuario no encontrado!'})
    }
    // crea session si el usuuario existe
    req.session.user = { email, _id: user._id.toString() }
    res.redirect('/')
})

// destrir la session y redirigirlo
router.get('/logout',(req, res)=>{
    req.session.destroy( _ =>{
        res.redirect('/')
    })
})


router.post('/register', async (req, res)=>{
    try{
        const{ firstName, lastName, email, password} = req.body
        const user = await User.create({
            firstName, 
            lastName, 
            email, 
            password
        })
        req.session.user = { email, _id: user._id.toString() }
        res.redirect('/')
    }catch(error){
        return res.status(500).json({error: error})
    }
})

module.exports = router;