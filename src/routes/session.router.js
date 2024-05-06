const { Router } = require('express')
const router = Router()
const User = require('../models/user.model') 
const { hashPassword, isValidPassword } = require('../utils/hashing')

router.post('/login', async (req, res)=>{
    const {email, password} = req.body
    if(!email || !password){
        return res.status(400).json({error: 'No se ingreso Email o Contraseña!'})
    }
    // verificar si existe el usuario
    const user = await User.findOne({email})
    if (!user){
        return res.status(401).json({error: 'Usuario no encontrado!'})
    }
    // validar password
    if(!isValidPassword(password, user.password)){
        return res.status(401).json({error: 'Contraseña invalida!'})
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
            password: hashPassword(password)
        })
        req.session.user = { email, _id: user._id.toString() }
        res.redirect('/')
    }catch(error){
        return res.status(500).json({error: error})
    }
})


//Cambio de contraseña
router.post('/reset_password', async (req, res)=>{
    const {email, password}= req.body
    // chekear que lo enviado sea valido
    if(!email || !password){
        return res.status(400).json({error: 'No se ingreso Email o Contraseña!'})
    }
    // verificar si existe el usuario
    const user = await User.findOne({email})
    if (!user){
        return res.status(400).json({error: 'Usuario no encontrado!'})
    }

    // actualizar la nueva contraseña
    await User.updateOne({email},{$set: {password: hashPassword(password)} })
    res.redirect('/')
}) 

module.exports = router;