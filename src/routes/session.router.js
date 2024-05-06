const { Router } = require('express')
const router = Router()
const User = require('../models/user.model') 
const { hashPassword } = require('../utils/hashing')
const passport = require('passport')

router.post('/login', passport.authenticate('login', {failureRedirect: '/api/sessions/faillogin'}), async (req, res)=>{
    // crea session si el usuuario existe
    req.session.user = { email: req.user.email, _id: req.user._id }
    res.redirect('/')
})
router.get('/faillogin', (_, res)=>{
    res.send('Error en la pagina de login!')
})

// destrir la session y redirigirlo
router.get('/logout',(req, res)=>{
    req.session.destroy( _ =>{
        res.redirect('/')
    })
})


router.post('/register', passport.authenticate('register', {failureRedirect: '/api/sessions/failregister'}), async (req, res)=>{
    console.log('usuario!', req.user)
    res.redirect('/')
})

// redirect en caso de falla
router.get('/failregister', (_, res)=>{
    res.send('Error en la pagina de registro!')
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