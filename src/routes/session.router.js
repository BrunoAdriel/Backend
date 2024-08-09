const { Router } = require('express')
const router = Router()
const User = require('../models/user.model') 
const { hashPassword } = require('../utils/hashing')
const passport = require('passport')
const { generateToken } = require('../utils/jwt')
const  passportMiddlwear  = require('../utils/passport.middlewar')
const { authorizationMiddlewear } = require('../utils/authorizationMiddlewar')



router.post('/login', passport.authenticate('login', { failureRedirect: '/api/sessions/faillogin' }), async (req, res) => {
    try {
        // Como ya es una funcion async aprovecho para que antes de que siga con lo demas actulice la ultima coneccion
        await User.findByIdAndUpdate(req.user._id,{ lastConnection: new Date() });

        // Obtener el rol desde la base de datos
        const user = await User.findById(req.user._id).select('role');

        // Configurar la sesión segun el rol 
        req.session.user = {
            email: req.user.email,
            _id: req.user._id,
            role: user.role
        };

        // Generar el token JWT con la información actualizada del usuario
        const credentials = req.session.user;
        const accessToken = generateToken(credentials);

        // Configurar la cookie con el token
        res.cookie('accessToken', accessToken, { maxAge: 60 * 60 * 1000 });
        res.redirect('/');
    } catch (error) {
        console.error('Error durante el login:', error);
        res.status(500).json({ message: 'Error durante el login' });
    }
});
router.get('/faillogin', (_, res)=>{
    res.send('Error en la pagina de login!')
})


// destrir la session y redirigirlo
router.get('/logout',(req, res)=>{
    req.session.destroy( _ =>{
        res.redirect('/')
    })
})

// Router registro
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

// Conectarse con github
router.get('/github', passport.authenticate('github', {scope:['user:email']}),(req, res)=>{})

router.get('/githubcallback', passport.authenticate('github', {failureRedirect: '/producs'}), (req,res)=>{
    req.session.user ={_id: req.user._id}
    res.redirect('/')
})

router.get('/api/users/current', passportMiddlwear('jwt'), authorizationMiddlewear('user'), async(req,res)=>{
    return res.json(req.user);
});

router.get('/api/users',passportMiddlwear('jwt'),authorizationMiddlewear('admin'),async(_,res)=>{
    try{
        const usersFound = await User.find({},"firstName email role")
        return res.json(usersFound)
    }catch(error){
        console.error(error);
            return res.status(500).json({message: 'Error al encontrar la lista de usuarios'})
        
    }
})

router.delete('/api/users',passportMiddlwear('jwt'),authorizationMiddlewear('admin'), async(_,res)=>{
    try{
        // Calcula el tiempo
        const deleteForInnactivity = new Date(Date.now() - 1 * 60 * 1000)
    
        // Elimina usuarios que no se hayan conectado en ese tiempo
        const result = await User.deleteMany({ lastConnection: { $lt: deleteForInnactivity } })
        
        res.json({ message: `${result.deletedCount} usuarios eliminados`})
    }catch(error){
        console.error('Error eliminando ysyarios inactivos, error');
        res.status(500).json({message:'Error eliminando ysyarios inactivos, error'})
    }
})

module.exports = router;